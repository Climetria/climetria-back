/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Solo para desarrollo local: acepta el token falso del front sin validar la firma
function isDevBypassEnabled() {
  return (
    process.env.DEV_BYPASS_AUTH === 'true' &&
    process.env.NODE_ENV !== 'production'
  );
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    if (!isDevBypassEnabled()) return super.canActivate(context);

    const request = context.switchToHttp().getRequest();
    const token: string | undefined =
      request.headers.authorization?.split(' ')[1];
    request.user = token
      ? JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString())
      : {
          sub: 'dev-admin',
          email: 'dev-admin@local.test',
          app_metadata: { roles: ['admin'] },
        };
    return true;
  }
}
