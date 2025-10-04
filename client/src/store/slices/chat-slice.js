export const createChatSlice = (set, get) => ({
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  channels: [],
  setChannels: (channels) => set({ channels }),
  setIsUploading: (isUploading) => set({ isUploading }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
  setFileDownloadProgress: (fileDownloadProgress) =>
    set({ fileDownloadProgress }),
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),
  setDirectMessagesContacts: (directMessagesContacts) =>
    set({ directMessagesContacts }),
  addChannel: (channel) => {
    const channels = get().channels;
    set({ channels: [channel, ...channels] });
  },
  closeChat: () =>
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessages: [],
    }),
  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages;
    const selectedChatType = get().selectedChatType;

    set({
      selectedChatMessages: [
        ...selectedChatMessages,
        {
          ...message,
          recipient:
            selectedChatType === "channel"
              ? message.recipient
              : message.recipient._id,
          sender:
            selectedChatType === "channel"
              ? message.sender
              : message.sender._id,
        },
      ],
    });
  },
  addChannelInChannelList: (message) => {
    const channels = get().channels;
    const data = channels.find((channel) => channel._id === message.channelId);
    const index = channels.findIndex(
      (channel) => channel._id === message.channelId
    );
    if (index !== -1 && index !== undefined) {
      channels.splice(index, 1);
      channels.unshift(data);
    }
  },
  addContactsInDMContacts: (message) => {
    const userId = get().userInfo.id;
    const fromId =
      message.sender._id === userId
        ? message.recipient._id
        : message.sender._id;
    const fromData =
      message.sender._id === userId ? message.recipient : message.sender;
    const dmContacts = get().directMessagesContacts;
    const data = dmContacts.find((contact) => contact._id === fromId);
    const index = dmContacts.findIndex((contact) => contact._id === fromId);

    if (index !== -1 && index !== undefined) {
      dmContacts.splice(index, 1);
      dmContacts.unshift(data);
    } else {
      dmContacts.unshift(fromData);
    }
    set({ directMessagesContacts: dmContacts });
  },

  selectedMenu: "Chats",
  setSelectedMenu: (selectedMenu) => set({ selectedMenu }),

  lastMessages: [], // ✅ new state
  setLastMessages: (messages) => set({ lastMessages: messages }), // ✅ new action

  channelLastMessages: [],
  setChannelLastMessages: (messages) => set({ channelLastMessages: messages }), // ✅ new action

  // ✅ user online/offline statuses
  userStatuses: {}, // { userId: { isOnline: boolean, lastSeen: Date|null } }

  setUserOnline: (userId) =>
    set((state) => ({
      userStatuses: {
        ...state.userStatuses,
        [userId]: { isOnline: true, lastSeen: null },
      },
    })),

  setUserOffline: (userId, lastSeen) =>
    set((state) => ({
      userStatuses: {
        ...state.userStatuses,
        [userId]: { isOnline: false, lastSeen },
      },
    })),

  setUserStatuses: (statuses) =>
    set(() => ({
      userStatuses: statuses,
    })),

  messageStatuses: {}, // { messageId: { status: "sent"|"delivered"|"read", readBy: [], deliveredTo: [] } }
  // 1️⃣ Update status for a single message
  setMessageStatuses: (messageId, isChannel, chatId, status, userId) =>
    set((state) => {
      const chat = state.messageStatuses[chatId] || {};
      const message = chat[messageId] || { readBy: [], deliveredTo: [] };

      const deliveredTo = new Set(message.deliveredTo);
      const readBy = new Set(message.readBy);

      if (status === "delivered") deliveredTo.add(userId);
      if (status === "read") readBy.add(userId);

      return {
        messageStatuses: {
          ...state.messageStatuses,
          [chatId]: {
            ...chat,
            [messageId]: {
              readBy: [...readBy],
              deliveredTo: [...deliveredTo],
            },
          },
        },
      };
    }),

  // 2️⃣ Bulk mark all messages in a chat as read by a user
  // markChatAsRead: (chatId, userId) =>
  //   set((state) => {
  //     const chat = state.messageStatuses[chatId] || {};
  //     const updatedChat = {};

  //     Object.keys(chat).forEach((messageId) => {
  //       const msg = chat[messageId];
  //       const readBy = new Set(msg.readBy);
  //       readBy.add(userId);

  //       updatedChat[messageId] = {
  //         ...msg,
  //         readBy: [...readBy],
  //       };
  //     });

  //     return {
  //       messageStatuses: {
  //         ...state.messageStatuses,
  //         [chatId]: updatedChat,
  //       },
  //     };
  //   }),

  // // 3️⃣ Bulk update multiple messages (e.g. sync from server)
  // setMessageStatusesBulk: (updates) =>
  //   set((state) => {
  //     const newMessageStatuses = { ...state.messageStatuses };

  //     updates.forEach(({ chatId, messageId, status, userId }) => {
  //       const chat = newMessageStatuses[chatId] || {};
  //       const message = chat[messageId] || { readBy: [], deliveredTo: [] };

  //       const deliveredTo = new Set(message.deliveredTo);
  //       const readBy = new Set(message.readBy);

  //       if (status === "delivered") deliveredTo.add(userId);
  //       if (status === "read") readBy.add(userId);

  //       newMessageStatuses[chatId] = {
  //         ...chat,
  //         [messageId]: {
  //           readBy: [...readBy],
  //           deliveredTo: [...deliveredTo],
  //         },
  //       };
  //     });

  //     return { messageStatuses: newMessageStatuses };
  //   }),
});
