import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { FrameworksController } from "./frameworks.controller";
import { FrameworksService } from "./frameworks.service";
import { Framework, FrameworkSchema } from "./schemas/framework.schema";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: Framework.name, schema: FrameworkSchema }]),
  ],
  controllers: [FrameworksController],
  providers: [FrameworksService],
})
export class FrameworksModule {}
