import { useNavigate } from "react-router-dom";

import Sidebar from "../components/chat/Sidebar";
import ChatArea from "../components/chat/ChatArea";
import RightPanel from "../components/chat/RightPanel";
import useConversations from "../hooks/useConversations";

export default function ChatPage() {
    const navigate = useNavigate();

    const {
        conversations,
        selectedConversation,
        selectedConversationId,
        handleSendMessage,
        handleTyping,
        handleSelectConversation,
        addConversation
    } = useConversations();

    const handleRoomCreated = (room) => {
        if (!room || !room._id) return;
        addConversation(room);
        navigate(`/chat/${room._id}`);
    };

    if (conversations === null) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary, #121212)', color: 'var(--text-secondary, #aaa)' }}>
                Loading chats...
            </div>
        );
    }

    if (conversations.length === 0) {
        return (
            <div className="app-container">
                <Sidebar
                    conversations={[]}
                    selectedConversationId={null}
                    onSelectConversation={handleSelectConversation}
                    onRoomCreated={handleRoomCreated}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary, #121212)', color: 'var(--text-secondary, #aaa)' }}>
                    <h3>Welcome to Relayo!</h3>
                    <p>You don't have any chats yet.</p>
                    <p>Click the <b>Edit icon</b> in the top left Sidebar to search users and start a new chat.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-container">
            <Sidebar
                conversations={conversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                onRoomCreated={handleRoomCreated}
            />

            {selectedConversation ? (
                <>
                    <ChatArea
                        conversation={selectedConversation}
                        onSendMessage={handleSendMessage}
                        onTyping={handleTyping}
                    />
                    <RightPanel
                        conversation={selectedConversation}
                    />
                </>
            ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary, #121212)', color: 'var(--text-secondary, #aaa)' }}>
                    <div>Select a chat to start messaging</div>
                </div>
            )}
        </div>
    );
}