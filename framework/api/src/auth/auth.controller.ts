import { Body, Controller, Post } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService, Auth0TokenResponse } from "./auth.service";
import { LoginDto } from "./dto/login.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "Login with email and password" })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto): Promise<Auth0TokenResponse> {
    return this.authService.login(loginDto);
  }

  @Post("logout")
  @ApiOperation({
    summary: "Log out",
    description:
      "Acknowledges logout. The client should clear the stored access token after calling this. The token remains valid until it expires unless revoked elsewhere.",
  })
  async logout(): Promise<{ ok: true }> {
    return { ok: true };
  }
}
