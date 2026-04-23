import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
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

  async update(id: string, updateFrameworkDto: UpdateFrameworkDto, user?: RequestUser): Promise<Framework> {
    const { lastKnownUpdatedAt, ...updatePayload } = updateFrameworkDto as UpdateFrameworkDto & {
      lastKnownUpdatedAt?: string;
    };

    const queryOptions = { new: true, runValidators: true } as const;
    let previousContent: Record<string, unknown> | undefined;

    if (user?.sub) {
      const oldDoc = await this.frameworkModel.findById(id).lean().exec();
      if (oldDoc?.content) previousContent = oldDoc.content as Record<string, unknown>;
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
      if (!updated) throw new NotFoundException("Framework not found");
    }

    if (user?.sub) {
      const newContent = updated.content as Record<string, unknown>;
      await this.recordRevision("updated", updated, user.sub, {
        previousContent,
        newContent: newContent && typeof newContent === "object" ? newContent : undefined,
      });
    }
    return updated;
  }

  async findAll(): Promise<Framework[]> {
    const list = await this.frameworkModel.find().sort({ createdAt: -1 }).exec();
    for (const doc of list) {
      if (doc.content) {
        const normalized = normalizeContentToNewShape(doc.content as Record<string, unknown>);
        if (normalized) doc.content = normalized;
      }
    }
    return list;
  }

  async findActive(): Promise<Framework> {
    const active = await this.frameworkModel.findOne({ isActive: true }).exec();
    if (!active) throw new NotFoundException("No active framework found");
    if (active.content) {
      const normalized = normalizeContentToNewShape(active.content as Record<string, unknown>);
      if (normalized) active.content = normalized;
    }
    return active;
  }

  async findOne(id: string): Promise<Framework> {
    const framework = await this.frameworkModel.findById(id).exec();
    if (!framework) throw new NotFoundException("Framework not found");
    if (framework.content) {
      const normalized = normalizeContentToNewShape(framework.content as Record<string, unknown>);
      if (normalized) framework.content = normalized;
    }
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
