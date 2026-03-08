import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import {
  FrameworkRevision,
  FrameworkRevisionAction,
} from "./schemas/framework-revision.schema";

export interface RevisionRecordInput {
  action: FrameworkRevisionAction;
  frameworkId: string;
  frameworkName: string;
  frameworkVersion: string;
  userId: string;
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
  ) {}

  async record(input: RevisionRecordInput): Promise<FrameworkRevision> {
    const doc = new this.revisionModel({
      ...input,
      performedAt: new Date(),
    });
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
      .sort({ performedAt: -1 })
      .skip(offset)
      .limit(Math.min(limit, 100))
      .lean()
      .exec();
  }
}
