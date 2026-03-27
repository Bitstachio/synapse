import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Document } from "mongoose";

@Schema({ timestamps: true })
export class Framework extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  version: string;

  @Prop({ default: false })
  isActive: boolean;

  // Stores Categories -> Subcategories -> Instructions tree
  @Prop({ type: Object, required: true })
  content: Record<string, any>;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export const FrameworkSchema = SchemaFactory.createForClass(Framework);
