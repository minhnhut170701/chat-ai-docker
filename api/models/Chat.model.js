import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
    },
    botResponse: {
      type: String,
      required: true,
    },
    restChat: {
      type: String,
    },
  },
  {
    timestamps: true,
    collection: "chatDetail",
  }
);

export default mongoose.model("Chat", ChatSchema);
