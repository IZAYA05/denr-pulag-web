"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, Plus, RefreshCw, Send } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";

type Person = {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  role: string;
};

type ChatMessage = {
  id: number;
  body?: string | null;
  created_at: string;
  sender?: Person;
};

type Conversation = {
  id: number;
  type: string;
  subject: string;
  status: string;
  user?: Person;
  recipient?: Person;
  messages?: ChatMessage[];
  latest_message?: ChatMessage;
  last_message_at?: string | null;
};

type ApiResult = {
  contacts?: Person[];
  conversations?: Conversation[];
  conversation?: Conversation;
  message?: string;
};

function personName(person?: Person) {
  return person
    ? `${person.first_name} ${person.last_name}`.trim()
    : "Unknown contact";
}

export default function DirectChatbox({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const myId = Number(session?.user?.id || 0);
  const role = String(session?.user?.role || "USER").toUpperCase();

  const [contacts, setContacts] = useState<Person[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [recipientId, setRecipientId] = useState("");
  const [newBody, setNewBody] = useState("");
  const [reply, setReply] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const headers = useMemo(
    () => ({
      Accept: "application/json",
      Authorization: `Bearer ${token || ""}`,
    }),
    [token]
  );

  const load = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError("");

    try {
      const [contactsResponse, conversationsResponse] = await Promise.all([
        fetch(`${API_URL}/api/conversation-contacts`, {
          headers,
          cache: "no-store",
        }),
        fetch(`${API_URL}/api/conversations?type=DIRECT_MESSAGE`, {
          headers,
          cache: "no-store",
        }),
      ]);

      const contactsData = (await contactsResponse.json()) as ApiResult;
      const conversationsData = (await conversationsResponse.json()) as ApiResult;

      if (!contactsResponse.ok || !conversationsResponse.ok) {
        throw new Error(
          contactsData.message ||
            conversationsData.message ||
            "Unable to load Chatbox."
        );
      }

      setContacts(contactsData.contacts || []);

      const rows = conversationsData.conversations || [];
      setConversations(rows);

      setSelectedId((current) =>
        current && rows.some((row) => row.id === current)
          ? current
          : rows[0]?.id ?? null
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to load Chatbox."
      );
    } finally {
      setLoading(false);
    }
  }, [token, headers]);

  const loadSelected = useCallback(
    async (id: number) => {
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/conversations/${id}`, {
          headers,
          cache: "no-store",
        });

        const data = (await response.json()) as ApiResult;

        if (!response.ok || !data.conversation) {
          throw new Error(data.message || "Unable to open conversation.");
        }

        setSelected(data.conversation);
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Unable to open conversation."
        );
      }
    },
    [token, headers]
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selectedId) {
      void loadSelected(selectedId);
    } else {
      setSelected(null);
    }
  }, [selectedId, loadSelected]);

  async function startChat(event: FormEvent) {
    event.preventDefault();

    if (!token || !recipientId || !newBody.trim()) return;

    setSending(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/direct-conversations`, {
        method: "POST",
        headers: {
          ...headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_id: Number(recipientId),
          body: newBody.trim(),
        }),
      });

      const data = (await response.json()) as ApiResult;

      if (!response.ok || !data.conversation) {
        throw new Error(data.message || "Unable to start conversation.");
      }

      setNewBody("");
      setRecipientId("");
      setShowNew(false);

      await load();
      setSelectedId(data.conversation.id);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to start conversation."
      );
    } finally {
      setSending(false);
    }
  }

  async function sendReply(event: FormEvent) {
    event.preventDefault();

    if (!token || !selected || !reply.trim()) return;

    setSending(true);
    setError("");

    try {
      const body = new FormData();
      body.append("body", reply.trim());

      const response = await fetch(
        `${API_URL}/api/conversations/${selected.id}/messages`,
        {
          method: "POST",
          headers,
          body,
        }
      );

      const data = (await response.json()) as ApiResult;

      if (!response.ok) {
        throw new Error(data.message || "Unable to send message.");
      }

      setReply("");

      await Promise.all([loadSelected(selected.id), load()]);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to send message."
      );
    } finally {
      setSending(false);
    }
  }

  const otherPerson = (conversation: Conversation) =>
    Number(conversation.user?.id) === myId
      ? conversation.recipient
      : conversation.user;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-end gap-3">
        {!embedded && (
          <div className="mr-auto flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-emerald-700" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Chatbox
            </h2>
          </div>
        )}

        <div className={embedded ? "flex w-full justify-end gap-2" : "flex gap-2"}>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            <RefreshCw className="mr-1 inline h-4 w-4" />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowNew((value) => !value)}
            className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-medium text-white"
          >
            <Plus className="mr-1 inline h-4 w-4" />
            New Chat
          </button>
        </div>
      </div>

      {!embedded && (
        <p className="text-sm text-zinc-500">
          Start a direct conversation with an available contact. No booking is
          required.
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {showNew && (
        <form
          onSubmit={startChat}
          className="space-y-3 rounded-xl border p-4 dark:border-zinc-700"
        >
          <label className="block text-sm font-medium">
            Choose a contact
            <select
              required
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              className="mt-1 w-full rounded-lg border bg-white p-2.5 dark:bg-zinc-900"
            >
              <option value="">Select contact</option>

              {contacts.map((person) => (
                <option key={person.id} value={person.id}>
                  {personName(person)}
                  {person.email ? ` · ${person.email}` : ""}
                  {person.role ? ` (${person.role})` : ""}
                </option>
              ))}
            </select>
          </label>

          <textarea
            required
            maxLength={5000}
            rows={3}
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Write your first message..."
            className="w-full rounded-lg border p-3 dark:bg-zinc-900"
          />

          <button
            disabled={sending}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-white disabled:opacity-50"
          >
            {sending ? "Sending..." : "Start conversation"}
          </button>
        </form>
      )}

      <div className="grid min-h-[440px] gap-4 md:grid-cols-[280px_1fr]">
        <div className="overflow-y-auto rounded-xl border dark:border-zinc-700">
          {loading ? (
            <p className="p-4 text-sm text-zinc-500">
              Loading conversations...
            </p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-zinc-500">
              No direct conversations yet. Start a new chat.
            </p>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedId(conversation.id)}
                className={`block w-full border-b p-3 text-left dark:border-zinc-700 ${
                  selectedId === conversation.id
                    ? "bg-emerald-50 dark:bg-emerald-950/40"
                    : "hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                <span className="block text-sm font-semibold">
                  {personName(otherPerson(conversation))}
                </span>

                <span className="mt-1 block truncate text-xs text-zinc-500">
                  {conversation.latest_message?.body || "No messages"}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="flex min-h-[440px] flex-col rounded-xl border dark:border-zinc-700">
          {!selected ? (
            <div className="m-auto text-sm text-zinc-500">
              Select a conversation to view messages.
            </div>
          ) : (
            <>
              <div className="border-b p-4 dark:border-zinc-700">
                <p className="font-semibold">
                  {personName(otherPerson(selected))}
                </p>

                <p className="text-xs text-zinc-500">
                  {otherPerson(selected)?.role}
                </p>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {(selected.messages || []).map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[85%] rounded-xl p-3 text-sm ${
                      message.sender?.id === myId
                        ? "ml-auto bg-emerald-700 text-white"
                        : "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    }`}
                  >
                    <p className="mb-1 text-[10px] opacity-70">
                      {personName(message.sender)}
                    </p>
                    {message.body}
                  </div>
                ))}
              </div>

              <form
                onSubmit={sendReply}
                className="flex gap-2 border-t p-3 dark:border-zinc-700"
              >
                <textarea
                  rows={2}
                  maxLength={5000}
                  required
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Write a message..."
                  className="min-h-12 flex-1 resize-none rounded-lg border p-2 text-sm dark:bg-zinc-900"
                />

                <button
                  disabled={sending || !reply.trim()}
                  aria-label="Send message"
                  className="rounded-lg bg-emerald-700 px-4 text-white disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}