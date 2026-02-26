import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FrameworksController } from "./frameworks.controller";
import { FrameworksService } from "./frameworks.service";
import { Framework, FrameworkSchema } from "./schemas/framework.schema";

@Module({
  imports: [MongooseModule.forFeature([{ name: Framework.name, schema: FrameworkSchema }])],
  controllers: [FrameworksController],
  providers: [FrameworksService],
})
export class FrameworksModule {}
