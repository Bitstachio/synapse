import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CreateFrameworkDto } from "./dto/create-framework.dto";
import { UpdateFrameworkDto } from "./dto/update-framework.dto";
import { FrameworkRevisionsService } from "./framework-revisions.service";
import { normalizeContentToNewShape } from "./revision-enrichment";
import { Framework } from "./schemas/framework.schema";
import type { RequestUser } from "../auth/decorators/user.decorator";

@Injectable()
export class FrameworksService {
  constructor(
    @InjectModel(Framework.name) private frameworkModel: Model<Framework>,
    private revisionsService: FrameworkRevisionsService,
  ) {}

  private async recordRevision(
    action: "created" | "updated" | "deleted" | "activated",
    framework: { _id: unknown; name: string; version: string; content?: Record<string, unknown> },
    userId: string,
    options?: {
      previousContent?: Record<string, unknown>;
      newContent?: Record<string, unknown>;
    },
  ): Promise<void> {
    await this.revisionsService.record({
      action,
      frameworkId: String(framework._id),
      frameworkName: framework.name,
      frameworkVersion: framework.version,
      userId,
      previousContent: options?.previousContent,
      newContent: options?.newContent ?? framework.content,
    });
  }

  async create(createFrameworkDto: CreateFrameworkDto, user?: RequestUser): Promise<Framework> {
    try {
      const newFramework = new this.frameworkModel(createFrameworkDto);
      const saved = await newFramework.save();
      if (user?.sub) {
        await this.recordRevision("created", saved, user.sub, {
          newContent: saved.content as Record<string, unknown>,
        });
      }
      return saved;
    } catch (error) {
      // Handle MongoDB unique constraint error (e.g., duplicate version)
      if (this.isMongoDuplicateKeyError(error))
        throw new ConflictException(`Framework version ${createFrameworkDto.version} already exists`);

      throw error;
    }
  }

  private isMongoDuplicateKeyError(error: unknown): error is { code: 11000 } {
    if (typeof error !== "object" || error === null) return false;
    const withCode = error as { code?: unknown };
    return withCode.code === 11000;
  }

  private isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  private isFrameworkLike(value: unknown): value is Record<string, unknown> {
    if (!this.isObject(value)) return false;
    return (
      value._id != null &&
      typeof value.name === "string" &&
      typeof value.version === "string" &&
      typeof value.isActive === "boolean" &&
      this.isObject(value.content)
    );
  }

  /**
   * Supports both shapes currently found in Mongo:
   * 1) direct framework docs
   * 2) wrapper docs: { data: [framework...], meta: {...} }
   */
  private extractFrameworksFromDoc(doc: unknown): Record<string, unknown>[] {
    if (!this.isObject(doc)) return [];

    if (this.isFrameworkLike(doc)) {
      return [doc];
    }

    const wrapped: unknown = (doc as { data?: unknown }).data;
    if (!Array.isArray(wrapped)) return [];

    return wrapped.filter((item): item is Record<string, unknown> => this.isFrameworkLike(item));
  }

  private normalizeFrameworkLike(doc: Record<string, unknown>): Record<string, unknown> {
    const normalized: Record<string, unknown> = { ...doc };
    const rawId = normalized._id;
    if (rawId instanceof Types.ObjectId || typeof rawId === "string" || typeof rawId === "number") {
      normalized._id = rawId.toString();
    }
    if (this.isObject(normalized.content)) {
      const next = normalizeContentToNewShape(normalized.content);
      if (next) normalized.content = next;
    }
    return normalized;
  }

  private toObjectId(id: string): Types.ObjectId | null {
    return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : null;
  }

  private async updateLegacyWrappedFramework(
    id: string,
    updatePayload: Omit<UpdateFrameworkDto, "lastKnownUpdatedAt">,
    lastKnownUpdatedAt?: string,
  ): Promise<Record<string, unknown> | null> {
    const objectId = this.toObjectId(id);
    const lookup = objectId ? { "data._id": { $in: [objectId, id] } } : { "data._id": id };
    const legacyDoc = await this.frameworkModel.collection.findOne(lookup);
    if (!legacyDoc || !this.isObject(legacyDoc)) return null;

    const wrappedData: unknown = (legacyDoc as { data?: unknown }).data;
    if (!Array.isArray(wrappedData)) return null;

    const frameworkIndex = wrappedData.findIndex((item) => {
      if (!this.isObject(item)) return false;
      const itemId = item._id;
      if (itemId instanceof Types.ObjectId) return itemId.toString() === id;
      if (typeof itemId === "string" || typeof itemId === "number") return itemId.toString() === id;
      return false;
    });
    if (frameworkIndex < 0) return null;

    const currentFramework: unknown = wrappedData[frameworkIndex];
    if (!this.isObject(currentFramework) || !this.isFrameworkLike(currentFramework)) return null;

    if (lastKnownUpdatedAt) {
      const currentUpdatedAt = currentFramework.updatedAt;
      const currentUpdatedAtIso =
        currentUpdatedAt instanceof Date
          ? currentUpdatedAt.toISOString()
          : typeof currentUpdatedAt === "string"
            ? new Date(currentUpdatedAt).toISOString()
            : null;
      if (currentUpdatedAtIso !== null && currentUpdatedAtIso !== new Date(lastKnownUpdatedAt).toISOString()) {
        throw new ConflictException("The framework was modified by another user. Please refresh and submit again.");
      }
    }

    const nextFramework: Record<string, unknown> = {
      ...currentFramework,
      ...updatePayload,
      updatedAt: new Date().toISOString(),
    };
    wrappedData[frameworkIndex] = nextFramework;

    await this.frameworkModel.collection.updateOne({ _id: legacyDoc._id }, { $set: { data: wrappedData } });
    return this.normalizeFrameworkLike(nextFramework);
  }

  async update(
    id: string,
    updateFrameworkDto: UpdateFrameworkDto,
    user?: RequestUser,
  ): Promise<Record<string, unknown>> {
    const { lastKnownUpdatedAt, ...updatePayload } = updateFrameworkDto as UpdateFrameworkDto & {
      lastKnownUpdatedAt?: string;
    };

    const queryOptions = { new: true, runValidators: true } as const;
    let previousContent: Record<string, unknown> | undefined;

    if (user?.sub) {
      const oldDoc = await this.frameworkModel.findById(id).lean().exec();
      if (oldDoc?.content) {
        previousContent = oldDoc.content as Record<string, unknown>;
      } else {
        const existing = await this.findOne(id);
        const content = existing.content;
        if (this.isObject(content)) previousContent = content;
      }
    }

    let updated: Framework | null;

    if (lastKnownUpdatedAt) {
      updated = await this.frameworkModel
        .findOneAndUpdate({ _id: id, updatedAt: new Date(lastKnownUpdatedAt) }, updatePayload, queryOptions)
        .exec();
      if (!updated) {
        const current = await this.frameworkModel.findById(id).exec();
        if (!current) throw new NotFoundException("Framework not found");
        throw new ConflictException("The framework was modified by another user. Please refresh and submit again.");
      }
    } else {
      updated = await this.frameworkModel.findByIdAndUpdate(id, updatePayload, queryOptions).exec();
    }

    if (!updated) {
      const legacyUpdated = await this.updateLegacyWrappedFramework(id, updatePayload, lastKnownUpdatedAt);
      if (!legacyUpdated) throw new NotFoundException("Framework not found");
      if (user?.sub) {
        const newContent = legacyUpdated.content;
        await this.revisionsService.record({
          action: "updated",
          frameworkId: String(legacyUpdated._id),
          frameworkName: String(legacyUpdated.name),
          frameworkVersion: String(legacyUpdated.version),
          userId: user.sub,
          previousContent,
          newContent: this.isObject(newContent) ? newContent : undefined,
        });
      }
      return legacyUpdated;
    }

    if (user?.sub) {
      const newContent = updated.content as Record<string, unknown>;
      await this.recordRevision("updated", updated, user.sub, {
        previousContent,
        newContent: newContent && typeof newContent === "object" ? newContent : undefined,
      });
    }
    return this.normalizeFrameworkLike(updated.toObject() as Record<string, unknown>);
  }

  async findAll(): Promise<Record<string, unknown>[]> {
    const rawDocs = (await this.frameworkModel.find().sort({ createdAt: -1 }).lean().exec()) as unknown[];
    return rawDocs.flatMap((doc) => this.extractFrameworksFromDoc(doc).map((f) => this.normalizeFrameworkLike(f)));
  }

  async findActive(): Promise<Record<string, unknown>> {
    const list = await this.findAll();
    const active = list.find((doc) => doc.isActive === true);
    if (!active) throw new NotFoundException("No active framework found");
    return active;
  }

  async findOne(id: string): Promise<Record<string, unknown>> {
    const list = await this.findAll();
    const framework = list.find((doc) => String(doc._id) === id);
    if (!framework) throw new NotFoundException("Framework not found");
    return framework;
  }

  async activate(id: string, user?: RequestUser): Promise<Framework> {
    const framework = await this.frameworkModel.findById(id).exec();
    if (!framework) throw new NotFoundException("Framework not found");

    await this.frameworkModel.updateMany({ _id: { $ne: id } }, { $set: { isActive: false } }).exec();
    framework.isActive = true;
    const saved = await framework.save();
    if (user?.sub) {
      await this.recordRevision("activated", saved, user.sub);
    }
    return saved;
  }

  async remove(id: string, user?: RequestUser): Promise<{ deleted: true }> {
    const framework = await this.frameworkModel.findById(id).exec();
    if (!framework) throw new NotFoundException("Framework not found");
    const name = framework.name;
    const version = framework.version;
    const result = await this.frameworkModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException("Framework not found");
    if (user?.sub) {
      const content = framework.content as Record<string, unknown>;
      await this.revisionsService.record({
        action: "deleted",
        frameworkId: id,
        frameworkName: name,
        frameworkVersion: version,
        userId: user.sub,
        previousContent: content && typeof content === "object" ? content : undefined,
      });
    }
    return { deleted: true };
  }
}
