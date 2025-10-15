import { useEffect, useRef, useState } from "react";
import { RiEmojiStickerLine } from "react-icons/ri";
import { GrAttachment } from "react-icons/gr";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { useAppStore } from "../../../../../../store";
import { useSocket } from "../../../../../../context/SocketContext";
import { apiClient } from "../../../../../../lib/api-client";
import { UPLOAD_FILE_ROUTE } from "../../../../../../utils/constants";

const MessageBar = () => {
  const emojiRef = useRef();
  const fileInputRef = useRef();
  const socket = useSocket();
  const {
    selectedChatType,
    selectedChatData,
    userInfo,
    setIsUploading,
    setFileUploadProgress,
  } = useAppStore();
  const [message, setMessage] = useState("");
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setEmojiPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleAddEmoji = (emoji) => {
    setMessage((msg) => msg + emoji.emoji);
  };

  const handleSendMessage = async () => {
    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: userInfo.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,

        // status: "sent",
        // readBy: [userInfo.id],
      });
    } else if (selectedChatType === "channel") {
      socket.emit("send-channel-message", {
        sender: userInfo.id,
        content: message,
        messageType: "text",
        fileUrl: undefined,
        channelId: selectedChatData._id,
      });
    }

    setMessage("");
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (e) => {
    try {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        setIsUploading(true);
        const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
          withCredentials: true,
          onUploadProgress: (data) => {
            setFileUploadProgress(Math.round((100 * data.loaded) / data.total));
          },
        });

        if (response.status === 200 && response.data) {
          setIsUploading(false);
          if (selectedChatType === "contact") {
            socket.emit("sendMessage", {
              sender: userInfo.id,
              content: undefined,
              recipient: selectedChatData._id,
              messageType: "file",
              fileUrl: response.data.filePath,
            });
          } else if (selectedChatType === "channel") {
            socket.emit("send-channel-message", {
              sender: userInfo.id,
              content: undefined,
              messageType: "file",
              fileUrl: response.data.filePath,
              channelId: selectedChatData._id,
            });
          }
        }
      }
    } catch (error) {
      setIsUploading(false);
      console.log({ error });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="h-[10vh] min-h-[60px] bg-[#0a2a6a] flex justify-center items-center px-6 py-9 gap-4 border-t border-white/10 backdrop-blur-md">
      <div className="flex-1 flex bg-white/10 border border-white/20 rounded-2xl items-center gap-4 pr-4 py-2 shadow-[0_0_10px_rgba(255,255,255,0.1)] transition-all duration-300 focus-within:shadow-[0_0_15px_rgba(59,130,246,0.4)]">
        <textarea
          className="flex-1 text-white placeholder:text-white/60 bg-transparent px-4 py-3 rounded-md focus:outline-none resize-none"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // prevent new line when pressing Enter alone
              handleSendMessage(); // send on Enter only
            }
          }}
        />

        <button
          className="text-white/70 hover:text-blue-400 transition-all duration-300"
          onClick={handleAttachmentClick}
        >
          <GrAttachment className="text-2xl" />
        </button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
        />
        <div className="relative">
          <button
            className="text-white/70 hover:text-yellow-400 transition-all duration-300"
            onClick={() => setEmojiPickerOpen((prev) => !prev)}
          >
            <RiEmojiStickerLine className="text-2xl" />
          </button>
          <div className="absolute bottom-16 right-0" ref={emojiRef}>
            <EmojiPicker
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
      <button
        className="bg-blue-500 hover:bg-blue-600 active:scale-95 rounded-xl flex items-center justify-center p-4 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.4)]"
        onClick={handleSendMessage}
      >
        <IoSend className="text-2xl text-white" />
      </button>
    </div>
  );
};

export default MessageBar;
