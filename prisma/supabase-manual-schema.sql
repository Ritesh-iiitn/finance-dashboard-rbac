-- Run this in Supabase SQL Editor.
-- This schema matches prisma/schema.prisma exactly (including quoted names).

-- 1) User table
create table if not exists public."User" (
  "id" text primary key,
  "name" text not null,
  "email" text not null unique,
  "password" text not null,
  "role" text not null default 'VIEWER',
  "status" text not null default 'ACTIVE',
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "User_role_check" check ("role" in ('VIEWER', 'ANALYST', 'ADMIN')),
  constraint "User_status_check" check ("status" in ('ACTIVE', 'INACTIVE'))
);

-- 2) FinancialRecord table
create table if not exists public."FinancialRecord" (
  "id" text primary key,
  "amount" double precision not null,
  "type" text not null,
  "category" text not null,
  "date" timestamptz not null,
  "description" text null,
  "isDeleted" boolean not null default false,
  "createdById" text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now(),
  constraint "FinancialRecord_type_check" check ("type" in ('INCOME', 'EXPENSE')),
  constraint "FinancialRecord_createdById_fkey"
    foreign key ("createdById") references public."User"("id")
    on update cascade
    on delete restrict
);

-- Helpful index for relations/filtering
create index if not exists "FinancialRecord_createdById_idx"
  on public."FinancialRecord" ("createdById");

-- Keep updatedAt fresh for manual SQL updates too
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
end;
$$;

drop trigger if exists trg_user_updated_at on public."User";
create trigger trg_user_updated_at
before update on public."User"
for each row
execute function public.set_updated_at();

drop trigger if exists trg_financial_record_updated_at on public."FinancialRecord";
create trigger trg_financial_record_updated_at
before update on public."FinancialRecord"
for each row
execute function public.set_updated_at();

-- Optional: seed user
-- 1) Generate hash in terminal:
--    node -e "const b=require('bcryptjs'); b.hash('admin123',10).then(console.log)"
-- 2) Paste generated hash below:
-- insert into public."User" ("id", "name", "email", "password", "role", "status")
-- values ('cm000admin0000000000000000', 'Admin User', 'admin@example.com', '<PASTE_BCRYPT_HASH>', 'ADMIN', 'ACTIVE')
-- on conflict ("email") do update
-- set "password" = excluded."password", "status" = 'ACTIVE', "role" = 'ADMIN';
