# E-PULAG Change List Patch (2026-11-22)

This patch contains complete replacement files, not snippets. It is a partial implementation and is NOT claimed to complete all nine requested items.

## Files to replace
- `web/components/shared/chatbox/DirectChatbox.tsx`
- `web/components/shared/chatbox/Chatbox.tsx`
- `web/components/user/packages/BookPackage.tsx`
- `web/components/organizer/OrganizerUpcomingTrips.tsx`
- `api/app/Http/Controllers/Api/PackageBookingController.php`

## Implemented in this patch
- Removed the StaffReservationCreator button/modal block from the slot-coordination Chatbox UI (the component source is no longer imported/rendered there).
- Added automatic polling in DirectChatbox for conversation list and selected conversation, every five seconds, with cleanup.
- Added frontend name-pattern constraints for participant full names and emergency contact names in the public package booking form.
- Added Laravel server-side Unicode name validation for those tourist and emergency-contact fields in PackageBookingController.
- Fixed singular/plural visitor wording in OrganizerUpcomingTrips.

## Existing functionality confirmed in source
- Public package booking already records participant data separately from the booking account, supporting participants without their own account.
- Participant records already contain an age field, and the form already accepts participant ages; age field and participant-age handling are already present in source.
- The conversation-contacts API already has role-based contact rules for ADMIN and EMPLOYEE; the DirectChatbox recipient dropdown already exists.
- The participant section already uses individual fieldsets/cards and displays count and max limit.

## Not yet implemented/verified
- Admin/Employee recipient selection in their specific dashboard messaging screens: verify those screens use DirectChatbox and test role-restricted contacts.
- The participant-card UI redesign is only partially represented by existing card UI; no major visual redesign was done in this patch.
- Package-editor image-insertion corruption was not fixed: the exact Admin editor path/serialization flow needs further tracing and reproduction.
- No full build/test run: frontend dependencies were not installed in this working copy. PHP syntax lint passed for PackageBookingController.

## Testing after replacing
1. Replace the listed files in your project.
2. Rebuild/restart Docker containers as appropriate.
3. Test messaging: send and receive, wait up to five seconds for automatic updates.
4. Test booking names with letters, spaces, hyphens and apostrophes, then try numeric names and confirm rejection.
5. Test visitor count display with 1 and 2 participants.
6. Please do not treat this patch as final acceptance for the package editor.
