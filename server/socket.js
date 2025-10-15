import { disconnect, set } from "mongoose";
import { Server as SocketIOServer } from "socket.io";
import Message from "./models/MessageModel.js";
import Conversation from "./models/Conversation.js";
import User from "./models/UserModel.js";

const setupSocket = (server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: [
        process.env.ORIGIN,
        "https://quick-talk-green.vercel.app",
        "http://localhost:5173",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const userSocketMap = new Map();

  const disconnect = (socket) => {
    console.log(`Client Disconnected: ${socket.id}`);
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  };

  const sendMessage = async (message) => {
    const senderSocketId = userSocketMap.get(message.sender);
    const recipientSocketId = userSocketMap.get(message.recipient);

    const createdMessage = await Message.create(message);

    // Update lastMessages for both users
    const updateLastMessage = async (
      userId,
      otherUserId,
      messageBy,
      messageId
    ) => {
      await User.findByIdAndUpdate(userId, {
        $pull: { lastMessages: { withUser: otherUserId } }, // remove old entry if exists
      });

      await User.findByIdAndUpdate(userId, {
        $push: {
          lastMessages: {
            withUser: otherUserId,
            message: messageId,
            sender: messageBy,
            updatedAt: new Date(),
          },
        },
      });
    };

    await updateLastMessage(
      message.sender,
      message.recipient,
      "currentUser",
      createdMessage._id
    );
    await updateLastMessage(
      message.recipient,
      message.sender,
      "otherUser",
      createdMessage._id
    );

    let lastMessageSender = await User.findById(message.sender)
      .populate({
        path: "lastMessages.withUser",
        select: "firstName lastName email",
      })
      .populate({
        path: "lastMessages.message",
        select: "content messageType",
      });

    // Find the conversation with the recipient
    lastMessageSender = lastMessageSender.lastMessages.find(
      (msg) => msg.withUser._id.toString() === message.recipient.toString()
    );
    let lastMessageRecipient = await User.findById(message.recipient)
      .populate({
        path: "lastMessages.withUser",
        select: "firstName lastName email",
      })
      .populate({
        path: "lastMessages.message",
        select: "content messageType",
      });

    lastMessageRecipient = lastMessageRecipient.lastMessages.find(
      (msg) => msg.withUser._id.toString() === message.sender.toString()
    );
    // console.log("Sender: ", lastMessageSender);
    // console.log("Recipient: ", lastMessageRecipient);

    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .populate("recipient", "id email firstName lastName image color");

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receiveMessage", messageData);
      io.to(recipientSocketId).emit("lastMessage", lastMessageRecipient);

      await updateMessageStatus(
        io,
        messageData,
        "delivered",
        messageData.recipient._id,
        senderSocketId,
        false
      );
    }
    if (senderSocketId) {
      io.to(senderSocketId).emit("receiveMessage", messageData);
      io.to(senderSocketId).emit("lastMessage", lastMessageSender);
    }
  };

  const handleMessageStatusUpdateFromClient = async (params) => {
    const { messageId, chatId, isChannel, status, userId } = params;
    const messageData = await Message.findById(messageId);
    if (!messageData) return;
    const senderSocketId = userSocketMap.get(messageData.sender.toString());
    if (!senderSocketId) return;
    await updateMessageStatus(
      io,
      messageData,
      status,
      userId,
      senderSocketId,
      isChannel
    );
  };
  const updateMessageStatus = async (
    io,
    messageData,
    status,
    userId,
    senderSocketId,
    isChannel = false
  ) => {
    try {
      // ✅ Update DB
      await Message.findByIdAndUpdate(messageData._id, { status });
      await Message.findByIdAndUpdate(
        messageData._id,
        { $addToSet: { [`${status}To`]: userId } }, // e.g. deliveredTo, readBy
        { new: true }
      );

      // ✅ Notify sender (so they can update UI)
      io.to(senderSocketId).emit("messageStatusUpdate", {
        messageId: messageData._id,
        status,
        chatId: userId,
        isChannel,
        userId,
      });
    } catch (err) {
      console.error("Error updating message status:", err);
    }
  };

  const sendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;

    // 1. Create the new message
    const createdMessage = await Message.create({
      sender,
      recipient: null,
      content,
      messageType,
      fileUrl,
      channelId,
      status: "sent",
      readBy: [sender],
      deliveredTo: [], // initialize empty
    });

    // 2. Fetch it with populated sender
    const messageData = await Message.findById(createdMessage._id)
      .populate("sender", "id email firstName lastName image color")
      .exec();

    // 3. Update the conversation: push new message + set lastMessage
    await Conversation.findByIdAndUpdate(channelId, {
      $push: { messages: createdMessage._id },
      $set: {
        lastMessage: {
          message: createdMessage._id,
          sender: sender,
          updatedAt: new Date(),
        },
      },
    });

    // 4. Get full channel info with members + populated lastMessage
    const channel = await Conversation.findById(channelId)
      .populate("members", "id email firstName lastName image color")
      .populate("lastMessage.message", "content messageType")
      .populate(
        "lastMessage.sender",
        "id email firstName lastName image color"
      );

    const findData = { ...messageData._doc, channelId: channel._id };

    // 5. Emit to all members (and admin too)
    if (channel && channel.members) {
      channel.members.forEach(async (member) => {
        const memberSocketId = userSocketMap.get(member._id.toString());
        if (memberSocketId) {
          // Emit message
          io.to(memberSocketId).emit("receive-channel-message", findData);
          io.to(memberSocketId).emit("channel-last-message", {
            ...channel.lastMessage,
            channelId,
          });
          // console.log("First member delivered to: ", member._id);

          await updateChannelMessageStatus(
            io,
            createdMessage._id,
            member._id,
            sender,
            "delivered"
          );
        }
      });

      const adminSocketId = userSocketMap.get(channel.admin._id.toString());
      if (adminSocketId) {
        io.to(adminSocketId).emit("receive-channel-message", findData);
        io.to(adminSocketId).emit("channel-last-message", {
          ...channel.lastMessage,
          channelId,
        });

        await updateChannelMessageStatus(
          io,
          createdMessage._id,
          channel.admin._id,
          sender,
          "delivered"
        );
      }
      // console.log({ ...channel.lastMessage, channelId });
    }
  };

  const handleChannelMessageStatusUpdateFromClient = async (params) => {
    const { messageId, channelId, status, userId } = params;

    const messageData = await Message.findById(messageId);
    if (!messageData) return;
    // const senderSocketId = userSocketMap.get(messageData.sender.toString());
    // if (!senderSocketId) return;

    await updateChannelMessageStatus(
            io,
            messageId,
            userId,
            messageData.sender,
            status
          );
  };

  const updateChannelMessageStatus = async (
    io,
    messageId,
    memberId,
    senderId,
    status
  ) => {
    // 1️⃣ Update DB (delivered/read arrays)
    const updateField =
      status === "delivered"
        ? { $addToSet: { deliveredTo: memberId } }
        : { $addToSet: { readBy: memberId } };

    await Message.findByIdAndUpdate(messageId, updateField);

    // 2️⃣ Notify sender about status change
    const senderSocketId = userSocketMap.get(senderId.toString());
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageStatusUpdate", {
        messageId,
        memberId,
        status,
      });
    }
  };

  const setMessageStatus = async (data) => {
    const { isChannel, status, userId, chatId } = data;
    if (!isChannel) {
      // 1-on-1 chat: update all messages between userId and chatId
      await Message.updateMany(
        {
          readBy: { $ne: userId }, // only update if userId not already in readBy
          $or: [
            { sender: userId, recipient: chatId },
            { sender: chatId, recipient: userId },
          ],
        },
        { $addToSet: { readBy: userId } }
      );

      const messages = await Message.find({
        sender: chatId,
        recipient: userId,
      });

      // Notify the other user if online
      const contactSocketId = userSocketMap.get(chatId);
      if (contactSocketId) {
        messages.forEach((msg) => {
          io.to(contactSocketId).emit("messageStatusUpdate", {
            messageId: msg._id,
            status: "read",
            chatId: msg.recipient._id,
            isChannel: false,
            userId,
          });
        });
      }
    } else {
      // Channel chat: update readBy for the user in that channel
      const channel = await Conversation.findById(chatId);
      if (channel) {
        // Update all messages in the channel that the user hasn't read yet
        const messagesToUpdate = await Message.find({
          channelId: chatId,
          readBy: { $ne: userId },
        });

        for (const msg of messagesToUpdate) {
          msg.readBy.push(userId);
          await msg.save();

          // Notify sender about read status
          const senderSocketId = userSocketMap.get(msg.sender.toString());
          if (senderSocketId) {
            const user = await User.findById(userId).select(
              "email firstName lastName image color"
            );
            console.log("Message read by: ", user);
            io.to(senderSocketId).emit("messageStatusUpdate", {
              messageId: msg._id,
              status: "read",
              chatId: msg.channelId._id,
              isChannel: true,
              userId: user,
            });
          }
        }
      }
    }
  };

  io.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;

    if (userId) {
      userSocketMap.set(userId, socket.id);
      console.log(`User connected: ${userId} with socket ID: ${socket.id}`);

      // ✅ Mark user online in DB
      User.findByIdAndUpdate(userId, { isOnline: true }).exec();

      // ✅ Notify others (if you want real-time status updates)
      socket.broadcast.emit("userOnline", { userId });

      // For setting Message status as delievered when user gets online
      const undeliveredMessages = await Message.find({
        deliveredTo: { $ne: userId },
      }).populate("channelId", "members admin recipientId");
      // console.log("Undelivered Messages: ", undeliveredMessages.length);

      const filteredMessages = undeliveredMessages.filter((msg) => {
        // case 1: DM
        if (msg.recipient && msg.recipient.toString() === userId.toString()) {
          return true;
        }
        // case 2: Channel
        if (
          msg.channelId &&
          (msg.channelId.members.includes(userId) ||
            msg.channelId.admin.toString() === userId.toString())
        ) {
          return true;
        }
        return false;
      });
      // console.log("Filtered Messages: ", filteredMessages.length);

      // Bulk update all filtered messages in one go
      await Message.updateMany(
        { _id: { $in: filteredMessages.map((m) => m._id) } },
        { $push: { deliveredTo: userId } }
      );

      filteredMessages.forEach((msg) => {
        const senderSocketId = userSocketMap.get(msg.sender.toString());
        if (senderSocketId) {
          io.to(senderSocketId).emit("messageStatusUpdate", {
            messageId: msg._id,
            status: "delivered",
            chatId: msg.recipient ? msg.recipient._id : msg.channelId?._id,
            isChannel: !!msg.channelId,
            userId,
          });
        }
      });
    } else {
      console.log("User ID not provided during connection.");
    }

    socket.on("sendMessage", sendMessage);
    socket.on(
      "messageStatusUpdateFromClient",
      handleMessageStatusUpdateFromClient
    );
    socket.on("send-channel-message", sendChannelMessage);
    socket.on(
      "markChannelMessageAsRead",
      handleChannelMessageStatusUpdateFromClient
    );

    socket.on("setMessageStatus", setMessageStatus);

    socket.on("disconnect", async () => {
      if (userId) {
        userSocketMap.delete(userId);

        // ✅ Mark user offline and update lastSeen
        const lastSeen = new Date();
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen,
        }).exec();

        // ✅ Notify others
        socket.broadcast.emit("userOffline", { userId, lastSeen });

        console.log(`User disconnected: ${userId} | Last seen: ${lastSeen}`);
      }
    });
  });
};

export default setupSocket;
