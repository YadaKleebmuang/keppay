# Deploy keppay

## Supabase

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor or via Supabase CLI.
3. Enable Google provider in Supabase Auth.
4. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://<your-vercel-domain>/auth/callback`
5. Create the first admin by updating that user's profile after first login:

```sql
update public.profiles
set role = 'ADMIN', status = 'ACTIVE'
where email = '<admin-email>';
```

## Vercel

Set these environment variables in Vercel:

```text
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

Build command: `bun run build`

Install command: `bun install`

Start command is handled by Vercel for Next.js.

## Local

```sh
bun install
bun run dev
```

Open `http://localhost:3000`.
