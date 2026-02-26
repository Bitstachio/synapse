import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Framework extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  version: string;

  @Prop({ default: false })
  isActive: boolean;

  // Stores Functions -> Categories -> Subcategories tree
  @Prop({ type: Object, required: true })
  content: Record<string, any>;
}

export const FrameworkSchema = SchemaFactory.createForClass(Framework);
