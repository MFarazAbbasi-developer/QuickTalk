import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
        required: true,
      },
    ],
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
    },

    messages: [
      { type: mongoose.Schema.ObjectId, ref: "Messages", required: false },
    ],

    lastMessage: {
      message: { type: mongoose.Schema.Types.ObjectId, ref: "Messages" },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
      updatedAt: { type: Date, default: Date.now },
    },

    // isGroupChat: {
    //   type: Boolean,
    //   default: false,
    // },
    // lastMessage: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Message',
    // },
    // unreadCount: {
    //     type: Number, default: 0
    // },
    // groupAvatar: {
    //   type: String,
    //   default: '',
    // },
    // groupDescription: {
    //   type: String,
    //   maxlength: 250,
    // },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
