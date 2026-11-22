"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  FileText,
  MessageCircle,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import AttachmentPreview from "./AttachmentPreview";
import HikingDatePicker, { type BookingCapacitySummary } from "@/components/user/packages/HikingDatePicker";

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

type ChatboxMode = "visitor" | "staff";

type RequestType = "RESERVATION_REQUEST" | "ORGANIZER_APPLICATION";

type ConversationType =
  | RequestType
  | "DIRECT_MESSAGE"
  | "DENR_SUPPORT"
  | "ORGANIZER_SUPPORT"
  | "PACKAGE_BOOKING";

type ApiUser = {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  role?: string;
};

type ApiReservation = {
  id: number;
  reservation_number: string;
  hiking_date: string;
  status: string;
};

type ApiAttachment = {
  id: number;
  document_type?: string | null;
  original_name: string;
  mime_type: string;
  file_size: number;
};

type ApiMessage = {
  id: number;
  body?: string | null;
  created_at: string;
  sender?: ApiUser | null;
  attachments?: ApiAttachment[];
};

type ApiOrganizerApplication = {
  id: number;
  status: string;
  dot_accreditation_number: string;
  business_permit_number: string;
  review_notes?: string | null;
  reviewer?: ApiUser | null;
};

type ApiTrail = {
  id: number;
  name: string;
};

type ApiConversation = {
  id: number;
  type: ConversationType;
  subject: string;
  status: string;
  requested_hiking_date?: string | null;
  requested_visitors?: number | null;
  requested_trail?: ApiTrail | null;
  user?: ApiUser | null;
  recipient?: ApiUser | null;
  organizer_application?: ApiOrganizerApplication | null;
  created_reservation?: ApiReservation | null;
  latest_message?: ApiMessage | null;
  messages?: ApiMessage[];
  last_message_at?: string | null;
};

type ApiResponse = {
  conversations?: ApiConversation[];
  conversation?: ApiConversation;
  trails?: ApiTrail[];
  message?: string;
  conversation_id?: number;
  errors?: Record<string, string | string[]>;
};

function getErrorMessage(data: ApiResponse, fallback: string) {
  const firstError = Object.values(data.errors ?? {})
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .find((value): value is string => typeof value === "string");

  return firstError || data.message || fallback;
}

function formatPerson(user?: ApiUser | null) {
  if (!user) return "Unknown user";
  return [user.first_name, user.last_name].filter(Boolean).join(" ") || "Unknown user";
}

function formatDate(value?: string | null) {
  if (!value) return "Not specified";
  const dateOnly = value.slice(0, 10);
  const [year, month, day] = dateOnly.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Manila",
  }).format(new Date(year, month - 1, day));
}

function formatDateTime(value?: string | null) {
  if (!value) return "No messages yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently";
  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(parsed);
}

function statusTone(status?: string | null) {
  switch ((status || "").toUpperCase()) {
    case "PENDING":
    case "NEEDS_REVISION":
    case "OPEN":
      return "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300";
    case "APPROVED":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300";
    case "REJECTED":
    case "CLOSED":
      return "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300";
    default:
      return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  }
}

function getMinimumHikingDate() {
  const now = new Date();
  const manilaDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [year, month, day] = manilaDate.split("-").map(Number);
  const minimum = new Date(year, month - 1, day + 30);
  const y = minimum.getFullYear();
  const m = String(minimum.getMonth() + 1).padStart(2, "0");
  const d = String(minimum.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function Chatbox({
  mode,
  embedded = false,
}: {
  mode: ChatboxMode;
  embedded?: boolean;
}) {
  const { data: session } = useSession();
  const accessToken = session?.user?.accessToken;
  const currentRole = session?.user?.role || "USER";
  const isAdmin = currentRole === "ADMIN";
  const isStaff = mode === "staff";

  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [contacts, setContacts] = useState<ApiUser[]>([]);
  const [showDirectCreate, setShowDirectCreate] = useState(false);
  const [directRecipientId, setDirectRecipientId] = useState("");
  const [directFirstMessage, setDirectFirstMessage] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<ApiConversation | null>(null);
  const [trails, setTrails] = useState<ApiTrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [requestType, setRequestType] = useState<RequestType>("RESERVATION_REQUEST");
  const [newBody, setNewBody] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [requestCapacity, setRequestCapacity] = useState<BookingCapacitySummary | null>(null);
  const [requestedTrailId, setRequestedTrailId] = useState("");
  const [requestedVisitors, setRequestedVisitors] = useState("1");
  const [dotNumber, setDotNumber] = useState("");
  const [permitNumber, setPermitNumber] = useState("");
  const [dotFile, setDotFile] = useState<File | null>(null);
  const [permitFile, setPermitFile] = useState<File | null>(null);
  const [reply, setReply] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [revisionDotNumber, setRevisionDotNumber] = useState("");
  const [revisionPermitNumber, setRevisionPermitNumber] = useState("");
  const [revisionDotFile, setRevisionDotFile] = useState<File | null>(null);
  const [revisionPermitFile, setRevisionPermitFile] = useState<File | null>(null);

  const loadConversations = useCallback(async (silent = false) => {
    if (!accessToken) {
      setConversations([]);
      setLoading(false);
      setError("Your session is missing an API access token. Please sign in again.");
      return;
    }

    if (!silent) {
      setLoading(true);
      setError("");
    }

    try {
      const response = await fetch(`${API_URL}/api/conversations`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(getErrorMessage(data, "Unable to load conversations."));
      }

      const allConversations = Array.isArray(data.conversations)
        ? data.conversations
        : [];

      let directConversations: ApiConversation[] = [];
      if (isStaff) {
        const [contactsResponse, directResponse] = await Promise.all([
          fetch(`${API_URL}/api/conversation-contacts`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          }),
          fetch(`${API_URL}/api/conversations?type=DIRECT_MESSAGE`, {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            cache: "no-store",
          }),
        ]);
        const contactsData = (await contactsResponse.json()) as ApiResponse & { contacts?: ApiUser[] };
        const directData = (await directResponse.json()) as ApiResponse;
        if (!contactsResponse.ok || !directResponse.ok) {
          throw new Error(contactsData.message || directData.message || "Unable to load direct chats.");
        }
        setContacts(Array.isArray(contactsData.contacts) ? contactsData.contacts : []);
        directConversations = Array.isArray(directData.conversations)
          ? directData.conversations
          : [];
      }

      const next = [...allConversations, ...directConversations].sort((a, b) =>
        (b.last_message_at || b.latest_message?.created_at || "").localeCompare(
          a.last_message_at || a.latest_message?.created_at || ""
        )
      );

      setConversations(next);
      setSelectedId((current) =>
        current && next.some((item) => item.id === current)
          ? current
          : next[0]?.id ?? null
      );
    } catch (caught) {
      if (!silent) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to load conversations."
        );
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [accessToken, isStaff]);

  const loadConversation = useCallback(async (id: number, silent = false) => {
    if (!accessToken) return;

    if (!silent) {
      setDetailLoading(true);
      setError("");
    }

    try {
      const response = await fetch(`${API_URL}/api/conversations/${id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok || !data.conversation) {
        throw new Error(
          getErrorMessage(data, "Unable to load this conversation.")
        );
      }

      setSelected(data.conversation);

      if (!silent) {
        const application = data.conversation.organizer_application;

        if (application) {
          setRevisionDotNumber(application.dot_accreditation_number || "");
          setRevisionPermitNumber(application.business_permit_number || "");
          setReviewNotes(application.review_notes || "");
        } else {
          setReviewNotes("");
        }
      }
    } catch (caught) {
      if (!silent) {
        setSelected(null);
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to load this conversation."
        );
      }
    } finally {
      if (!silent) setDetailLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      void Promise.resolve().then(() => loadConversations());
    }
  }, [accessToken, loadConversations]);

  useEffect(() => {
    if (selectedId !== null) {
      void Promise.resolve().then(() => loadConversation(selectedId));
    } else {
      void Promise.resolve().then(() => setSelected(null));
    }
  }, [selectedId, loadConversation]);

  // Automatically synchronize staff and visitor reservation conversations.
  // The selected conversation is refreshed separately so incoming replies appear
  // without a manual page refresh.
  useEffect(() => {
    if (!accessToken) return;

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadConversations(true);
        if (selectedId !== null) void loadConversation(selectedId, true);
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [accessToken, selectedId, loadConversations, loadConversation]);

  useEffect(() => {
    if (!isStaff) {
      fetch(`${API_URL}/api/trails`, { cache: "no-store" })
        .then((response) => response.json())
        .then((data: ApiResponse) =>
          setTrails(Array.isArray(data.trails) ? data.trails : [])
        )
        .catch(() => setTrails([]));
    }
  }, [isStaff]);

  const selectedApplication = selected?.organizer_application;

  const sortedMessages = useMemo(
    () =>
      [...(selected?.messages || [])].sort((a, b) =>
        a.created_at.localeCompare(b.created_at)
      ),
    [selected?.messages]
  );

  async function createConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken) return;

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("type", requestType);
      formData.append("body", newBody.trim());

      if (requestType === "RESERVATION_REQUEST") {
        formData.append("requested_hiking_date", requestedDate);
        formData.append("requested_trail_id", requestedTrailId);
        formData.append("requested_visitors", requestedVisitors);
      } else {
        formData.append("dot_accreditation_number", dotNumber.trim());
        formData.append("business_permit_number", permitNumber.trim());

        if (dotFile) formData.append("dot_certificate", dotFile);
        if (permitFile) formData.append("business_permit", permitFile);
      }

      const response = await fetch(`${API_URL}/api/conversations`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        if (response.status === 409 && data.conversation_id) {
          setShowCreate(false);
          await loadConversations();
          setSelectedId(data.conversation_id);
          setError(
            data.message ||
              "You already have an active organizer application."
          );
          return;
        }

        throw new Error(
          getErrorMessage(data, "Unable to submit your request.")
        );
      }

      setShowCreate(false);
      setNewBody("");
      setDotNumber("");
      setPermitNumber("");
      setDotFile(null);
      setPermitFile(null);
      setRequestedDate("");
      setRequestCapacity(null);
      setRequestedTrailId("");
      setRequestedVisitors("1");
      setSuccess(data.message || "Your request has been submitted.");

      await loadConversations();

      if (data.conversation?.id) {
        setSelectedId(data.conversation.id);
      }
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to submit your request."
      );
    } finally {
      setSending(false);
    }
  }



  async function startDirectConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !directRecipientId || !directFirstMessage.trim()) return;

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/api/direct-conversations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          recipient_id: Number(directRecipientId),
          body: directFirstMessage.trim(),
        }),
      });

      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.conversation) {
        throw new Error(getErrorMessage(data, "Unable to start direct conversation."));
      }

      setDirectFirstMessage("");
      setDirectRecipientId("");
      setShowDirectCreate(false);
      await loadConversations();
      setSelectedId(data.conversation.id);
      setSuccess(data.message || "Direct conversation started.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start direct conversation.");
    } finally {
      setSending(false);
    }
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !selected || !reply.trim()) return;

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("body", reply.trim());

      const response = await fetch(
        `${API_URL}/api/conversations/${selected.id}/messages`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to send your message.")
        );
      }

      setReply("");

      await Promise.all([
        loadConversation(selected.id),
        loadConversations(),
      ]);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to send your message."
      );
    } finally {
      setSending(false);
    }
  }

  async function resubmitApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!accessToken || !selected) return;

    if (!revisionDotFile || !revisionPermitFile) {
      setError(
        "Upload both a revised DOT accreditation certificate image and business permit image."
      );
      return;
    }

    setSending(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append(
        "body",
        reply.trim() ||
          "I am submitting the revised organizer documents requested by DENR."
      );
      formData.append(
        "dot_accreditation_number",
        revisionDotNumber.trim()
      );
      formData.append(
        "business_permit_number",
        revisionPermitNumber.trim()
      );
      formData.append("dot_certificate", revisionDotFile);
      formData.append("business_permit", revisionPermitFile);

      const response = await fetch(
        `${API_URL}/api/conversations/${selected.id}/organizer-application/resubmit`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to resubmit your documents.")
        );
      }

      setReply("");
      setRevisionDotFile(null);
      setRevisionPermitFile(null);
      setSuccess(data.message || "Revised documents submitted.");

      await Promise.all([
        loadConversation(selected.id),
        loadConversations(),
      ]);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to resubmit your documents."
      );
    } finally {
      setSending(false);
    }
  }

  async function reviewApplication(
    decision: "APPROVED" | "REJECTED" | "NEEDS_REVISION"
  ) {
    if (!accessToken || !selected) return;

    if (decision !== "APPROVED" && !reviewNotes.trim()) {
      setError(
        "Add review notes when requesting revisions or rejecting an application."
      );
      return;
    }

    setReviewing(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_URL}/api/conversations/${selected.id}/organizer-application/review`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            decision,
            review_notes: reviewNotes.trim() || null,
          }),
        }
      );

      const data = (await response.json()) as ApiResponse;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Unable to review this application.")
        );
      }

      setSuccess(data.message || "Application review saved.");

      await Promise.all([
        loadConversation(selected.id),
        loadConversations(),
      ]);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to review this application."
      );
    } finally {
      setReviewing(false);
    }
  }

  const pageDescription = isStaff
    ? ""
    : "Message DENR staff to coordinate reservation slots or apply for an Organizer account.";

  return (
    <div className="space-y-5">
      <div
        className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${
          embedded ? "sm:items-center" : ""
        }`}
      >
        {!embedded && (
          <div>
            <p className="max-w-3xl text-sm text-zinc-500 dark:text-zinc-400">
              {pageDescription}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void loadConversations()}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>

          {isStaff && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowDirectCreate((value) => !value);
                setError("");
                setSuccess("");
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              {showDirectCreate ? "Close direct chat" : "New direct chat"}
            </Button>
          )}

          {!isStaff && (
            <Button
              type="button"
              onClick={() => {
                setShowCreate((value) => !value);
                setError("");
                setSuccess("");
              }}
            >
              {showCreate ? (
                <ArrowLeft className="mr-2 h-4 w-4" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              {showCreate ? "Back to messages" : "New request"}
            </Button>
          )}
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {success}
        </div>
      )}

      {isStaff && showDirectCreate && (
        <Card className="p-4 sm:p-5">
          <form onSubmit={startDirectConversation} className="space-y-3">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Start direct conversation</h3>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Recipient
              <select
                required
                value={directRecipientId}
                onChange={(event) => setDirectRecipientId(event.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="">Select a contact</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {formatPerson(contact)}{contact.email ? ` · ${contact.email}` : ""}{contact.role ? ` (${contact.role})` : ""}
                  </option>
                ))}
              </select>
            </label>
            <textarea
              required
              rows={3}
              maxLength={5000}
              value={directFirstMessage}
              onChange={(event) => setDirectFirstMessage(event.target.value)}
              placeholder="Write your first message..."
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDirectCreate(false)} disabled={sending}>Cancel</Button>
              <Button type="submit" disabled={sending || !directRecipientId || !directFirstMessage.trim()}>
                <Send className="mr-2 h-4 w-4" />{sending ? "Sending..." : "Start conversation"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {showCreate && !isStaff ? (
        <Card className="mx-auto max-w-3xl p-5 sm:p-7">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              New request
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Send a request to DENR staff.
            </p>
          </div>

          <form onSubmit={createConversation} className="space-y-5">
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Request type
              <select
                value={requestType}
                onChange={(event) =>
                  setRequestType(event.target.value as RequestType)
                }
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              >
                <option value="RESERVATION_REQUEST">
                  Reservation slot coordination
                </option>
                <option value="ORGANIZER_APPLICATION">
                  Organizer role application
                </option>
              </select>
            </label>

            {requestType === "RESERVATION_REQUEST" ? (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Preferred hiking date
                    <HikingDatePicker
                      date={requestedDate}
                      minimumDate={getMinimumHikingDate()}
                      apiBaseUrl={API_URL}
                      accessToken={accessToken}
                      visitorCount={Number(requestedVisitors) || 1}
                      onDateChange={(date: string) => {
                        setRequestedDate(date);
                        setRequestCapacity(null);
                      }}
                      onCapacityChange={setRequestCapacity}
                    />
                  </label>

                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Preferred trail
                    <select
                      required
                      value={requestedTrailId}
                      onChange={(event) => {
                        setRequestedTrailId(event.target.value);
                        setRequestCapacity(null);
                      }}
                      className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                    >
                      <option value="">Select a trail</option>
                      {trails.map((trail) => (
                        <option key={trail.id} value={trail.id}>
                          {trail.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Number of visitors
                  <input
                    required
                    type="number"
                    min={1}
                    max={12}
                    value={requestedVisitors}
                    onChange={(event) =>
                      setRequestedVisitors(event.target.value)
                    }
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </label>

                {requestCapacity && (
                  <div className="rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-900">
                    <p>
                      Remaining capacity:{" "}
                      <strong>
                        {requestCapacity.remaining_capacity}
                      </strong>
                    </p>
                    {requestCapacity.is_blocked && (
                      <p className="mt-1 text-red-600">
                        This date is blocked.
                      </p>
                    )}
                    {requestCapacity.is_full && (
                      <p className="mt-1 text-red-600">
                        This date has reached its visitor capacity.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  DOT accreditation number
                  <input
                    required
                    maxLength={120}
                    value={dotNumber}
                    onChange={(event) => setDotNumber(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </label>

                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Business permit number
                  <input
                    required
                    maxLength={120}
                    value={permitNumber}
                    onChange={(event) => setPermitNumber(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                  />
                </label>

                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  DOT accreditation certificate image
                  <input
                    required
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      setDotFile(event.target.files?.[0] || null)
                    }
                    className="mt-1 block w-full text-xs"
                  />
                </label>

                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Business permit image
                  <input
                    required
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      setPermitFile(event.target.files?.[0] || null)
                    }
                    className="mt-1 block w-full text-xs"
                  />
                </label>
              </div>
            )}

            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Message to DENR staff
              <textarea
                required
                rows={4}
                maxLength={5000}
                value={newBody}
                onChange={(event) => setNewBody(event.target.value)}
                placeholder={
                  requestType === "RESERVATION_REQUEST"
                    ? "Explain your preferred schedule or reservation question..."
                    : "Introduce your business and provide any details DENR should know..."
                }
                className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
              />
            </label>

            {requestType === "RESERVATION_REQUEST" && (
              <p className="rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/20 dark:text-amber-300">
                This request starts a conversation only. It does not create or
                confirm a reservation. DENR staff must check availability and
                record any approved booking in the official booking system.
              </p>
            )}

            <div className="flex justify-end gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
                disabled={sending}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  sending ||
                  !newBody.trim() ||
                  (requestType === "RESERVATION_REQUEST" &&
                    (!requestedDate ||
                      !requestedTrailId ||
                      !requestCapacity ||
                      requestCapacity.is_blocked ||
                      requestCapacity.is_full ||
                      Number(requestedVisitors) >
                        requestCapacity.remaining_capacity))
                }
              >
                <Send className="mr-2 h-4 w-4" />
                {sending ? "Submitting..." : "Submit request"}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid min-h-[640px] gap-4 lg:grid-cols-[330px_minmax(0,1fr)]">
          <Card className="flex min-h-0 flex-col overflow-hidden">
            <div className="border-b border-zinc-200 p-4 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-zinc-900 dark:text-white">
                  Conversations
                </h2>
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                  {conversations.length}
                </span>
              </div>

              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {isStaff
                  ? "Visitor requests and organizer applications"
                  : "Your requests to DENR staff"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <p className="p-5 text-sm text-zinc-500">
                  Loading conversations...
                </p>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center">
                  <MessageCircle className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-700" />
                  <p className="mt-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    No conversations yet
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {isStaff
                      ? "New visitor requests will appear here."
                      : "Create a request when you need to coordinate a reservation or apply for an Organizer account."}
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => {
                  const active = selectedId === conversation.id;
                  const appStatus =
                    conversation.organizer_application?.status;
                  const lastMessage =
                    conversation.latest_message?.body ||
                    "Attachment or document submitted";

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(conversation.id);
                        setShowCreate(false);
                        setError("");
                        setSuccess("");
                      }}
                      className={`block w-full border-b border-zinc-100 p-4 text-left transition dark:border-zinc-800 ${
                        active
                          ? "bg-emerald-50 dark:bg-emerald-950/30"
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-1 text-sm font-semibold text-zinc-900 dark:text-white">
                          {conversation.type === "DIRECT_MESSAGE"
                            ? formatPerson(Number(conversation.user?.id) === Number(session?.user?.id) ? conversation.recipient : conversation.user)
                            : isStaff
                              ? formatPerson(conversation.user)
                              : conversation.subject}
                        </p>
                        <span className="shrink-0 text-[10px] text-zinc-400">
                          {formatDateTime(conversation.last_message_at)}
                        </span>
                      </div>

                      <p className="mt-1 line-clamp-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {conversation.type === "DIRECT_MESSAGE"
                          ? "Direct message"
                          : conversation.type === "ORGANIZER_APPLICATION"
                            ? "Organizer role application"
                            : "Reservation slot coordination"}
                      </p>

                      <p className="mt-2 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {lastMessage}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusTone(
                            appStatus || conversation.status
                          )}`}
                        >
                          {appStatus || conversation.status}
                        </span>

                        {conversation.type === "ORGANIZER_APPLICATION" && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-800 dark:bg-blue-500/10 dark:text-blue-300">
                            Organizer application
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="flex min-h-[640px] min-w-0 flex-col overflow-hidden">
            {!selectedId ? (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <MessageCircle className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
                <h2 className="mt-4 font-semibold text-zinc-900 dark:text-white">
                  Select a conversation
                </h2>
                <p className="mt-1 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
                  Choose a request from the list to read messages and continue
                  the conversation.
                </p>
              </div>
            ) : detailLoading || !selected ? (
              <div className="flex flex-1 items-center justify-center text-sm text-zinc-500">
                Loading conversation...
              </div>
            ) : (
              <>
                <div className="border-b border-zinc-200 p-4 sm:p-5 dark:border-zinc-800">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="break-words text-lg font-bold text-zinc-900 dark:text-white">
                        {selected.type === "DIRECT_MESSAGE"
                          ? formatPerson(Number(selected.user?.id) === Number(session?.user?.id) ? selected.recipient : selected.user)
                          : selected.subject}
                      </h2>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {selected.type === "DIRECT_MESSAGE"
                          ? `Direct conversation · ${Number(selected.user?.id) === Number(session?.user?.id) ? selected.recipient?.role || "Contact" : selected.user?.role || "Contact"}`
                          : isStaff
                            ? `Visitor: ${formatPerson(selected.user)}`
                            : "Conversation with DENR staff"}{" "}
                        · Request #{selected.id}
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusTone(
                        selectedApplication?.status || selected.status
                      )}`}
                    >
                      {selectedApplication?.status || selected.status}
                    </span>
                  </div>

                  {selected.type === "RESERVATION_REQUEST" ? (
                    <div className="mt-4 grid gap-3 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-900 sm:grid-cols-3">
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Requested hike date
                        </p>
                        <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                          {formatDate(selected.requested_hiking_date)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Preferred trail
                        </p>
                        <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                          {selected.requested_trail?.name || "Not specified"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Group size
                        </p>
                        <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                          {selected.requested_visitors || "Not specified"} visitors
                        </p>
                      </div>
                    </div>
                  ) : selectedApplication ? (
                    <div className="mt-4 grid gap-3 rounded-xl bg-zinc-50 p-3 text-sm dark:bg-zinc-900 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          DOT accreditation number
                        </p>
                        <p className="mt-1 break-all font-semibold text-zinc-900 dark:text-white">
                          {selectedApplication.dot_accreditation_number}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          Business permit number
                        </p>
                        <p className="mt-1 break-all font-semibold text-zinc-900 dark:text-white">
                          {selectedApplication.business_permit_number}
                        </p>
                      </div>

                      {selectedApplication.review_notes && (
                        <p className="text-sm text-red-700 dark:text-red-300 sm:col-span-2">
                          DENR feedback: {selectedApplication.review_notes}
                        </p>
                      )}
                    </div>
                  ) : null}

                  {selected.created_reservation && (
                    <div className="mt-4 flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/20 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                          Official reservation recorded
                        </p>
                        <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-300">
                          {selected.created_reservation.reservation_number} ·{" "}
                          {formatDate(selected.created_reservation.hiking_date)}{" "}
                          · {selected.created_reservation.status}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                        In booking records
                      </span>
                    </div>
                  )}


                </div>

                <div className="flex-1 space-y-4 overflow-y-auto bg-zinc-50/70 p-4 sm:p-5 dark:bg-zinc-950/40">
                  {sortedMessages.length === 0 ? (
                    <p className="py-8 text-center text-sm text-zinc-500">
                      No messages in this conversation yet.
                    </p>
                  ) : (
                    sortedMessages.map((message) => {
                      const mine =
                        message.sender?.id === Number(session?.user?.id);

                      return (
                        <div
                          key={message.id}
                          className={`flex ${
                            mine ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[88%] rounded-2xl p-3 sm:max-w-[75%] ${
                              mine
                                ? "rounded-br-md bg-emerald-700 text-white"
                                : "rounded-bl-md border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
                            }`}
                          >
                            <div
                              className={`mb-1 flex flex-wrap items-center gap-2 text-[11px] ${
                                mine
                                  ? "text-emerald-100"
                                  : "text-zinc-400"
                              }`}
                            >
                              <span className="font-semibold">
                                {mine ? "You" : formatPerson(message.sender)}
                              </span>
                              <span>·</span>
                              <span>{formatDateTime(message.created_at)}</span>
                            </div>

                            {message.body && (
                              <p className="whitespace-pre-wrap break-words text-sm leading-6">
                                {message.body}
                              </p>
                            )}

                            {(message.attachments || []).map((attachment) => (
                              <AttachmentPreview
                                key={attachment.id}
                                attachment={attachment}
                                accessToken={accessToken || ""}
                              />
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {isStaff &&
                  isAdmin &&
                  selected.type === "ORGANIZER_APPLICATION" &&
                  selectedApplication?.status === "PENDING" && (
                    <div className="border-t border-zinc-200 bg-amber-50/60 p-4 dark:border-zinc-800 dark:bg-amber-950/10">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white">
                        <BadgeCheck className="h-4 w-4 text-emerald-600" />
                        Manual organizer credential review
                      </div>

                      <p className="mb-3 text-xs text-zinc-600 dark:text-zinc-400">
                        Inspect both attached document images and compare them
                        with the submitted credential numbers. Approval grants
                        the ORGANIZER role; rejection leaves the applicant as
                        USER.
                      </p>

                      <textarea
                        rows={2}
                        maxLength={2000}
                        value={reviewNotes}
                        onChange={(event) =>
                          setReviewNotes(event.target.value)
                        }
                        placeholder="Required for revision requests or rejection; optional for approval."
                        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                      />

                      <div className="mt-3 flex flex-wrap justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          disabled={reviewing || !reviewNotes.trim()}
                          onClick={() =>
                            void reviewApplication("NEEDS_REVISION")
                          }
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Request revision
                        </Button>

                        <Button
                          type="button"
                          variant="danger"
                          disabled={reviewing || !reviewNotes.trim()}
                          onClick={() => void reviewApplication("REJECTED")}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>

                        <Button
                          type="button"
                          disabled={reviewing}
                          onClick={() => void reviewApplication("APPROVED")}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          {reviewing ? "Saving..." : "Approve Organizer"}
                        </Button>
                      </div>
                    </div>
                  )}

                {!isStaff &&
                  selected.type === "ORGANIZER_APPLICATION" &&
                  selectedApplication?.status === "NEEDS_REVISION" && (
                    <form
                      onSubmit={resubmitApplication}
                      className="space-y-3 border-t border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900 dark:bg-amber-950/10"
                    >
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                        DENR requested revised documents
                      </p>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          DOT accreditation number
                          <input
                            required
                            maxLength={120}
                            value={revisionDotNumber}
                            onChange={(event) =>
                              setRevisionDotNumber(event.target.value)
                            }
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                          />
                        </label>

                        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Business permit number
                          <input
                            required
                            maxLength={120}
                            value={revisionPermitNumber}
                            onChange={(event) =>
                              setRevisionPermitNumber(event.target.value)
                            }
                            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                          />
                        </label>

                        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Revised DOT certificate image
                          <input
                            required
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) =>
                              setRevisionDotFile(
                                event.target.files?.[0] || null
                              )
                            }
                            className="mt-1 block w-full text-xs"
                          />
                        </label>

                        <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                          Revised business permit image
                          <input
                            required
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) =>
                              setRevisionPermitFile(
                                event.target.files?.[0] || null
                              )
                            }
                            className="mt-1 block w-full text-xs"
                          />
                        </label>
                      </div>

                      <Button
                        type="submit"
                        disabled={
                          sending || !revisionDotFile || !revisionPermitFile
                        }
                      >
                        <Send className="mr-2 h-4 w-4" />
                        {sending ? "Submitting..." : "Resubmit documents"}
                      </Button>
                    </form>
                  )}

                {selected.status !== "CLOSED" &&
                  !(
                    !isStaff &&
                    selected.type === "ORGANIZER_APPLICATION" &&
                    selectedApplication?.status === "NEEDS_REVISION"
                  ) && (
                    <form
                      onSubmit={sendReply}
                      className="flex items-end gap-2 border-t border-zinc-200 p-3 sm:p-4 dark:border-zinc-800"
                    >
                      <textarea
                        rows={2}
                        maxLength={5000}
                        value={reply}
                        onChange={(event) => setReply(event.target.value)}
                        placeholder="Write a message..."
                        className="min-h-[48px] flex-1 resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-900"
                      />

                      <Button
                        type="submit"
                        disabled={sending || !reply.trim()}
                        className="shrink-0"
                      >
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send message</span>
                      </Button>
                    </form>
                  )}

                {selected.status === "CLOSED" && (
                  <div className="border-t border-zinc-200 p-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    This conversation is closed.{" "}
                    {selectedApplication?.status === "APPROVED"
                      ? "The Organizer role has been granted. Sign out and sign in again to refresh your account role."
                      : "You may start a new request if you need further assistance."}
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}

      <p className="text-xs leading-5 text-zinc-400">
        E-PULAG chatbox supports reservation-slot coordination, Organizer role
        applications, and direct conversations. DENR staff review credentials
        manually; messages do not automatically confirm or create reservations.
      </p>
    </div>
  );
}