-- Supabase expone el esquema public por su API REST con la publishable key.
-- Activar RLS sin políticas bloquea ese acceso; el backend (Prisma, dueño de las
-- tablas) no se ve afectado. Se vuelve a ejecutar tras cada `yarn db:push`.
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;
