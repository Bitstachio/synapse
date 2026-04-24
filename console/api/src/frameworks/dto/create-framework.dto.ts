import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsOptional, IsString } from "class-validator";

export class CreateFrameworkDto {
  @ApiProperty({ example: "Synapse Wellbeing v1" })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: "1.0.0" })
  @IsString()
  @IsNotEmpty()
  version: string;

  @ApiProperty({ description: "The hierarchical JSON structure of the framework" })
  @IsObject()
  content: Record<string, any>;

  @IsOptional()
  isActive?: boolean;
}
