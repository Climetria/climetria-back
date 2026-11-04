/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { hasRole, JwtPayload } from './auth.decorator';
import { Role, ROLES_KEY } from './roles.decorator';

// Solo para desarrollo local: acepta el token falso del front sin validar la firma
function isDevBypassEnabled() {
  return (
    process.env.DEV_BYPASS_AUTH === 'true' &&
    process.env.NODE_ENV !== 'production'
  );
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    if (isDevBypassEnabled()) {
      const token: string | undefined =
        request.headers.authorization?.split(' ')[1];
      request.user = token
        ? JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
        : {
            sub: 'dev-admin',
            email: 'dev-admin@local.test',
            app_metadata: { roles: ['admin'] },
          };
    } else if (!(await super.canActivate(context))) {
      return false;
    }

    // Por defecto toda ruta protegida es solo para administradores; @Roles() amplía el acceso
    const allowed = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? ['admin'];
    const user: JwtPayload = request.user;
    if (!allowed.some((role) => hasRole(user, role))) {
      throw new ForbiddenException('No tienes permiso para esta acción');
    }
    return true;
  }
}
