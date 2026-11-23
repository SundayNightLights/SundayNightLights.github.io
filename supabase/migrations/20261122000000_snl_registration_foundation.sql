-- SNL registration database foundation (DRAFT FOR TESTING; NOT APPLIED)
-- Date: 2026-11-22
-- Fresh Supabase project only. Apply only after reviewing the project connection.
-- No actual waivers, signatures, legal names, or real participant data.
-- Designed so untrusted browser clients CANNOT create registrations,
-- approve players, grant staff roles, or verify waivers.
begin;

create table public.snl_teams (
  code text primary key,
  name text not null,
  created_at timestamptz not null default now(),
  constraint snl_teams_code_chk check (code ~ '^[A-Z0-9]{2,8}$')
);

create table public.snl_events (
  code text primary key,
  label text not null,
  kind text not null check (kind in ('league','tournament')),
  event_date date,
  waiver_coverage_start date,
  waiver_coverage_end date,
  created_at timestamptz not null default now(),
  constraint snl_events_code_chk check (code ~ '^[A-Z0-9]{2,12}$'),
  constraint snl_events_coverage_chk check (
    waiver_coverage_start is null or waiver_coverage_end is null
    or waiver_coverage_end >= waiver_coverage_start
  )
);

create table public.snl_event_teams (
  event_code text not null references public.snl_events(code) on delete restrict,
  team_code text not null references public.snl_teams(code) on delete restrict,
  primary key (event_code, team_code)
);
create index snl_event_teams_team_idx on public.snl_event_teams(team_code);

-- Only a public-facing display name. Auth email stays in auth.users.
-- Never store legal/signature/medical/waiver information in this table.
create table public.snl_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) between 1 and 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- No client write grants yet: later stages implement validated enrollment
-- and captain decisions using narrowly scoped server-side operations.
create table public.snl_registrations (
  id uuid primary key default gen_random_uuid(),
  player_user_id uuid not null references auth.users(id) on delete cascade,
  event_code text not null references public.snl_events(code) on delete restrict,
  team_code text,
  roster_name text not null check (length(trim(roster_name)) between 1 and 80),
  jersey_number text check (jersey_number is null or jersey_number ~ '^[0-9]{1,3}$'),
  captain_decision text not null default 'pending'
    check (captain_decision in ('pending','approved','declined')),
  created_at timestamptz not null default now(),
  unique (player_user_id, event_code),
  foreign key (event_code, team_code)
    references public.snl_event_teams(event_code, team_code) on delete restrict
);
create index snl_registrations_event_team_idx
  on public.snl_registrations(event_code, team_code);
create index snl_registrations_user_idx
  on public.snl_registrations(player_user_id);

-- Staff permissions MUST come from this server-controlled table,
-- never from a user-editable profile, a URL, or browser state.
-- A captain assignment is team AND event specific.
create table public.snl_staff_assignments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('captain','waiver_admin','owner')),
  event_code text references public.snl_events(code) on delete restrict,
  team_code text,
  granted_at timestamptz not null default now(),
  granted_by uuid references auth.users(id) on delete set null,
  revoked_at timestamptz,
  foreign key (event_code, team_code)
    references public.snl_event_teams(event_code, team_code) on delete restrict,
  constraint snl_staff_assignment_scope check (
    (role = 'captain' and event_code is not null and team_code is not null)
    or (role = 'waiver_admin' and event_code is not null and team_code is null)
    or (role = 'owner' and event_code is null and team_code is null)
  )
);
create index snl_staff_assignments_user_idx on public.snl_staff_assignments(user_id);
create unique index snl_active_captain_unique
  on public.snl_staff_assignments(user_id, event_code, team_code)
  where role = 'captain' and revoked_at is null;
create unique index snl_active_waiver_admin_unique
  on public.snl_staff_assignments(user_id, event_code)
  where role = 'waiver_admin' and revoked_at is null;
create unique index snl_active_owner_unique
  on public.snl_staff_assignments(user_id)
  where role = 'owner' and revoked_at is null;

-- Restrictive permissions FIRST. Postgres grants and RLS are distinct.
alter table public.snl_teams enable row level security;
alter table public.snl_events enable row level security;
alter table public.snl_event_teams enable row level security;
alter table public.snl_profiles enable row level security;
alter table public.snl_registrations enable row level security;
alter table public.snl_staff_assignments enable row level security;

revoke all on table
  public.snl_teams,
  public.snl_events,
  public.snl_event_teams,
  public.snl_profiles,
  public.snl_registrations,
  public.snl_staff_assignments
from anon, authenticated;

-- Only public catalog tables may be read without signing in.
grant select on public.snl_teams, public.snl_events,
  public.snl_event_teams to anon, authenticated;

create policy "SNL team catalog is public"
  on public.snl_teams for select to anon, authenticated using (true);
create policy "SNL event catalog is public"
  on public.snl_events for select to anon, authenticated using (true);
create policy "SNL event teams catalog is public"
  on public.snl_event_teams for select to anon, authenticated using (true);

-- Authenticated players may view/edit only their OWN non-sensitive profile.
grant select, insert, update on public.snl_profiles to authenticated;
create policy "Players read own SNL profile"
  on public.snl_profiles for select to authenticated
  using (user_id = (select auth.uid()));
create policy "Players create own SNL profile"
  on public.snl_profiles for insert to authenticated
  with check (user_id = (select auth.uid()));
create policy "Players update own SNL profile"
  on public.snl_profiles for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Registrations are readable only by the owner, with NO client write grants.
-- Real player enrollment and staff queues will require further audited policies
-- or validated server-side endpoints and negative access-control tests.
grant select on public.snl_registrations to authenticated;
create policy "Players read own SNL registration"
  on public.snl_registrations for select to authenticated
  using (player_user_id = (select auth.uid()));

-- There are intentionally NO anon/authenticated grants or RLS policies
-- for snl_staff_assignments. Never expose staff grants to client writes.
-- Similarly, there is NO real waiver signing/storage/review table here.

-- Seed only non-personal league data.
insert into public.snl_teams (code, name) values
  ('BUF','Buffaloes'),
  ('IHT','IHT'),
  ('MOR','MORSL'),
  ('OUT','Outcasts'),
  ('PM','Pacific Maul'),
  ('RAC','Toronto Raccoons');

insert into public.snl_events (code, label, kind, event_date) values
  ('F26','2026–27 Fall League','league',null),
  ('W27','2026–27 Winter League','league',null),
  ('HOL26','SNL Third Annual Holiday Tournament','tournament','2026-12-27');

insert into public.snl_event_teams (event_code, team_code)
select e.code, t.code
from public.snl_events as e cross join public.snl_teams as t
where e.code in ('F26','W27');

commit;
