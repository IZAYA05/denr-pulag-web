import { redirect } from "next/navigation";

// The former coordination-verification endpoint was removed from the API.
// Booking decisions are handled in the current Organizer Bookings workflow.
export default function OrganizerVerificationPage() {
  redirect("/organizer/bookings");
}
