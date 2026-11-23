# SNL Supabase foundation — prepared, not deployed

**Status: DRAFT.** The database migration is stored in GitHub only. It has **NOT** been executed against a Supabase project, and no account credentials or player records were used.

The public registration website remains a fictional in-memory demonstration.

## What's ready
- Six SNL teams: BUF, IHT, MOR, OUT, PM, RAC.
- Two indoor leagues: F26 Fall and W27 Winter; HOL26 Third Annual Holiday Tournament on Dec. 27, 2026.
- Tables for public team/event catalog, minimal user-owned display profiles, season registrations and server-controlled scoped staff assignments.
- Row Level Security (RLS) enabled on every table, with explicit client grants. Anonymous visitors can only read the non-personal team/event catalog. Signed-in users can read their own registrations and manage their own **display-name** profile.
- **No** browser writes to registration or staff assignment records, no staff dashboards linked to the database, no real waiver submissions/signatures/documents. No dummy players have been inserted.

## Why restricted?
SNL has not yet connected a trusted authentication workflow to the existing public GitHub Pages interface, and we have not exercised row-level denial tests on the actual database. A false sense of access control would be worse than leaving the demo isolated.

## To apply
1. Confirm that ChatGPT has access to your Supabase app and identify the **correct SNL project**. A GitHub login to Supabase is not the same as granting ChatGPT access.
2. Review `supabase/migrations/20261122000000_snl_registration_foundation.sql` before applying. It is intended for a **fresh development project**. It uses `CREATE TABLE` rather than `IF NOT EXISTS` to avoid silently changing an existing application.
3. Apply through a connected Supabase project/SQL Editor **only after verifying the target project**; do not run it on unrelated production data.
4. Verify the seed counts: 6 teams, 3 events, 12 event-team rows; verify table RLS enabled and anon/authenticated grants.
5. Run authenticated and anonymous **negative tests**: anonymous can't read profiles/registrations/assignments; a player can only read their own profile and registrations; nobody using public client credentials can approve players or grant staff roles.
6. Add verified login, team-scoped captain reads/decisions, admin waiver workflows, proper audit logging and signature evidence **before** accepting real data.

## Security notes
- Do not paste or commit database passwords, service-role/secret keys, JWTs, or private connection strings into the repository or ChatGPT.
- A publishable/anon key can be in a public frontend **only with tested RLS**. Server credentials must never be in browser JS.
- Real signature capture is out of scope. Final indoor coverage dates, facility terms, uninsured risk, privacy and backups still require resolution.
- Existing `snl_demo_role` and `snl_demo_invite` URL parameters are just fictional UI navigation. **Never** treat them as authentication.

## Official references
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/managing-user-data
- https://supabase.com/docs/guides/security/production-checklist
