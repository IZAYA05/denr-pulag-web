# E-PULAG Admin/Employee Chat Fix

## Replace these complete files
- `web/components/shared/chatbox/Chatbox.tsx`
- `web/components/shared/chatbox/DirectChatbox.tsx`
- `web/app/(Admin Dashboard)/admin/chatbox/page.tsx`
- `web/app/(Employee Dashboard)/employee/chatbox/page.tsx`

## Changes
- Admin and Employee chatbox pages now include the DirectChatbox recipient-selection interface.
- The DirectChatbox recipient list uses the existing `/api/conversation-contacts` endpoint and its role-based restrictions.
- Direct-message conversations are excluded from the reservation/application workflow list so they appear in the dedicated direct-message interface.
- Reservation/organizer workflow messages automatically synchronize every five seconds while the page is visible.
- The existing DirectChatbox automatically refreshes its conversations and selected conversation every five seconds.

## Validation
- Files are complete replacements, not snippets.
- A full Next.js build/typecheck was not run because dependencies are not installed in this working copy and Docker is unavailable in the execution environment.
