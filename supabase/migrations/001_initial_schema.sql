create type public.account_status as enum ('PENDING', 'ACTIVE', 'DISABLED');
create type public.app_role as enum ('USER', 'ADMIN');
create type public.collection_status as enum ('DRAFT', 'OPEN', 'CLOSED', 'ARCHIVED');
create type public.payment_status as enum ('PENDING', 'APPROVED', 'REJECTED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role public.app_role not null default 'USER',
  status public.account_status not null default 'PENDING',
  initials text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  status public.collection_status not null default 'DRAFT',
  created_by uuid not null references public.profiles(id),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.obligations (
  id uuid primary key default gen_random_uuid(),
  collection_id uuid not null references public.collections(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  required_amount numeric(12, 2) not null check (required_amount >= 0),
  created_at timestamptz not null default now(),
  unique (collection_id, user_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  obligation_id uuid not null references public.obligations(id) on delete cascade,
  submitted_by uuid not null references public.profiles(id),
  amount_entered numeric(12, 2) not null check (amount_entered > 0),
  approved_amount numeric(12, 2) check (approved_amount >= 0),
  status public.payment_status not null default 'PENDING',
  bank text,
  slip_path text not null,
  slip_hash text not null,
  ocr_amount numeric(12, 2),
  qr_detected boolean not null default false,
  reject_reason text,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index payments_obligation_id_idx on public.payments(obligation_id);
create index payments_status_idx on public.payments(status);
create index obligations_user_id_idx on public.obligations(user_id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  display_name text;
begin
  display_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  insert into public.profiles (id, name, email, initials)
  values (
    new.id,
    display_name,
    new.email,
    upper(left(display_name, 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.collections enable row level security;
alter table public.obligations enable row level security;
alter table public.payments enable row level security;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'ADMIN'
      and status = 'ACTIVE'
  );
$$;

create policy "profiles read own or admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "profiles update by admin"
on public.profiles for update
using (public.is_admin())
with check (public.is_admin());

create policy "collections read active users"
on public.collections for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.obligations o
    where o.collection_id = collections.id
      and o.user_id = auth.uid()
  )
);

create policy "collections write admin"
on public.collections for all
using (public.is_admin())
with check (public.is_admin());

create policy "obligations read own or admin"
on public.obligations for select
using (user_id = auth.uid() or public.is_admin());

create policy "obligations write admin"
on public.obligations for all
using (public.is_admin())
with check (public.is_admin());

create policy "payments read owner or admin"
on public.payments for select
using (submitted_by = auth.uid() or public.is_admin());

create policy "payments insert owner"
on public.payments for insert
with check (
  submitted_by = auth.uid()
  and exists (
    select 1
    from public.obligations o
    where o.id = obligation_id
      and o.user_id = auth.uid()
  )
);

create policy "payments review admin"
on public.payments for update
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public)
values ('slips', 'slips', false)
on conflict (id) do nothing;

create policy "slip files readable by owner or admin"
on storage.objects for select
using (
  bucket_id = 'slips'
  and (
    owner = auth.uid()
    or public.is_admin()
  )
);

create policy "users upload own slip files"
on storage.objects for insert
with check (
  bucket_id = 'slips'
  and owner = auth.uid()
);
