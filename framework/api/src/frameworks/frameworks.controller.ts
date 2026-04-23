import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { User } from "../auth/decorators/user.decorator";
import type { RequestUser } from "../auth/decorators/user.decorator";
import { Permissions as PermissionsDecorator } from "../auth/decorators/permissions.decorator";
import { Permissions as PermissionsConstants } from "../auth/constants/permissions";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { CreateFrameworkDto } from "./dto/create-framework.dto";
import { UpdateFrameworkDto } from "./dto/update-framework.dto";
import { FrameworkRevisionsService } from "./framework-revisions.service";
import { FrameworksService } from "./frameworks.service";

@ApiTags("Frameworks")
@ApiBearerAuth()
@Controller("frameworks")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class FrameworksController {
  constructor(
    private readonly frameworksService: FrameworksService,
    private readonly revisionsService: FrameworkRevisionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: "Create a new wellbeing framework" })
  @PermissionsDecorator(PermissionsConstants.CREATE_FRAMEWORKS)
  @ApiBody({ type: CreateFrameworkDto })
  async create(@Body() createFrameworkDto: CreateFrameworkDto, @User() user: RequestUser) {
    return this.frameworksService.create(createFrameworkDto, user);
  }

  @Get()
  @ApiOperation({
    summary: "List all frameworks",
    description: "Each item includes `createdAt` and `updatedAt` (last modified) for the framework record.",
  })
  @PermissionsDecorator(PermissionsConstants.READ_FRAMEWORKS)
  async findAll() {
    return this.frameworksService.findAll();
  }

  @Get("active")
  @ApiOperation({
    summary: "Get the currently active framework used for auditing",
    description: "Includes `createdAt` and `updatedAt` on the framework record.",
  })
  @PermissionsDecorator(PermissionsConstants.READ_FRAMEWORKS)
  async findActive() {
    return this.frameworksService.findActive();
  }

  @Get("revisions")
  @ApiOperation({
    summary: "List framework revision history",
    description:
      "Returns a list of framework modifications (created, updated, deleted, activated) with date/time and user id. Does not include previousContent, newContent, or diff; use GET /revisions/:revisionId for those. Query params filter by framework, user, or date range.",
  })
  @PermissionsDecorator(PermissionsConstants.READ_FRAMEWORKS)
  @ApiQuery({ name: "frameworkId", required: false, description: "Filter by framework ID" })
  @ApiQuery({ name: "userId", required: false, description: "Filter by Auth0 user id (sub)" })
  @ApiQuery({ name: "from", required: false, description: "From date (ISO 8601)" })
  @ApiQuery({ name: "to", required: false, description: "To date (ISO 8601)" })
  @ApiQuery({ name: "limit", required: false, description: "Max results (default 50, max 100)" })
  @ApiQuery({ name: "offset", required: false, description: "Skip N results for pagination" })
  async findRevisions(
    @Query("frameworkId") frameworkId?: string,
    @Query("userId") userId?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
    @Query("limit") limit?: string,
    @Query("offset") offset?: string,
  ) {
    return this.revisionsService.findRevisions({
      frameworkId,
      userId,
      from,
      to,
      limit: limit ? parseInt(limit, 10) : undefined,
      offset: offset ? parseInt(offset, 10) : undefined,
    });
  }

  @Get("revisions/:revisionId")
  @ApiOperation({
    summary: "Get a single revision by ID",
    description:
      "Returns one revision by ID with previousContent, newContent, and diff. Names/descriptions in newContent and in diff values are enriched from the current framework when the item still exists (same id), so the audit log shows current labels (e.g. 'Employee Privacy' instead of 'New instruction'). When enrichment was applied, response includes _enrichedWithCurrentNames: true.",
  })
  @PermissionsDecorator(PermissionsConstants.READ_FRAMEWORKS)
  async findOneRevision(@Param("revisionId") revisionId: string) {
    return this.revisionsService.findOneRevision(revisionId);
  }

  @Get(":id")
  @ApiOperation({
    summary: "Get a framework by ID",
    description: "Includes `createdAt` and `updatedAt` for the framework document.",
  })
  @PermissionsDecorator(PermissionsConstants.READ_FRAMEWORKS)
  async findOne(@Param("id") id: string) {
    return this.frameworksService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({
    summary: "Update an existing framework including its hierarchical content",
    description:
      "Allows updating framework metadata (name, version, isActive) and the JSON `content` tree. " +
      "To add, update, or delete subcategories and instructions, send the modified `content` structure.",
  })
  @PermissionsDecorator(PermissionsConstants.UPDATE_FRAMEWORKS)
  @ApiBody({ type: UpdateFrameworkDto })
  async update(@Param("id") id: string, @Body() updateFrameworkDto: UpdateFrameworkDto, @User() user: RequestUser) {
    return this.frameworksService.update(id, updateFrameworkDto, user);
  }

  @Patch(":id/activate")
  @ApiOperation({ summary: "Set a specific framework as the active source of truth" })
  @PermissionsDecorator(PermissionsConstants.ACTIVATE_FRAMEWORKS)
  async activate(@Param("id") id: string, @User() user: RequestUser) {
    return this.frameworksService.activate(id, user);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remove a framework version" })
  @PermissionsDecorator(PermissionsConstants.DELETE_FRAMEWORKS)
  async remove(@Param("id") id: string, @User() user: RequestUser) {
    return this.frameworksService.remove(id, user);
  }
}
