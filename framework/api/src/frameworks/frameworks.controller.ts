import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateFrameworkDto } from "./dto/create-framework.dto";
import { FrameworksService } from "./frameworks.service";

@ApiTags("Frameworks")
@Controller("frameworks")
export class FrameworksController {
  constructor(private readonly frameworksService: FrameworksService) {}

  @Post()
  @ApiOperation({ summary: "Create a new wellbeing framework" })
  @ApiBody({ type: CreateFrameworkDto })
  async create(@Body() createFrameworkDto: CreateFrameworkDto) {
    return this.frameworksService.create(createFrameworkDto);
  }

  @Get()
  @ApiOperation({ summary: "List all frameworks" })
  async findAll() {
    return this.frameworksService.findAll();
  }

  @Get("active")
  @ApiOperation({ summary: "Get the currently active framework used for auditing" })
  async findActive() {
    return this.frameworksService.findActive();
  }

  @Patch(":id/activate")
  @ApiOperation({ summary: "Set a specific framework as the active source of truth" })
  async activate(@Param("id") id: string) {
    return this.frameworksService.activate(id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remove a framework version" })
  async remove(@Param("id") id: string) {
    return this.frameworksService.remove(id);
  }
}
