import { Storage } from "@google-cloud/storage";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import ChatInfo from "../models/ChatInfo.model.js";
import Chat from "../models/Chat.model.js";
import User from "../models/User.model.js";
import Image from "../models/Image.model.js";
import { sendResponse } from "../utils/helper.js";

const bucketName = process.env.BUCKET_NAME;
const storage = new Storage();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const removeDataFromUploadsFolder = (filename) => {
  const uploadsFolderPath = path.join(__dirname, "..", "uploads");
  const filePath = path.join(uploadsFolderPath, filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error("Error removing file:", err);
    } else {
      console.log("File removed successfully");
    }
  });
};

async function uploadImage(filename) {
  try {
    const options = {
      metadata: {
        contentType: "image/jpeg",
      },
    };

    const moveOptions = {
      preconditionOpts: {
        ifGenerationMatch: 0,
      },
    };
    const [file] = await storage.bucket(bucketName).upload(filename, options);
    await storage
      .bucket(bucketName)
      .file(file.name)
      .move(`userInputImage/${file.name}`, moveOptions);
    return file.publicUrl();
  } catch (error) {
    removeDataFromUploadsFolder(filename.filename);
    console.error("Error uploading image:", error);
  }
}

// TODO: Delete image from bucket

// async function deleteImage(fileUrl) {
//   try {
//     const bucket = storage.bucket(bucketName);
//     const file = bucket.file(fileUrl); // Assumes fileUrl is a publicly accessible URL
//     await file.delete();
//     console.log("Image deleted successfully");
//   } catch (error) {
//     console.error("Error deleting image:", error);
//   }
// }

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

const uploadImageToStorage = async (req, res) => {
  const { chatId } = req.body;
  const imageUpload = req.file;

  try {
    if (!imageUpload || !chatId) {
      sendResponse(res, 500, { message: "Upload file to server fail" });
    }
    const imageStore = await uploadImage(imageUpload.path);
    if (!imageStore) {
      sendResponse(res, 500, { message: "Upload file to storage fail" });
    }
    const chatInfo = await ChatInfo.findById(chatId);

    const newImage = await Image({
      imageName: imageUpload.originalname,
      imageURL: imageStore,
    });

    chatInfo.imageList.push(newImage);
    await newImage.save();
    await chatInfo.save();
    removeDataFromUploadsFolder(imageUpload.filename);
    sendResponse(res, 200, { imageString: imageStore });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.toString() });
  }
};

export const chatInfoController = {
  createChat,
  removeChat,
  getChat,
  clearChat,
  getAllChatDetail,
  uploadImageToStorage,
};
