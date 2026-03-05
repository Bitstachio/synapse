import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { PermissionsGuard } from "./guards/permissions.guard";
import { JwtStrategy } from "./strategies/jwt.strategy";

@Module({
  imports: [ConfigModule, PassportModule.register({ defaultStrategy: "jwt" })],
  providers: [JwtStrategy, JwtAuthGuard, PermissionsGuard],
  exports: [PassportModule, JwtAuthGuard, PermissionsGuard],
})
export class AuthModule {}
