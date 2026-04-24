import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Framework } from "./schemas/framework.schema";
import { FrameworkRevision, FrameworkRevisionAction } from "./schemas/framework-revision.schema";
import {
  computeSemanticDiff,
  enrichDiffValuesWithCurrent,
  enrichNewContentWithCurrent,
  normalizeContentToNewShape,
} from "./revision-enrichment";

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

  async record(input: RevisionRecordInput): Promise<FrameworkRevision> {
    const performedAt = new Date();

    const { previousContent, newContent, ...rest } = input;
    const payload: Record<string, unknown> = { ...rest, performedAt };

    if (previousContent !== undefined) payload.previousContent = previousContent;
    if (newContent !== undefined) payload.newContent = newContent;

    if (previousContent !== undefined && newContent !== undefined) {
      try {
        const diff = computeSemanticDiff(previousContent, newContent);
        if (diff) payload.diff = diff;
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
      if (current?.content) {
        currentContent = normalizeContentToNewShape(current.content as Record<string, unknown>);
      }
    }

    const cloned = JSON.parse(JSON.stringify(revision)) as FrameworkRevision & {
      _enrichedWithCurrentNames?: boolean;
    };
    if (cloned.newContent && typeof cloned.newContent === "object" && cloned.newContent !== null) {
      const normalized = normalizeContentToNewShape(cloned.newContent);
      if (normalized) cloned.newContent = normalized;
    }

    if (currentContent) {
      enrichNewContentWithCurrent(cloned.newContent, currentContent);
      enrichDiffValuesWithCurrent(
        cloned.diff as { op: string; path: string; value?: unknown }[] | undefined,
        currentContent,
      );
      cloned._enrichedWithCurrentNames = true;
    }

    return cloned;
  }
}
