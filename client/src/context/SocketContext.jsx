import { createContext, useContext, useEffect, useRef } from "react";
import { useAppStore } from "@/store";
import { HOST } from "@/utils/constants";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { userInfo } = useAppStore();

  useEffect(() => {
    if (userInfo) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: { userId: userInfo.id },
      });

      socket.current.on("connect", () => {
        console.log("Connected to socket server");
      });

      // -----------------------------
      // 1. 1-on-1 message received
      const handleReceiveMessage = (message) => {
        const {
          selectedChatData,
          selectedChatType,
          addMessage,
          addContactsInDMContacts,
        } = useAppStore.getState();

        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient?._id)
        ) {
          addMessage(message);
          // ✅ Send read receipt instantly
          socket.current.emit("messageStatusUpdateFromClient", {
            messageId: message._id,
            chatId: selectedChatData._id,
            isChannel: false,
            status: "read",
            userId: userInfo.id,
          });
        }
        addContactsInDMContacts(message);
      };

      // 2. Update last message for 1-on-1
      const handleLastMessage = (lastMessage) => {
        const { lastMessages, setLastMessages } = useAppStore.getState();
        if (!lastMessage || !lastMessage.withUser || !lastMessage.message)
          return;

        const existingIndex = lastMessages.findIndex(
          (msg) => msg.withUser._id === lastMessage.withUser._id
        );

        if (existingIndex !== -1) {
          const updated = [...lastMessages];
          updated[existingIndex] = lastMessage;
          setLastMessages(updated);
        } else {
          setLastMessages([...lastMessages, lastMessage]);
        }
      };

      // -----------------------------
      // 3. Channel message received
      const handleReceiveChannelMessage = (message) => {
        const {
          selectedChatData,
          selectedChatType,
          addMessage,
          addChannelInChannelList,
        } = useAppStore.getState();

        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          addMessage(message);

          // ✅ Send read receipt instantly
    socket.current.emit("messageStatusUpdateFromClient", {
      
      chatId: selectedChatData._id,
      isChannel: false,
      
    });

    // 2. Emit "mark as read" event (only if user is not the sender)
    if (message.sender._id !== userInfo.id) {
      socket.current.emit("markChannelMessageAsRead", {
        messageId: message._id,
        channelId: message.channelId,
        status: "read",
        userId: userInfo.id,
      });
    }
        }
        addChannelInChannelList(message);
      };

      // 4. Update last message for channel
      const handleChannelLastMessage = (lastMessage) => {
        const { channelLastMessages, setChannelLastMessages } =
          useAppStore.getState();

        if (!lastMessage || !lastMessage.message) return;

        const existingIndex = channelLastMessages.findIndex(
          (msg) => msg.channelId === lastMessage.channelId
        );

        if (existingIndex !== -1) {
          const updated = [...channelLastMessages];
          updated[existingIndex] = lastMessage;
          setChannelLastMessages(updated);
        } else {
          setChannelLastMessages([...channelLastMessages, lastMessage]);
        }
      };

      // -----------------------------
      // 5. User online/offline handlers
      const handleUserOnline = ({ userId }) => {
        useAppStore.getState().setUserOnline(userId);
      };

      const handleUserOffline = ({ userId, lastSeen }) => {
        useAppStore.getState().setUserOffline(userId, lastSeen);
      };

      // -----------------------------
      // 6. Message status update (single)
      const handleMessageStatusUpdate = ({
        messageId,
        status,
        chatId,
        isChannel,
        userId,
      }) => {
        const { setMessageStatuses, messageStatuses } = useAppStore.getState();

        setMessageStatuses(messageId, isChannel, chatId, status, userId);
        console.log("Done: ", messageStatuses);
        // if (!isChannel) {
        //   // 1-on-1
        //   setMessageStatuses(messageId, status, userId);
        // } else {
        //   // channel
        //   setMessageStatuses(messageId, status, chatId);
        // }
      };

      // -----------------------------
      // Register socket events
      socket.current.on("receiveMessage", handleReceiveMessage);
      socket.current.on("lastMessage", handleLastMessage);
      socket.current.on("receive-channel-message", handleReceiveChannelMessage);
      socket.current.on("channel-last-message", handleChannelLastMessage);
      socket.current.on("userOnline", handleUserOnline);
      socket.current.on("userOffline", handleUserOffline);

      // ✅ Status updates
      socket.current.on("messageStatusUpdate", handleMessageStatusUpdate);

      return () => {
        socket.current.disconnect();
      };
    }
  }, [userInfo]);

  return (
    <SocketContext.Provider value={socket.current}>
      {children}
    </SocketContext.Provider>
  );
};
