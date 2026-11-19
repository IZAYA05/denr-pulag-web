# E-PULAG Project Handoff

Last updated: 2026-11-12

## Project rules

1. The user authorizes inspection of all files they upload or make accessible for E-PULAG work. Do not ask for permission to read shared project files again.
2. Work on the `main` branch only. Do not create or switch to feature branches unless the user changes this instruction.
3. Preserve existing source, UI, architecture, local work, untracked files, and backups unless the user explicitly approves removal.
4. Before code changes, inspect the current source. When presenting manual code replacements, provide complete ready-to-replace files.
5. Never run destructive database reset commands against the user's local or production database.
6. Keep the deployment compatible with Render's free tier. Do not assume paid Render Shell, persistent disks, or paid services.
7. Do not commit or publish environment files, secrets, passwords, tokens, database URLs, or private uploaded documents.

## Architecture

- Frontend: Next.js 16, React 19, Tailwind CSS 4, NextAuth v5 Credentials/JWT.
- Backend: Laravel 12, PHP 8.4, Sanctum bearer tokens.
- Database: PostgreSQL.
- Local API port: 18000.
- Local web port: 3000.
- Render uses `api/Dockerfile.prod` and `web/Dockerfile.prod` as separate services. `compose.prod.yaml` is for local production-mode testing, not the Render service deployment definition.
- Roles: `ADMIN`, `EMPLOYEE`, `ORGANIZER`, `USER`.

## Established booking rules

- Maximum 12 participants per group.
- Shared daily visitor capacity of 500 across direct reservations and package bookings.
- Cancelled and rejected bookings do not consume capacity.
- A booking requires at least 30 days' lead time in the current backend implementation. Confirm with DENR if the intended rule is a 30-day minimum lead time or a maximum 30-day advance booking window before changing it.
- Holiday and closure dates are managed through the new blocked-date list. DENR staff must maintain the list; there is no automatic public-holiday calendar integration.
- No online payment integration. Payments are handled manually by DENR.
- Medical certificates are presented physically; the system does not collect them.
- Chatbox messages do not automatically create confirmed bookings. Staff must explicitly create the official booking record after coordination and capacity checks.

## Changes made in the working copy on 2026-11-12

### Backend migrations added

- `2026_11_12_000001_add_package_approval_workflow.php`
  - Adds package approval status, reviewer, review timestamp, and notes.
  - Existing packages are backfilled as `APPROVED` to preserve current public availability.
  - New organizer packages default to `PENDING`.
- `2026_11_12_000002_create_blocked_dates_table.php`
  - Stores DENR blocked dates and reasons.
- `2026_11_12_000003_create_booking_capacity_locks_table.php`
  - Adds an independent row lock for the shared 500-person capacity check. Capacity locking no longer depends on a Trail row existing.
- `2026_11_12_000004_create_conversations_table.php`
  - Adds reservation coordination and organizer-application conversations.
- `2026_11_12_000005_create_messages_and_attachments_tables.php`
  - Adds messages and private document attachments. Attachment bytes are stored in PostgreSQL `bytea` so documents survive Render free-service restarts/deploys; image uploads are limited to 3 MB each.
- `2026_11_12_000006_create_organizer_applications_table.php`
  - Stores DOT accreditation number, business permit number, review status, reviewer, and review notes.
- `2026_11_12_000007_add_official_reservation_link_to_conversations.php`
  - Links reservation coordination conversations to the official reservation record created by staff.
- `2026_11_12_000008_create_announcements_table.php`
  - Adds draft, published, and scheduled announcements.

### Backend functionality added/changed

- Added Admin package approval endpoints. New organizer packages are hidden from the public catalog until approved. Editing a package sends it back for review.
- Added blocked-date endpoints and backend enforcement for new reservations and package bookings.
- Added date-range capacity/availability summaries.
- Added active-account middleware to authenticated API routes while still allowing inactive users to call logout and revoke their token.
- Restricted online reservation and package-booking creation to `USER` accounts.
- Explicitly rejects online bookings of the Walk-in Package.
- Added organizer application and conversation APIs. Only Admin can approve/reject/request revision for organizer role applications; approval grants the `ORGANIZER` role. Employees can view and reply but cannot grant the role.
- Organizer application requires both DOT accreditation and business permit numbers plus image attachments. DENR review is manual; there is no automated credential verification.
- Added visitor reservation coordination conversations. Staff can reply and, after confirming availability, explicitly create an approved official direct-reservation record from the conversation. This action enforces the shared capacity, blocked-date rule, group size, and current 30-day lead-time rule.
- Added announcements API with public published feed and Admin create/edit/delete.
- Updated Laravel default timezone to `Asia/Manila` and added `APP_TIMEZONE` to `.env.example` and Docker Compose configurations.
- Updated the local `api/Dockerfile` to install `mbstring` and `bcmath`, which Laravel requires; production Dockerfile already installs them.
- Fixed Admin report visitor export to include direct reservation participants and package tourists. Daily visitor totals now exclude cancelled/rejected bookings consistently with the capacity service.

### Frontend functionality added/changed

- Added Admin Package Approvals page and navigation.
- Added blocked-date manager to Admin Calendar and Employee Trail Schedules.
- Added visual month availability calendar to package booking and reservation coordination, including available/unavailable indicators and selected-date capacity.
- Replaced static User Reservation History with API-backed direct and package booking history.
- Replaced static Organizer Dashboard statistics, upcoming trips, and package list with API-backed data.
- Added shared chatbox UI to User, Admin, and Employee portals.
- Added manual document image preview/download in chatbox using authenticated requests.
- Added staff form to create an official direct reservation after a reservation coordination conversation.
- Added Admin announcement management and public visitor announcement feed. Removed duplicated static announcement samples.
- Updated organizer package UI to show DENR approval status and prevent activation before approval.
- Corrected organizer package booking labels so Organizer approval is not shown as final confirmation while DENR approval is still pending.
- Updated landing-page trail image paths to existing public assets and removed the contradictory “Unofficial” badge.
- Removed non-functional Save/Cancel buttons from read-only Admin Settings and clarified the current booking policy text.
- Added Laravel token revocation before NextAuth sign-out across existing dashboard sign-out controls.
- Redirected the old orphan `/organizer/verification` page to `/organizer/bookings` because its previous coordination API endpoint no longer exists.

## Pending decisions / work

1. **Monthly booking limit:** confirm whether the rule means one active booking per user per hiking calendar month, counting direct and package bookings together, or one booking submission per calendar month. Do not enforce until confirmed.
2. Confirm whether all DENR Employees should be allowed to approve organizer package submissions. Current implementation restricts package approval and organizer role approval to Admin; Employees can reply to chatbox conversations and create confirmed coordinated reservations.
3. Confirm whether DOT accreditation and business permit are both mandatory for every organizer application or whether either one is acceptable in a particular case. Current implementation requires both.
4. Verify the intended interpretation of the 30-day booking rule with DENR.
5. Test migrations and all new workflows against a local PostgreSQL database before pushing to `main`.
6. Run capacity tests, including concurrent requests approaching 500 visitors.
7. Consider adding an automated official-holiday source only if DENR provides/approves one; current blocked dates are manually maintained.
8. Full Next.js build has not been completed in the Linux review environment because the ZIP contains Windows Next.js SWC binaries. TypeScript check passed.
9. PHP syntax checks passed, but Laravel tests could not run in the review environment because its host PHP installation lacks `mbstring` (the Dockerfiles install it). Run tests in the project Docker container or a PHP environment with required extensions.
10. Full repository ESLint still reports pre-existing errors in untouched components. Newly added/modified feature files were linted separately and passed.

## Safe local validation commands

From the project root:

```powershell
# Confirm current branch and preserve local/untracked work
git branch --show-current
git status --short

# Apply pending migrations to the configured local database only
docker compose exec api php artisan migrate --force

# Check frontend TypeScript
cd web
npx tsc --noEmit

# Check PHP syntax (from project root, if PHP is installed)
Get-ChildItem api\app,api\database\migrations,api\routes,api\tests -Recurse -Filter *.php | ForEach-Object { php -l $_.FullName }
```

Do not use `migrate:fresh`, `db:wipe`, `migrate:reset`, or `git clean` against the user's environment.

## Render deployment notes

- `api/Dockerfile.prod` runs `php artisan migrate --force` before starting Laravel. New migrations will therefore apply on the next successful Render deployment from `main`.
- Check Render deploy logs for migration failures before testing the frontend.
- Render free services can spin down after inactivity. This is a free-tier limitation.
- Chatbox document bytes are stored in PostgreSQL rather than the ephemeral container filesystem.
- Rotate any production DB password and NextAuth `AUTH_SECRET` that were included in the previously uploaded ZIP. Do not casually rotate Laravel `APP_KEY`.
- Never include `.env`, `.env.render`, `web/.env`, or logs in future project ZIPs.


## Pre-Docker safety correction (2026-11-12)
- `api/Dockerfile` installs `pdo_sqlite` and `libsqlite3-dev` for isolated test execution.
- `api/phpunit.xml` forces `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:`, clears `DB_URL`, and enables SQLite foreign keys. This is required because `BookingCapacityTest` uses Laravel `RefreshDatabase`, which runs `migrate:fresh` against the configured test connection.
- `api/Dockerfile` and `api/Dockerfile.prod` set `upload_max_filesize=4M`, `post_max_size=10M`, and `max_file_uploads=10` to support the chatbox's 3 MB per-image validation.

## Organizer Portal enhancement (2026-11-19)

The Organizer Portal enhancement is provided as a patch on top of the uploaded `main` working copy at `0bb3d3278a26efe1b0d0a2d597a9b986408b3978`.

### Organizer-facing features

- Dashboard quick links to Package Bookings, My Packages, Booking Calendar, Messages, and Reports.
- Booking Calendar displays the organizer's package booking dates and selected-day trip details. It is a read-only view; DENR remains responsible for official blocked dates and trail schedules.
- Reports summarize package bookings by selected hike-date range, organizer/DENR status, tourist counts, and package performance. CSV export includes booking details. It intentionally does not estimate revenue because payments are handled manually by DENR.
- Messages lets an organizer start or continue a conversation only for a real package booking belonging to that organizer. The conversation is linked to the package booking and the tourist customer.
- DENR Support gives organizers a separate support conversation workflow with DENR Admin/Employee staff.
- Business Verification displays the organizer's recorded application status, business permit number, DENR feedback, and submitted business permit image when available.
- Package Booking details now include the booking customer and tourist participant records.
- The booking table has a Message Customer action. Non-functional Edit Booking and unsupported organizer-side Cancel Booking actions were removed; organizers retain the existing approve/reject workflow for pending package bookings.
- Existing Profile Settings and notification bell remain available.

### Messaging permissions

- An organizer can initiate a package conversation only by supplying a package booking ID whose package is owned by that organizer and whose customer has the USER role.
- Each package booking can have one linked conversation. The conversation stores `organizer_id` and `package_booking_id`; `user_id` remains the tourist/customer participant.
- The tourist can view and reply to the linked conversation from the existing User Chatbox.
- Organizers cannot initiate conversations with arbitrary users, other organizers, or customers of another organizer.
- Organizers can independently start `ORGANIZER_SUPPORT` conversations with DENR.
- Admin and Employee staff retain access to all conversations for oversight and can reply to both package and organizer-support conversations.
- Existing conversation history is retained with the booking record. No automatic reservation approval or booking creation occurs through messaging.

### Backend migration and validation

- Added migration `2026_11_19_000001_add_organizer_booking_conversations.php` to add nullable `organizer_id` and `package_booking_id` columns, foreign keys, a unique package-booking conversation constraint, and an organizer conversation index.
- Added `OrganizerMessagingTest` covering organizer ownership, tourist access/replies, blocked cross-organizer access, tourist initiation restrictions, and DENR support creation.
- PHP syntax checks passed for the changed backend files and test file.
- TypeScript `tsc --noEmit` passed.
- ESLint passed for the changed/new Organizer Portal and shared chatbox files.
- Full Next.js production build could not be completed in the review environment because the Linux SWC binary was absent and the environment could not reach the npm registry to download it.
- Laravel PHPUnit tests were not executed in this review environment: host PHP lacks `mbstring` and `pdo_sqlite`, and Docker is unavailable here. Run the new migration and tests in the project's local Docker environment before deployment.
- Do not deploy until the migration and `OrganizerMessagingTest` have passed against the isolated test database and the full frontend build succeeds in the user's normal build environment.
