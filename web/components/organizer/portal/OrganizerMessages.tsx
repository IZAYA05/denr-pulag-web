"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, RefreshCw, Send, UserRound } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

type Customer = { id: number; first_name: string; last_name: string; email?: string };
type Booking = {
  id: number;
  booking_number: string;
  hiking_date: string;
  tourist_count: number;
  status: string;
  denr_status?: string | null;
  customer?: Customer | null;
  package?: { id: number; name: string } | null;
  trail?: { name: string } | null;
};
type Message = {
  id: number;
  body?: string | null;
  created_at: string;
  sender?: { id: number; first_name: string; last_name: string; role?: string } | null;
};
type Conversation = {
  id: number;
  type: string;
  subject: string;
  status: string;
  package_booking_id?: number | null;
  messages?: Message[];
  package_booking?: { booking_number?: string } | null;
};
type ApiResponse = { bookings?: Booking[]; conversations?: Conversation[]; conversation?: Conversation; message?: string; errors?: Record<string, string | string[]> };

function dateLabel(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Manila" }).format(new Date(year, month - 1, day));
}

function timeLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }).format(date);
}

function personName(customer?: Customer | null) {
  return customer ? `${customer.first_name} ${customer.last_name}`.trim() : "Tourist";
}

export default function OrganizerMessages() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const currentUserId = Number(session?.user?.id);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [firstMessage, setFirstMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Your session has expired. Please sign in again.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const headers = { Accept: "application/json", Authorization: `Bearer ${token}` };
      const [bookingResponse, conversationResponse] = await Promise.all([
        fetch(`${API_URL}/api/package-bookings`, { headers, cache: "no-store" }),
        fetch(`${API_URL}/api/conversations?type=PACKAGE_BOOKING`, { headers, cache: "no-store" }),
      ]);
      const [bookingData, conversationData] = await Promise.all([
        bookingResponse.json() as Promise<ApiResponse>,
        conversationResponse.json() as Promise<ApiResponse>,
      ]);
      if (!bookingResponse.ok) throw new Error(bookingData.message || "Unable to load package bookings.");
      if (!conversationResponse.ok) throw new Error(conversationData.message || "Unable to load messages.");
      setBookings(Array.isArray(bookingData.bookings) ? bookingData.bookings : []);
      setConversations(Array.isArray(conversationData.conversations) ? conversationData.conversations : []);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const selectedBooking = useMemo(
    () => bookings.find((booking) => booking.id === selectedBookingId) || null,
    [bookings, selectedBookingId]
  );

  const openBooking = useCallback(async (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setSelectedConversation(null);
    setFirstMessage("");
    setReply("");
    setError("");
    const existing = conversations.find((item) => item.package_booking_id === bookingId);
    if (!existing || !token) return;
    try {
      const response = await fetch(`${API_URL}/api/conversations/${existing.id}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.conversation) throw new Error(data.message || "Unable to open this conversation.");
      setSelectedConversation(data.conversation);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to open this conversation.");
    }
  }, [conversations, token]);


  async function startConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedBooking || !firstMessage.trim()) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch(`${API_URL}/api/conversations`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ type: "PACKAGE_BOOKING", package_booking_id: selectedBooking.id, body: firstMessage.trim() }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.conversation) throw new Error(data.message || "Unable to start the conversation.");
      setSelectedConversation(data.conversation);
      setFirstMessage("");
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start the conversation.");
    } finally {
      setSending(false);
    }
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !selectedConversation || !reply.trim()) return;
    setSending(true);
    setError("");
    try {
      const body = new FormData();
      body.append("body", reply.trim());
      const response = await fetch(`${API_URL}/api/conversations/${selectedConversation.id}/messages`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        body,
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok) throw new Error(data.message || "Unable to send your message.");
      setReply("");
      const detailResponse = await fetch(`${API_URL}/api/conversations/${selectedConversation.id}`, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const detailData = (await detailResponse.json()) as ApiResponse;
      if (!detailResponse.ok || !detailData.conversation) throw new Error(detailData.message || "Message sent, but the conversation could not be refreshed.");
      setSelectedConversation(detailData.conversation);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send your message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-5">
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800">
            <h2 className="font-semibold text-zinc-900 dark:text-white">Customers</h2>
            <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
          <div className="max-h-[680px] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {loading ? <p className="p-6 text-center text-sm text-zinc-500">Loading bookings...</p> : bookings.length === 0 ? (
              <div className="p-8 text-center"><UserRound className="mx-auto h-8 w-8 text-zinc-300" /><p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">No package bookings yet</p></div>
            ) : bookings.map((booking) => {
              const active = booking.id === selectedBookingId;
              const hasConversation = conversations.some((item) => item.package_booking_id === booking.id);
              return (
                <button key={booking.id} type="button" onClick={() => void openBooking(booking.id)} className={`w-full p-4 text-left transition ${active ? "bg-emerald-50 dark:bg-emerald-950/30" : "hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{personName(booking.customer)}</p>
                    {hasConversation && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">Message thread</span>}
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{booking.package?.name || "Package"} · {booking.booking_number}</p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{dateLabel(booking.hiking_date)} · {booking.tourist_count} tourists</p>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="flex min-h-[620px] min-w-0 flex-col overflow-hidden p-0">
          {!selectedBooking ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><MessageCircle className="h-10 w-10 text-zinc-300" /><p className="mt-3 font-semibold text-zinc-800 dark:text-zinc-200">Select a booking</p><p className="mt-1 text-sm text-zinc-500">Messages are available only for tourists who submitted a booking for one of your packages.</p></div>
          ) : (
            <>
              <div className="border-b border-zinc-200 p-5 dark:border-zinc-800">
                <h2 className="font-semibold text-zinc-900 dark:text-white">{personName(selectedBooking.customer)}</h2>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{selectedBooking.package?.name} · {selectedBooking.booking_number} · {dateLabel(selectedBooking.hiking_date)}</p>
              </div>
              {selectedConversation ? (
                <>
                  <div className="flex-1 space-y-4 overflow-y-auto bg-zinc-50/70 p-5 dark:bg-zinc-950/40">
                    {(selectedConversation.messages || []).length === 0 ? <p className="py-8 text-center text-sm text-zinc-500">No messages yet.</p> : (selectedConversation.messages || []).map((message) => {
                      const mine = message.sender?.id === currentUserId;
                      return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl p-3 ${mine ? "rounded-br-md bg-emerald-700 text-white" : "rounded-bl-md border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"}`}><p className={`mb-1 text-[11px] font-semibold ${mine ? "text-emerald-100" : "text-zinc-400"}`}>{mine ? "You" : `${message.sender?.first_name || "Tourist"} ${message.sender?.last_name || ""}`} · {timeLabel(message.created_at)}</p>{message.body && <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>}</div></div>;
                    })}
                  </div>
                  {selectedConversation.status === "CLOSED" ? <p className="border-t border-zinc-200 p-4 text-center text-xs text-zinc-500 dark:border-zinc-800">This conversation is closed.</p> : (
                    <form onSubmit={sendReply} className="flex items-end gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800">
                      <textarea rows={2} maxLength={5000} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a message..." className="min-h-12 flex-1 resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
                      <Button type="submit" disabled={sending || !reply.trim()}><Send className="h-4 w-4" /><span className="sr-only">Send message</span></Button>
                    </form>
                  )}
                </>
              ) : (
                <form onSubmit={startConversation} className="flex flex-1 flex-col gap-4 p-5">
                  <div className="rounded-xl bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">Start a conversation with this tourist about their package booking.</div>
                  <textarea required rows={5} maxLength={5000} value={firstMessage} onChange={(event) => setFirstMessage(event.target.value)} placeholder="Write your first message..." className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
                  <div className="mt-auto flex justify-end"><Button type="submit" disabled={sending || !firstMessage.trim()}><Send className="mr-2 h-4 w-4" />{sending ? "Sending..." : "Start conversation"}</Button></div>
                </form>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
