import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Permissions as PermissionsDecorator } from "../auth/decorators/permissions.decorator";
import { Permissions as PermissionsConstants } from "../auth/constants/permissions";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { CreateFrameworkDto } from "./dto/create-framework.dto";
import { UpdateFrameworkDto } from "./dto/update-framework.dto";
import { FrameworksService } from "./frameworks.service";

@ApiTags("Frameworks")
@ApiBearerAuth()
@Controller("frameworks")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FrameworksController {
  constructor(private readonly frameworksService: FrameworksService) {}

  @Post()
  @ApiOperation({ summary: "Create a new wellbeing framework" })
  @PermissionsDecorator(PermissionsConstants.CREATE_FRAMEWORKS)
  @ApiBody({ type: CreateFrameworkDto })
  async create(@Body() createFrameworkDto: CreateFrameworkDto) {
    return this.frameworksService.create(createFrameworkDto);
  }

  @Get()
  @ApiOperation({ summary: "List all frameworks" })
  @PermissionsDecorator(PermissionsConstants.READ_FRAMEWORKS)
  async findAll() {
    return this.frameworksService.findAll();
  }

  @Get("active")
  @ApiOperation({ summary: "Get the currently active framework used for auditing" })
  @PermissionsDecorator(PermissionsConstants.READ_FRAMEWORKS)
  async findActive() {
    return this.frameworksService.findActive();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a framework by ID" })
  @PermissionsDecorator(PermissionsConstants.READ_FRAMEWORKS)
  async findOne(@Param("id") id: string) {
    return this.frameworksService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update an existing framework including its hierarchical content",
    description:
      "Allows updating framework metadata (name, version, isActive) and the JSON `content` tree. " +
      "To add, update, or delete categories and subcategories, send the modified `content` structure.",
  })
  @PermissionsDecorator(PermissionsConstants.UPDATE_FRAMEWORKS)
  @ApiBody({ type: UpdateFrameworkDto })
  async update(@Param("id") id: string, @Body() updateFrameworkDto: UpdateFrameworkDto) {
    return this.frameworksService.update(id, updateFrameworkDto);
  }

  @Patch(":id/activate")
  @ApiOperation({ summary: "Set a specific framework as the active source of truth" })
  @PermissionsDecorator(PermissionsConstants.ACTIVATE_FRAMEWORKS)
  async activate(@Param("id") id: string) {
    return this.frameworksService.activate(id);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remove a framework version" })
  @PermissionsDecorator(PermissionsConstants.DELETE_FRAMEWORKS)
  async remove(@Param("id") id: string) {
    return this.frameworksService.remove(id);
  }
}
