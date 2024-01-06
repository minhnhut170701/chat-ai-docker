import mongoose from "mongoose";

const ChatInfoSchema = new mongoose.Schema(
  {
    chatName: {
      type: String,
      required: true,
    },
    chatContent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
      },
    ],
    imageList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
  },
  {
    timestamps: true,
    collection: "chatInfo",
  }
);

export default mongoose.model("ChatInfo", ChatInfoSchema);
