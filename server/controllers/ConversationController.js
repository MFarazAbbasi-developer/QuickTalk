import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import User from "../models/UserModel.js";

export const createChannel = async (req, res, next) => {
  try {
    const { name, members } = req.body;
    const userId = req.userId;

    const admin = await User.findById(userId);
    if (!admin) {
      return res.status(400).send("Admin not found.");
    }

    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return res.status(400).send("Some members are not valid users.");
    }

    const newChannel = new Conversation({
      name,
      members,
      admin: userId,
    });

    await newChannel.save();

    return res.status(201).json({ channel: newChannel });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const getUserChannels = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const channels = await Conversation.find({
      $or: [{ admin: userId }, { members: userId }],
    })
      .sort({ updatedAt: -1 })
      .populate({
        path: "lastMessage.message", // populate the message field
        select: "content messageType", // only required fields
      })
      .populate({
        path: "lastMessage.sender", // populate the sender field
        select: "id email firstName lastName image color", // only required fields
      });

    return res.status(201).json({ channels });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};

export const getChannelMessages = async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const channel = await Conversation.findById(channelId).populate({
  path: "messages",
  populate: [
    {
      path: "sender",
      select: "firstName lastName email _id image color",
    },
    {
      path: "readBy",
      select: "firstName lastName email _id image color",
    },
    {
      path: "deliveredTo",
      select: "firstName lastName email _id image color",
    },
  ],
});

    if (!channel) {
      return res.status(404).send("Channel not found");
    }

    const messages = channel.messages;
    console.log(messages);
    return res.status(201).json({ messages });
  } catch (error) {
    console.log({ error });
    return res.status(500).send("Internal Server Error");
  }
};
