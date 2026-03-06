import Sidebar from "../components/chat/Sidebar";
import ChatArea from "../components/chat/ChatArea";
import RightPanel from "../components/chat/RightPanel";

export default function ChatPage() {
    const dummyConversation = null;

    return (
        <div className="app-container">
            <Sidebar
                conversations={[]}
                selectedConversationId={null}
                onSelectConversation={() => { }}
            />

            <ChatArea
                conversation={dummyConversation}
                onSendMessage={() => { }}
            />

            <RightPanel
                conversation={dummyConversation}
            />
        </div>
    );
}