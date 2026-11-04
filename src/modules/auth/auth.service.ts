import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';

@Injectable()
export class AuthService {
  constructor(private readonly supabase: SupabaseService) {}

  // Devuelve el id del usuario de Supabase Auth con ese correo. Si no existe,
  // le envía una invitación por correo para que defina su contraseña.
  async createOrGetAuthUser(email: string, role?: string): Promise<string> {
    const user =
      (await this.findUserByEmail(email)) ?? (await this.invite(email));

    if (role) {
      const roles = (user.app_metadata?.roles as string[] | undefined) ?? [];
      if (!roles.includes(role)) {
        const { error } = await this.supabase.client.auth.admin.updateUserById(
          user.id,
          { app_metadata: { roles: [...roles, role] } },
        );
        if (error) {
          console.error('Failed to set user role:', error);
          throw new InternalServerErrorException(
            'User created but could not be assigned a role',
          );
        }
      }
    }

    return user.id;
  }

  private async invite(email: string): Promise<User> {
    const { data, error } =
      await this.supabase.client.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/auth/set-password/`,
      });
    if (error) {
      console.error('Error inviting user:', error);
      throw new InternalServerErrorException('Failed to get or create user');
    }
    return data.user;
  }

  // La API de administración no busca por correo, así que se recorren las páginas
  private async findUserByEmail(email: string): Promise<User | null> {
    const target = email.toLowerCase();
    for (let page = 1; ; page++) {
      const { data, error } = await this.supabase.client.auth.admin.listUsers({
        page,
        perPage: 1000,
      });
      if (error) {
        console.error('Error listing users:', error);
        throw new InternalServerErrorException('Failed to get or create user');
      }
      const found = data.users.find((u) => u.email?.toLowerCase() === target);
      if (found) return found;
      if (data.users.length < 1000) return null;
    }
  }
}
