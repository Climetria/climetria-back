/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: string;
  email?: string;
  // Los roles (admin, mentor) se guardan en app_metadata: solo el backend puede modificarlos
  app_metadata?: { roles?: string[] };
  iat?: number;
  exp?: number;
}

export const JwtUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

function hasRole(user: JwtPayload, role: string): boolean {
  return user.app_metadata?.roles?.includes(role) ?? false;
}

export const IsUserAdmin = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): boolean => {
    const user: JwtPayload = ctx.switchToHttp().getRequest().user;
    return hasRole(user, 'admin');
  },
);

export const IsUserMentor = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): boolean => {
    const user: JwtPayload = ctx.switchToHttp().getRequest().user;
    return hasRole(user, 'mentor');
  },
);
