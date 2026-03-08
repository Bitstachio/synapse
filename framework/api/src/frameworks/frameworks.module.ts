import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { FrameworkRevisionsService } from "./framework-revisions.service";
import { FrameworksController } from "./frameworks.controller";
import { FrameworksService } from "./frameworks.service";
import { Framework, FrameworkSchema } from "./schemas/framework.schema";
import {
  FrameworkRevision,
  FrameworkRevisionSchema,
} from "./schemas/framework-revision.schema";

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Framework.name, schema: FrameworkSchema },
      { name: FrameworkRevision.name, schema: FrameworkRevisionSchema },
    ]),
  ],
  controllers: [FrameworksController],
  providers: [FrameworksService, FrameworkRevisionsService],
})
export class FrameworksModule {}
