import { SetMetadata } from '@nestjs/common';

export type Role = 'admin' | 'mentor';

export const ROLES_KEY = 'roles';

// Roles que pueden usar la ruta. Sin este decorador, JwtAuthGuard solo deja pasar a administradores.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
