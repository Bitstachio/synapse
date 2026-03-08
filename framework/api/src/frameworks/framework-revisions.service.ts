import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { compare as jsonPatchCompare } from "fast-json-patch";
import { Model } from "mongoose";
import { Framework } from "./schemas/framework.schema";
import { FrameworkRevision, FrameworkRevisionAction } from "./schemas/framework-revision.schema";
import {
  enrichDiffValuesWithCurrent,
  enrichNewContentWithCurrent,
} from "./revision-enrichment";

/** Seconds within which to treat repeated "updated" by same user/framework as one revision (0 = no dedupe). */
const UPDATE_DEDUPE_WINDOW_SECONDS = 15;

export interface RevisionRecordInput {
  action: FrameworkRevisionAction;
  frameworkId: string;
  frameworkName: string;
  frameworkVersion: string;
  userId: string;
  previousContent?: Record<string, unknown>;
  newContent?: Record<string, unknown>;
}

export interface FindRevisionsFilters {
  frameworkId?: string;
  userId?: string;
  from?: string;
  to?: string;
  limit?: number;
  offset?: number;
}

@Injectable()
export class FrameworkRevisionsService {
  constructor(
    @InjectModel(FrameworkRevision.name)
    private revisionModel: Model<FrameworkRevision>,
    @InjectModel(Framework.name)
    private frameworkModel: Model<Framework>,
  ) {}

  async record(input: RevisionRecordInput): Promise<FrameworkRevision | null> {
    const performedAt = new Date();

    if (input.action === "updated" && UPDATE_DEDUPE_WINDOW_SECONDS > 0) {
      const since = new Date(performedAt.getTime() - UPDATE_DEDUPE_WINDOW_SECONDS * 1000);
      const recent = await this.revisionModel
        .findOne({
          frameworkId: input.frameworkId,
          userId: input.userId,
          action: "updated",
          performedAt: { $gte: since },
        })
        .sort({ performedAt: -1 })
        .lean()
        .exec();
      if (recent) {
        return null;
      }
    }

    const { previousContent, newContent, ...rest } = input;
    const payload: Record<string, unknown> = { ...rest, performedAt };

    if (previousContent !== undefined) payload.previousContent = previousContent;
    if (newContent !== undefined) payload.newContent = newContent;

    if (
      previousContent !== undefined &&
      newContent !== undefined &&
      typeof previousContent === "object" &&
      typeof newContent === "object"
    ) {
      try {
        const patch = jsonPatchCompare(previousContent as object, newContent as object, true);
        if (patch.length > 0) payload.diff = patch;
      } catch {
        // If diff computation fails, still store previous/new content
      }
    }

    const doc = new this.revisionModel(payload);
    return doc.save();
  }

  async findRevisions(filters: FindRevisionsFilters = {}): Promise<FrameworkRevision[]> {
    const { frameworkId, userId, from, to, limit = 50, offset = 0 } = filters;
    const query: Record<string, unknown> = {};

    if (frameworkId) query.frameworkId = frameworkId;
    if (userId) query.userId = userId;
    if (from || to) {
      query.performedAt = {};
      if (from) (query.performedAt as Record<string, Date>).$gte = new Date(from);
      if (to) (query.performedAt as Record<string, Date>).$lte = new Date(to);
    }

    return this.revisionModel
      .find(query)
      .select("-previousContent -newContent -diff")
      .sort({ performedAt: -1 })
      .skip(offset)
      .limit(Math.min(limit, 100))
      .lean()
      .exec();
  }

  async findOneRevision(revisionId: string): Promise<FrameworkRevision & { _enrichedWithCurrentNames?: boolean }> {
    const revision = await this.revisionModel.findById(revisionId).lean().exec();
    if (!revision) throw new NotFoundException("Revision not found");

    const frameworkId = revision.frameworkId != null ? String(revision.frameworkId) : null;
    let currentContent: Record<string, unknown> | null = null;
    if (frameworkId) {
      const current = await this.frameworkModel.findById(frameworkId).lean().exec();
      if (current?.content) currentContent = current.content as Record<string, unknown>;
    }

    const cloned = JSON.parse(JSON.stringify(revision)) as FrameworkRevision & {
      _enrichedWithCurrentNames?: boolean;
    };

    if (currentContent) {
      enrichNewContentWithCurrent(cloned.newContent, currentContent);
      enrichDiffValuesWithCurrent(cloned.diff as { op: string; path: string; value?: unknown }[] | undefined, currentContent);
      cloned._enrichedWithCurrentNames = true;
    }

    return cloned;
  }
}
