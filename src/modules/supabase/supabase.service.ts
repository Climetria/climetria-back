import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

// Cliente con la secret key: salta RLS y permite la API de administración de Auth.
// Solo se usa en el backend, nunca se expone al navegador.
@Injectable()
export class SupabaseService {
  readonly client: ReturnType<typeof createClient>;

  constructor() {
    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!url || !secretKey) {
      throw new InternalServerErrorException(
        'SUPABASE_URL y SUPABASE_SECRET_KEY son obligatorias',
      );
    }

    this.client = createClient(url, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
}
