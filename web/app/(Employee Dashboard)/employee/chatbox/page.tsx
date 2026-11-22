import Chatbox from "@/components/shared/chatbox/Chatbox";
import DirectChatbox from "@/components/shared/chatbox/DirectChatbox";

export default function EmployeeChatboxPage() {
  return (
    <div className="space-y-6">
      <Chatbox mode="staff" />
      <DirectChatbox embedded />
    </div>
  );
}
