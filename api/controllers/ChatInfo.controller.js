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
    const originUrl = file.publicUrl();
    const publicUrl = originUrl.replace(
      `${bucketName}/`,
      `${bucketName}/userInputImage/`
    );
    const result = {
      blobUrl: `gs://${bucketName}/userInputImage/${file.name}`,
      previewUrl: publicUrl,
    };
    return result;
  } catch (error) {
    removeDataFromUploadsFolder(filename);
    console.error("Error uploading image:", error);
  }
}

// TODO: Delete image from bucket

async function deleteImage(fileUrl) {
  // write code here
  try {
    // 1. Extract the file name from the file URL
    const fileName = fileUrl.split("/").pop();
    // 2. Construct the full file path within the bucket
    const fullFilePath = `userInputImage/${fileName}`;
    // 3. Get a reference to the file object in the bucket
    const file = storage.bucket(bucketName).file(fullFilePath);
    // 4. Delete the file
    await file.delete();
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

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
    const imageList = await Image.find({ _id: { $in: chat.imageList } });
    imageList.forEach((image) => {
      deleteImage(image.imageURL);
    });
    await Image.deleteMany({ _id: { $in: chat.imageList } });

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
    const chatImageList = await Image.find({
      _id: { $in: chatInfo.imageList },
    });
    if (!chatInfo || !chatImageList) {
      return sendResponse(res, 404, { message: "Chat not found" });
    }
    const filterChatContent = chatInfo.chatContent.map((chat, i) => ({
      userChat: chat.sender,
      botChat: chat.botResponse,
      imageSrc: chatImageList[i] ? chatImageList[i].imageURL : null,
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
      removeDataFromUploadsFolder(imageUpload.filename);
      sendResponse(res, 500, { message: "Upload file to server fail" });
      return;
    }
    const imageStore = await uploadImage(imageUpload.path);
    if (!imageStore) {
      removeDataFromUploadsFolder(imageUpload.filename);
      sendResponse(res, 500, { message: "Upload file to storage fail" });
      return;
    }
    const chatInfo = await ChatInfo.findById(chatId);

    const newImage = await Image({
      imageName: imageUpload.originalname,
      imageURL: imageStore.previewUrl,
    });

    chatInfo.imageList.push(newImage);
    await newImage.save();
    await chatInfo.save();
    removeDataFromUploadsFolder(imageUpload.filename);
    sendResponse(res, 200, {
      source: {
        imageSrc: imageStore.blobUrl,
        previewSrc: imageStore.previewUrl,
      },
    });
  } catch (error) {
    removeDataFromUploadsFolder(imageUpload.filename);
    res.status(500).json({ error: error.toString() });
  }
};

const removeImageStore = async (req, res) => {
  const { imageId, chatId } = req.body;
  try {
    const image = await Image.findById(imageId);
    if (!image) {
      sendResponse(res, 200, { message: "Image not found" });
      return;
    }
    const removeImgStore = await deleteImage(image.imageURL);
    if (!removeImgStore) {
      sendResponse(res, 200, { message: "Image can't remove" });
      return;
    }
    await ChatInfo.findByIdAndUpdate(chatId, { $pull: { imageList: imageId } });
    await Image.findByIdAndDelete(imageId);
    sendResponse(res, 200, { message: "Image deleted" });
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
  uploadImageToStorage,
  removeImageStore,
};
