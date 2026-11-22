import Chatbox from "@/components/shared/chatbox/Chatbox";

export default function AdminChatboxPage() {
  return (
    <div className="space-y-6">
      <Chatbox mode="staff" />
    </div>
  );
}