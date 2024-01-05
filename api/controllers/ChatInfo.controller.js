import ChatInfo from "../models/ChatInfo.model.js";
import Chat from "../models/Chat.model.js";
import User from "../models/User.model.js";
import { sendResponse } from "../utils/helper.js";

const createChat = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, { message: "User not found" });
    }
    const chat = await ChatInfo.create({
      chatName: "New Chat",
    });

    user.userChatList.push(chat._id);
    await user.save();
    await chat.save();
    sendResponse(res, 200, chat);
  } catch (error) {
    sendResponse(res, 500, { message: error.message });
  }
};
const removeChat = async (req, res) => {
  const { userId, chatId } = req.body;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return sendResponse(res, 404, { message: "User not found" });
    }
    const chat = await ChatInfo.findByIdAndDelete(chatId);
    if (!chat) {
      return sendResponse(res, 404, { message: "Chat not found" });
    }

    // Remove all associated ChatDetail documents
    await Chat.deleteMany({ _id: { $in: chat.chatContent } });

    await User.findByIdAndUpdate(userId, { $pull: { userChatList: chatId } });
    sendResponse(res, 200, { message: "Chat deleted" });
  } catch (error) {
    sendResponse(res, 500, { message: error.message });
  }
};
// Get all detail chat in chat list
const getAllChatDetail = async (req, res) => {
  const { chatInfoId } = req.params;
  try {
    const chatInfo = await ChatInfo.findById(chatInfoId)
      .populate("chatContent")
      .lean();
    if (!chatInfo) {
      return sendResponse(res, 404, { message: "Chat not found" });
    }
    const filterChatContent = chatInfo.chatContent.map((chat) => ({
      userChat: chat.sender,
      botChat: chat.botResponse,
    }));
    sendResponse(res, 200, filterChatContent);
  } catch (error) {
    sendResponse(res, 500, { message: error.message });
  }
};

const getChat = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      return sendResponse(res, 404, { message: "User not found" });
    }
    const chatArr = user.userChatList;
    const chatInfoArr = await ChatInfo.find({ _id: { $in: chatArr } })
      .populate("chatContent")
      .lean();
    if (!chatInfoArr) {
      return sendResponse(res, 404, { message: "Chat not found" });
    }

    const formattedChatInfoArr = chatInfoArr.map((chatInfo) => {
      const chatContent = chatInfo.chatContent.map((chat) => ({
        userChat: chat.sender,
        botChat: chat.botResponse,
      }));

      return {
        _id: chatInfo._id,
        chatName: chatInfo.chatName,
        chatContent: chatContent,
      };
    });

    sendResponse(res, 200, {
      chatInfo: formattedChatInfoArr,
    });
  } catch (error) {
    sendResponse(res, 500, { message: error.message });
  }
};

const clearChat = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return sendResponse(res, 404, { message: "User not found" });
    }
    const chat = await ChatInfo.findById({
      _id: { $in: user.userChatList },
    });
    await Chat.deleteMany({ _id: { $in: chat.chatContent } });
    chat.chatContent = [];
    user.userChatList = [];
    await user.save();
    await chat.save();
    sendResponse(res, 200, user);
  } catch (error) {
    sendResponse(res, 500, { message: error.message });
  }
};

export const chatInfoController = {
  createChat,
  removeChat,
  getChat,
  clearChat,
  getAllChatDetail,
};
