import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateFrameworkDto } from "./dto/create-framework.dto";
import { UpdateFrameworkDto } from "./dto/update-framework.dto";
import { Framework } from "./schemas/framework.schema";

@Injectable()
export class FrameworksService {
  constructor(@InjectModel(Framework.name) private frameworkModel: Model<Framework>) {}

  async create(createFrameworkDto: CreateFrameworkDto): Promise<Framework> {
    try {
      const newFramework = new this.frameworkModel(createFrameworkDto);
      return await newFramework.save();
    } catch (error) {
      // Handle MongoDB unique constraint error (e.g., duplicate version)
      if (error.code === 11000)
        throw new ConflictException(`Framework version ${createFrameworkDto.version} already exists`);

      throw error;
    }
  }

  async update(id: string, updateFrameworkDto: UpdateFrameworkDto): Promise<Framework> {
    const { lastKnownUpdatedAt, ...updatePayload } = updateFrameworkDto as UpdateFrameworkDto & {
      lastKnownUpdatedAt?: string;
    };

    const options = { new: true, runValidators: true } as const;

    let updated: Framework | null;

    if (lastKnownUpdatedAt) {
      updated = await this.frameworkModel
        .findOneAndUpdate(
          { _id: id, updatedAt: new Date(lastKnownUpdatedAt) },
          updatePayload,
          options,
        )
        .exec();
      if (!updated) {
        const current = await this.frameworkModel.findById(id).exec();
        if (!current) throw new NotFoundException("Framework not found");
        throw new ConflictException(
          "The framework was modified by another user. Please refresh and submit again.",
        );
      }
    } else {
      updated = await this.frameworkModel
        .findByIdAndUpdate(id, updatePayload, options)
        .exec();
      if (!updated) throw new NotFoundException("Framework not found");
    }

    return updated;
  }

  async findAll(): Promise<Framework[]> {
    return this.frameworkModel.find().sort({ createdAt: -1 }).exec();
  }

  async findActive(): Promise<Framework> {
    const active = await this.frameworkModel.findOne({ isActive: true }).exec();
    if (!active) throw new NotFoundException("No active framework found");

    return active;
  }

  async activate(id: string): Promise<Framework> {
    const framework = await this.frameworkModel.findById(id).exec();
    if (!framework) throw new NotFoundException("Framework not found");

    await this.frameworkModel.updateMany({ _id: { $ne: id } }, { $set: { isActive: false } }).exec();
    framework.isActive = true;

    return await framework.save();
  }

  async remove(id: string): Promise<any> {
    const result = await this.frameworkModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException("Framework not found");

    return { deleted: true };
  }
}
