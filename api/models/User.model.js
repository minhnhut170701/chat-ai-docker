import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    authToken: {
      type: String,
    },
    userPassword: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
    },
    userStatus: {
      type: String,
    },
    userChatList: [{ type: mongoose.Schema.Types.ObjectId, ref: "ChatInfo" }],
  },
  { collection: "user" }
);

export default mongoose.model("User", UserSchema);
