// Crea un administrador en Supabase Auth (o le agrega el rol admin si ya existe).
// Uso: yarn create-admin <correo> <contraseña>
// Lee SUPABASE_URL y SUPABASE_SECRET_KEY del .env
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Uso: yarn create-admin <correo> <contraseña>');
    process.exit(1);
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  );

  const { data: list, error: listError } = await supabase.auth.admin.listUsers({
    perPage: 1000,
  });
  if (listError) throw listError;
  const existing = list.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase(),
  );

  if (existing) {
    const roles = (existing.app_metadata?.roles as string[] | undefined) ?? [];
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      app_metadata: { roles: [...new Set([...roles, 'admin'])] },
    });
    if (error) throw error;
    console.log(`Usuario existente actualizado como admin: ${email}`);
    return;
  }

  const { error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: { roles: ['admin'] },
  });
  if (error) throw error;
  console.log(`Administrador creado: ${email}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
