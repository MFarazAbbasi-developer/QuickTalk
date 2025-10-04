import mongoose from "mongoose";
import { genSalt, hash } from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      // required: true,
    },
    lastName: {
      type: String,
      // required: true,
    },
    // username: {
    //   type: String,
    //   required: true,
    //   unique: true,
    //   trim: true,
    //   lowercase: true,
    // },
    email: {
      type: String,
      required: [true, "Email is Required."],
      unique: true,
      lowercase: true,
    },
    // phoneNumber: { type: String, unique: true, sparse: true },
    // phoneSuffix: { type: String, unique: false },
    password: {
      type: String,
      required: [true, "Password is Required."],
      // minlength: 6,
    },
    image: {
      type: String,
      default: "", // or a default avatar URL
    },
    color: {
      type: Number,
      required: false,
    },
    profileSetup: {
      type: Boolean,
      default: false,
    },

    // New field to track last messages for 1-on-1 chats
    lastMessages: [
      {
        withUser: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Users",
          required: true,
        }, // the other participant
        message: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Messages",
          required: true,
        }, // last message
        sender: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now }, // timestamp for sorting chat list
      },
    ],

    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: null,
    },




    // Following are not implemented yet

    bio: {
      type: String,
      maxlength: 150,
    },
    socketId: {
      type: String,
      default: null,
    },
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users",
      },
    ],

    emailOtp: { type: String },
    emailOtpExpiry: { type: Date },
    isVerified: { type: String, default: false },
    agreed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await genSalt();
  this.password = await hash(this.password, salt);
  next();
});

const User = mongoose.model("Users", userSchema);
export default User;
