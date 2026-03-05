import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "permissions";

/**
 * Require at least one of the given Auth0 API permissions.
 * Use with JwtAuthGuard + PermissionsGuard.
 * Example: @Permissions('read:frameworks')
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
