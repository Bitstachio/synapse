import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import type { Request } from "express";

export type Response<T> = {
  data: T;
  meta: {
    timestamp: string;
    path: string;
  };
};

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T | null>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<Response<T | null>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();

    return next.handle().pipe(
      map((data: T) => ({
        data: data ?? null,
        meta: {
          timestamp: new Date().toISOString(),
          path: request.url,
        },
      })),
    );
  }
}
