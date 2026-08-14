create table if not exists public.contacts (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  province_id text not null,
  name text not null,
  city text not null default '',
  note text not null default '',
  category text check (category is null or category in ('friend', 'colleague', 'local-expert')),
  added_at bigint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.contacts enable row level security;

create policy "Users can read their own contacts"
  on public.contacts for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own contacts"
  on public.contacts for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own contacts"
  on public.contacts for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own contacts"
  on public.contacts for delete
  to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.contacts to authenticated;
