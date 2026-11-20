# SNL Indoor Registration — Staff Access Blueprint (Planning Only)

**Status:** Architecture proposal, not live authentication. The public GitHub Pages `registration.html` is a simulation with fictional, in-memory data and a role preview that anyone can switch.

## Product boundary
- Keep the public league website and preview on GitHub Pages; never store secrets, password hashes, actual waivers, legal names, private emails, session secrets, or administrative lists in the public repository.
- A separate authenticated backend/service is **required** for real permissions, persistent records, consent receipts, signed documents and audit logs. Hiding tabs in JavaScript **is not** security.
- Only enable real signing after SNL confirms coverage dates, final agreement/consent wording, record-retention and privacy practices, operational safeguards, and resolves uninsured liability risks.

## Proposed permissions
| Actor | Scope | Allowed | Prohibited |
| --- | --- | --- | --- |
| Public visitor | Public | View open events and public coverage | Read/write private records, staff actions |
| Player | Self, assigned events | Manage profile, submit a covered waiver, see own status | Change team via URL, grant self captain/admin status, review others |
| Captain | Explicitly assigned team **and season** | Generate event-scoped invites, view roster name/jersey and status, approve/decline own team | View private legal names, contact details, signed waivers; manage other teams; mark waiver checked |
| SNL waiver reviewer/admin | Authorized seasons/events | Review waiver evidence/status, mark verified/recheck, audit status; administer authorized events | Assume signatures exist based only on `DEMO`, bypass evidence validation |
| System owner | Explicitly granted | Manage staff assignments and event settings, review audit trails | Use public website source as database |

If a person legitimately holds multiple staff roles, grant them as **separate explicit assignments**, not an accidental consequence of being a player or opening an invite URL.

## Recommended trust model
1. Use a managed identity provider with email verification; require MFA for all staff accounts. Sign in via a trusted provider; never expose staff passwords or tokens to GitHub.
2. Store staff assignments as server-owned rows (e.g. `user_id`, `role`, `team_id`, `season_id`, active/revoked). Only owner/admin can grant them. Make permission decisions on the server for *every read and write*, not in UI code or URL parameters.
3. Use server-enforced scoped queries / database row-level security (RLS). Captains can affect only a row whose **team and season** match an active assignment; admins only authorized events; clients must never submit a role or `is_admin` flag to gain access.
4. Treat invitation URLs as event/team references **only**. They cannot authenticate a captain or prove a player's identity. A real invitation needs a revocable, expiring, server-validated token or authenticated approval flow; do not use `BUF-F26` as a security credential.
5. Store waiver records and signature evidence in private storage; return only an appropriate completion/verified status to captains. An administrator must distinguish **submitted** from **verified** and retain the exact waiver version, event/period, timestamp and tamper-evident evidence.
6. Audit every captain approval, waiver verification/reversal, access grant and record export with actor, date/time, target and before/after state; log access to sensitive documents. Rate-limit and monitor staff endpoints.
7. Define retention and privacy-response process before launch. Do not collect real data in the public demo. Keep public roster names separate from private signing identities.

## Implementation gates / acceptance tests
- Public user: `GET staff roster`, `POST approve`, `POST verify waiver` all rejected by backend.
- Captain for Buffaloes / Fall: can read/approve Buffaloes Fall only; cannot access Pacific Maul or Buffaloes Winter without explicit grant, even when changing request IDs or URLs.
- Captain cannot verify waivers or read signed files. Admin waiver reviewer cannot approve another team's roster by default.
- Status `cleared` is computed from **captain-approved AND valid verified waiver covering the event**; reversing either immediately removes clearance.
- Tournament-only participant can complete relevant waiver without a public profile; authorized SNL admin sees verification status.
- Revoked staff sessions/tokens lose access; signed waiver file URLs expire; no private data appears in static source or browser error logs.
- No real signing flow is turned on just by removing a `DEMO` label.

## Current demo behaviour
The staff-role switcher at `/registration.html` intentionally lets any visitor pretend to be Public, Captain or SNL Admin. Its only purpose is to test navigation and workflow decisions in temporary fictional records. It provides **zero** real access control. Selecting a simulated captain team in that switcher is not an authorization step.

## Before production
Choose a managed auth/backend platform, implement backend checks and private storage, test negative authorization scenarios end-to-end, confirm final indoor waiver coverage and legal/privacy requirements, and establish appropriate insurance/risk management before real registrations.
