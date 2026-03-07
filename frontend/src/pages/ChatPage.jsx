import Sidebar from "../components/chat/Sidebar";
import ChatArea from "../components/chat/ChatArea";
import RightPanel from "../components/chat/RightPanel";
import useConversations from "../hooks/useConversations";

export default function ChatPage() {

    const {
        conversations,
        selectedConversation,
        selectedConversationId,
        handleSendMessage,
        handleSelectConversation
    } = useConversations();

    if (!selectedConversation) {
        return <div>Loading chats...</div>;
    }

    return (
        <div className="app-container">

            <Sidebar
                conversations={conversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
            />

            <ChatArea
                conversation={selectedConversation}
                onSendMessage={handleSendMessage}
            />

            <RightPanel
                conversation={selectedConversation}
            />

        </div>
    );
}