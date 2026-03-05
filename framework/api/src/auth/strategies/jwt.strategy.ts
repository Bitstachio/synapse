import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { passportJwtSecret } from "jwks-rsa";
import { ExtractJwt, Strategy } from "passport-jwt";

export interface Auth0JwtPayload {
  sub: string;
  iss: string;
  aud: string | string[];
  iat: number;
  exp: number;
  azp?: string;
  scope?: string;
  permissions?: string[];
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const domain = configService.get<string>("AUTH0_DOMAIN");
    const audience = configService.get<string>("AUTH0_AUDIENCE");
    const issuerBase = domain ? `https://${domain.replace(/^https?:\/\//, "")}` : "";

    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${issuerBase}/.well-known/jwks.json`,
      }),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience,
      // Auth0 may include or omit trailing slash in iss; accept both
      issuer: [issuerBase, `${issuerBase}/`],
      algorithms: ["RS256"],
    });
  }

  validate(payload: Auth0JwtPayload) {
    return {
      sub: payload.sub,
      permissions: payload.permissions ?? [],
    };
  }
}
