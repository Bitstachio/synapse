import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export interface RequestUser {
  sub: string;
  permissions: string[];
}

export const User = createParamDecorator((data: unknown, ctx: ExecutionContext): RequestUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
