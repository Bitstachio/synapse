import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { LoginDto } from "./dto/login.dto";

export interface Auth0TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}

@Injectable()
export class AuthService {
  constructor(private configService: ConfigService) {}

  async login(loginDto: LoginDto): Promise<Auth0TokenResponse> {
    const domain = this.configService.get<string>("AUTH0_DOMAIN");
    const audience = this.configService.get<string>("AUTH0_AUDIENCE");
    const clientId = this.configService.get<string>("AUTH0_CLIENT_ID");
    const clientSecret = this.configService.get<string>("AUTH0_CLIENT_SECRET");

    if (!domain || !audience || !clientId || !clientSecret) {
      throw new UnauthorizedException("Auth0 login is not configured");
    }

    const issuerBase = domain.replace(/^https?:\/\//, "");
    const url = `https://${issuerBase}/oauth/token`;
    const connection =
      this.configService.get<string>("AUTH0_CONNECTION") ?? "Username-Password-Authentication";

    const body = new URLSearchParams({
      grant_type: "password",
      username: loginDto.email,
      password: loginDto.password,
      client_id: clientId,
      client_secret: clientSecret,
      audience,
      connection,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = (await response.json()) as Auth0TokenResponse & { error?: string; error_description?: string };

    if (!response.ok) {
      const message =
        data.error_description ?? data.error ?? "Invalid email or password";
      throw new UnauthorizedException(message);
    }

    return {
      access_token: data.access_token,
      expires_in: data.expires_in,
      token_type: data.token_type ?? "Bearer",
      scope: data.scope,
    };
  }
}
