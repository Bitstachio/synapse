import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type FrameworkRevisionAction = "created" | "updated" | "deleted" | "activated";

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
}

export const FrameworkRevisionSchema = SchemaFactory.createForClass(FrameworkRevision);

FrameworkRevisionSchema.index({ frameworkId: 1, performedAt: -1 });
FrameworkRevisionSchema.index({ userId: 1, performedAt: -1 });
FrameworkRevisionSchema.index({ performedAt: -1 });
