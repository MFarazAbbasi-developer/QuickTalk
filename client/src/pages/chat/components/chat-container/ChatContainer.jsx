import ChatHeader from "./components/chat-header/ChatHeader"
import MessageBar from "./components/message-bar/MessageBar"
import MessageContainer from "./components/message-container/MessageContainer"

const ChatContainer = () => {
  return (
    <div className="fixed inset-0 flex flex-col bg-[#f9fafb] md:static md:flex-1">
      <ChatHeader />
      <MessageContainer />
      <MessageBar />

    </div>
  )
}

export default ChatContainer