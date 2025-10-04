import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      // required: true,
      required: false,
    },
    messageType: {
      type: String,
      // enum: ["text", "image", "video", "file"],
      enum: ["text", "file"],
      default: "text",
      required: true,
    },
    content: {
      type: String,
      required: function () {
        return this.messageType === "text";
      },
    },
    fileUrl: {
      type: String,
      required: function () {
        return this.messageType === "file";
      },
    },

    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],
    deliveredTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "Users" }],


    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: false,
    }, // for channels

    // reactions: [
    //   {
    //     user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    //     emoji: String,
    //   },
    // ],
    // deletedFor: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    //   },
    // ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Messages", messageSchema);

export default Message;
