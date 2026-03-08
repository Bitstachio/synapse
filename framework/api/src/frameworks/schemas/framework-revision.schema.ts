import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Schema as MongooseSchema, Types } from "mongoose";

export type FrameworkRevisionAction = "created" | "updated" | "deleted" | "activated";

/** JSON Patch operation (RFC 6902): { op, path, value? } etc. */
export type JsonPatchOperation = Record<string, unknown>;

@Schema({ timestamps: false })
export class FrameworkRevision extends Document {
  @Prop({ required: true, enum: ["created", "updated", "deleted", "activated"] })
  action: FrameworkRevisionAction;

  @Prop({ type: Types.ObjectId, ref: "Framework", required: true })
  frameworkId: Types.ObjectId;

  @Prop({ required: true })
  frameworkName: string;

  @Prop({ required: true })
  frameworkVersion: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ default: () => new Date() })
  performedAt: Date;

  /** Framework content before this change (for updated/deleted). */
  @Prop({ type: MongooseSchema.Types.Mixed })
  previousContent?: Record<string, unknown>;

  /** Framework content after this change (for created/updated). */
  @Prop({ type: MongooseSchema.Types.Mixed })
  newContent?: Record<string, unknown>;

  /** JSON Patch (RFC 6902) from previousContent to newContent (for updated). */
  @Prop({ type: [MongooseSchema.Types.Mixed] })
  diff?: JsonPatchOperation[];
}

export const FrameworkRevisionSchema = SchemaFactory.createForClass(FrameworkRevision);

FrameworkRevisionSchema.index({ frameworkId: 1, performedAt: -1 });
FrameworkRevisionSchema.index({ userId: 1, performedAt: -1 });
FrameworkRevisionSchema.index({ performedAt: -1 });
