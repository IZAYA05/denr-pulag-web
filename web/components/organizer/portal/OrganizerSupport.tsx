"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Headset, Plus, RefreshCw, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";
type Message = { id: number; body?: string | null; created_at: string; sender?: { id: number; first_name: string; last_name: string; role?: string } | null };
type Conversation = { id: number; subject: string; status: string; last_message_at?: string | null; latest_message?: Message | null; messages?: Message[] };
type ApiResponse = { conversations?: Conversation[]; conversation?: Conversation; message?: string };

function timeLabel(value?: string | null) { if (!value) return ""; const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Manila" }).format(date); }

export default function OrganizerSupport() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const currentUserId = Number(session?.user?.id);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!token) { setLoading(false); setError("Your session has expired. Please sign in again."); return; }
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API_URL}/api/conversations?type=ORGANIZER_SUPPORT`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok) throw new Error(data.message || "Unable to load DENR support messages.");
      setConversations(data.conversations || []);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load DENR support messages."); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  async function openConversation(conversation: Conversation) {
    if (!token) return;
    setError(""); setShowCreate(false);
    try {
      const response = await fetch(`${API_URL}/api/conversations/${conversation.id}`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store" });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.conversation) throw new Error(data.message || "Unable to open this conversation.");
      setSelected(data.conversation);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to open this conversation."); }
  }

  async function createConversation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token || !subject.trim() || !firstMessage.trim()) return;
    setSending(true); setError("");
    try {
      const response = await fetch(`${API_URL}/api/conversations`, { method: "POST", headers: { Accept: "application/json", Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ type: "ORGANIZER_SUPPORT", subject: subject.trim(), body: firstMessage.trim() }) });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || !data.conversation) throw new Error(data.message || "Unable to send your message to DENR.");
      setSelected(data.conversation); setSubject(""); setFirstMessage(""); setShowCreate(false); await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to send your message to DENR."); }
    finally { setSending(false); }
  }

  async function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!token || !selected || !reply.trim()) return;
    setSending(true); setError("");
    try {
      const body = new FormData(); body.append("body", reply.trim());
      const response = await fetch(`${API_URL}/api/conversations/${selected.id}/messages`, { method: "POST", headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, body });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok) throw new Error(data.message || "Unable to send your reply.");
      setReply("");
      const detailResponse = await fetch(`${API_URL}/api/conversations/${selected.id}`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store" });
      const detailData = (await detailResponse.json()) as ApiResponse;
      if (!detailResponse.ok || !detailData.conversation) throw new Error(detailData.message || "Message sent, but the conversation could not be refreshed.");
      setSelected(detailData.conversation); await load();
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to send your reply."); }
    finally { setSending(false); }
  }

  return <div className="space-y-4">
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
    <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-800"><h2 className="font-semibold text-zinc-900 dark:text-white">DENR Support</h2><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => void load()} disabled={loading} aria-label="Refresh support messages"><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /></Button><Button type="button" onClick={() => { setSelected(null); setShowCreate(true); setError(""); }}><Plus className="h-4 w-4" /></Button></div></div>
        <div className="max-h-[650px] divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
          {loading ? <p className="p-6 text-center text-sm text-zinc-500">Loading messages...</p> : conversations.length === 0 ? <p className="p-6 text-center text-sm text-zinc-500">No support messages yet.</p> : conversations.map((conversation) => <button key={conversation.id} type="button" onClick={() => void openConversation(conversation)} className={`w-full p-4 text-left transition ${selected?.id === conversation.id ? "bg-emerald-50 dark:bg-emerald-950/30" : "hover:bg-zinc-50 dark:hover:bg-zinc-900"}`}><div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold text-zinc-900 dark:text-white">{conversation.subject}</p><span className="text-[10px] text-zinc-400">{timeLabel(conversation.last_message_at)}</span></div><p className="mt-2 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">{conversation.latest_message?.body || "No message preview"}</p><span className="mt-3 inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">{conversation.status}</span></button>)}
        </div>
      </Card>
      <Card className="flex min-h-[600px] min-w-0 flex-col overflow-hidden p-0">
        {showCreate ? <form onSubmit={createConversation} className="flex flex-1 flex-col gap-4 p-5 sm:p-6"><div className="flex items-center gap-2"><Headset className="h-5 w-5 text-emerald-600" /><h2 className="font-semibold text-zinc-900 dark:text-white">New message to DENR</h2></div><label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Subject<input required maxLength={255} value={subject} onChange={(event) => setSubject(event.target.value)} className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900" /></label><label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Message<textarea required rows={6} maxLength={5000} value={firstMessage} onChange={(event) => setFirstMessage(event.target.value)} className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900" placeholder="Describe what you need help with..." /></label><div className="mt-auto flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setShowCreate(false)} disabled={sending}>Cancel</Button><Button type="submit" disabled={sending || !subject.trim() || !firstMessage.trim()}><Send className="mr-2 h-4 w-4" />{sending ? "Sending..." : "Send to DENR"}</Button></div></form> : selected ? <><div className="border-b border-zinc-200 p-5 dark:border-zinc-800"><h2 className="font-semibold text-zinc-900 dark:text-white">{selected.subject}</h2><p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Conversation #{selected.id} · {selected.status}</p></div><div className="flex-1 space-y-4 overflow-y-auto bg-zinc-50/70 p-5 dark:bg-zinc-950/40">{(selected.messages || []).map((message) => { const mine = message.sender?.id === currentUserId; return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl p-3 ${mine ? "rounded-br-md bg-emerald-700 text-white" : "rounded-bl-md border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"}`}><p className={`mb-1 text-[11px] font-semibold ${mine ? "text-emerald-100" : "text-zinc-400"}`}>{mine ? "You" : `${message.sender?.first_name || "DENR"} ${message.sender?.last_name || "Staff"}`} · {timeLabel(message.created_at)}</p>{message.body && <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>}</div></div>; })}</div>{selected.status === "CLOSED" ? <p className="border-t border-zinc-200 p-4 text-center text-xs text-zinc-500 dark:border-zinc-800">This conversation is closed.</p> : <form onSubmit={sendReply} className="flex items-end gap-2 border-t border-zinc-200 p-4 dark:border-zinc-800"><textarea rows={2} maxLength={5000} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="Write a reply..." className="min-h-12 flex-1 resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900" /><Button type="submit" disabled={sending || !reply.trim()}><Send className="h-4 w-4" /><span className="sr-only">Send reply</span></Button></form>}</> : <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><Headset className="h-10 w-10 text-zinc-300" /><p className="mt-3 font-semibold text-zinc-800 dark:text-zinc-200">Contact DENR staff</p><p className="mt-1 max-w-sm text-sm text-zinc-500">Ask questions about package approvals, booking coordination, or your organizer account.</p><Button type="button" className="mt-4" onClick={() => setShowCreate(true)}><Plus className="mr-2 h-4 w-4" />New message</Button></div>}
      </Card>
    </div>
  </div>;
}
