import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsISO8601, IsOptional } from "class-validator";
import { PartialType } from "@nestjs/swagger";
import { CreateFrameworkDto } from "./create-framework.dto";

export class UpdateFrameworkDto extends PartialType(CreateFrameworkDto) {
  /**
   * For optimistic locking: set to the framework's `updatedAt` from when you loaded it.
   * If the document was updated by someone else in the meantime, the API returns 409 Conflict.
   * Omit to allow the update regardless (last write wins).
   */
  @ApiPropertyOptional({
    description:
      "Framework's updatedAt when you loaded it. If provided and the document was modified since, returns 409 Conflict.",
    example: "2026-03-06T12:00:00.000Z",
  })
  @IsOptional()
  @IsISO8601()
  lastKnownUpdatedAt?: string;
}
