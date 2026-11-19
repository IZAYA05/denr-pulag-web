"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { BadgeCheck, FileCheck2, ShieldCheck } from "lucide-react";
import Card from "@/components/ui/Card";
import AttachmentPreview from "@/components/shared/chatbox/AttachmentPreview";

const API_URL = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:18000";
type Attachment = { id: number; document_type?: string | null; original_name: string; mime_type: string; file_size: number };
type Message = { attachments?: Attachment[] };
type Application = { status: string; business_permit_number: string; review_notes?: string | null; reviewed_at?: string | null; reviewer?: { first_name: string; last_name: string } | null };
type Conversation = { id: number; subject: string; organizer_application?: Application | null; messages?: Message[] };
type ApiResponse = { conversations?: Conversation[]; conversation?: Conversation; message?: string };

function statusStyle(status: string) {
  if (status === "APPROVED") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300";
  if (status === "REJECTED") return "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-300";
  if (status === "NEEDS_REVISION") return "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300";
  return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
}

export default function OrganizerVerification() {
  const { data: session } = useSession();
  const token = session?.user?.accessToken;
  const [application, setApplication] = useState<Application | null>(null);
  const [permitAttachment, setPermitAttachment] = useState<Attachment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    let active = true;
    async function load() {
      setLoading(true); setError("");
      try {
        const response = await fetch(`${API_URL}/api/conversations?type=ORGANIZER_APPLICATION`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store" });
        const data = (await response.json()) as ApiResponse;
        if (!response.ok) throw new Error(data.message || "Unable to load verification status.");
        const record = (data.conversations || []).find((item) => item.organizer_application) || null;
        if (!record) { if (active) setApplication(null); return; }
        const detailResponse = await fetch(`${API_URL}/api/conversations/${record.id}`, { headers: { Accept: "application/json", Authorization: `Bearer ${token}` }, cache: "no-store" });
        const detailData = (await detailResponse.json()) as ApiResponse;
        if (!detailResponse.ok || !detailData.conversation) throw new Error(detailData.message || "Unable to load submitted business documents.");
        const detail = detailData.conversation;
        if (active) {
          setApplication(detail.organizer_application || record.organizer_application || null);
          const attachments = (detail.messages || []).flatMap((message) => message.attachments || []);
          setPermitAttachment(attachments.find((attachment) => attachment.document_type === "BUSINESS_PERMIT") || null);
        }
      } catch (caught) { if (active) setError(caught instanceof Error ? caught.message : "Unable to load verification status."); }
      finally { if (active) setLoading(false); }
    }
    void Promise.resolve().then(load);
    return () => { active = false; };
  }, [token]);

  return <div className="space-y-5">
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">{error}</p>}
    {loading ? <Card className="p-8 text-center text-sm text-zinc-500">Loading verification details...</Card> : !application ? <Card className="p-8 text-center"><ShieldCheck className="mx-auto h-9 w-9 text-zinc-300" /><p className="mt-3 font-semibold text-zinc-800 dark:text-zinc-200">No organizer application record found</p></Card> : (
      <>
        <Card className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"><BadgeCheck className="h-6 w-6" /></div><div><h2 className="font-semibold text-zinc-900 dark:text-white">Organizer application</h2><p className="text-xs text-zinc-500 dark:text-zinc-400">DENR document review status</p></div></div>
            <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle(application.status)}`}>{application.status.replaceAll("_", " ")}</span>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"><p className="text-xs text-zinc-500 dark:text-zinc-400">Business permit number</p><p className="mt-2 break-all font-semibold text-zinc-900 dark:text-white">{application.business_permit_number || "Not provided"}</p></div>
            <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"><p className="text-xs text-zinc-500 dark:text-zinc-400">Reviewed by</p><p className="mt-2 font-semibold text-zinc-900 dark:text-white">{application.reviewer ? `${application.reviewer.first_name} ${application.reviewer.last_name}` : application.reviewed_at ? "DENR staff" : "Not reviewed yet"}</p></div>
          </div>
          {application.review_notes && <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/20 dark:text-amber-200"><p className="font-semibold">DENR feedback</p><p className="mt-1 whitespace-pre-wrap">{application.review_notes}</p></div>}
        </Card>
        <Card className="p-5 sm:p-6"><div className="flex items-center gap-2"><FileCheck2 className="h-5 w-5 text-emerald-600" /><h2 className="font-semibold text-zinc-900 dark:text-white">Submitted business permit</h2></div>{permitAttachment ? <AttachmentPreview attachment={permitAttachment} accessToken={token || ""} /> : <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">No business permit image is attached to the application record.</p>}</Card>
      </>
    )}
  </div>;
}
