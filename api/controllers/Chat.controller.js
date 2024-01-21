import { VertexAI } from "@google-cloud/vertexai";
import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";
import { fileTypeFromBuffer } from "file-type";
import config from "../configs/index.js";
import ChatInfo from "../models/ChatInfo.model.js";
import Chat from "../models/Chat.model.js";
import Image from "../models/Image.model.js";

import { sendResponse } from "../utils/helper.js";

const { styleResponse } = config;

const initConfig = {
  projectId: process.env.GOOGLE_SERVICE_ID,
  location: "asia-northeast1",
  model: "gemini-pro-vision",
  mimeType: "image/jpeg",
};

const vertexAI = new VertexAI({
  project: initConfig.projectId,
  location: initConfig.location,
});

const bucketName = process.env.BUCKET_NAME;
const storage = new Storage();

async function uploadImage(image) {
  try {
    const typeImage = await fileTypeFromBuffer(image.buffer);
    const options = {
      metadata: {
        contentType: typeImage.mime,
      },
    };

    const filename = `image-ask${uuidv4()}`; // define filename here
    const file = storage.bucket(bucketName).file(`userInputImage/${filename}`);

    const blobStream = file.createWriteStream(options);

    return new Promise((resolve, reject) => {
      blobStream.on("error", (err) => {
        console.error("Error uploading image:", err);
        reject(err);
      });

      blobStream.on("finish", async () => {
        const publicUrl = `https://storage.googleapis.com/${bucketName}/userInputImage/${filename}`;
        const result = {
          blobUrl: `gs://${bucketName}/userInputImage/${filename}`,
          previewUrl: publicUrl,
        };
        resolve(result);
      });

      blobStream.end(image.buffer);
    });
  } catch (error) {
    throw new Error(error);
  }
}

const generativeModel = vertexAI.preview.getGenerativeModel({
  model: initConfig.model,
  generation_config: {
    temperature: 0.2,
  },
});

async function createChatGeminiAI(textPart, image = "") {
  const filePart = {
    fileData: {
      fileUri: image,
      mimeType: initConfig.mimeType,
    },
  };
  try {
    const imageExist = image ? [textPart, filePart] : [textPart];
    const request = {
      contents: [{ role: "user", parts: imageExist }],
    };
    const responseStream = await generativeModel.generateContentStream(request);
    const aggregatedResponse = await responseStream.response;

    const fullTextResponse =
      aggregatedResponse.candidates[0].content.parts[0].text;
    return fullTextResponse;
  } catch (error) {
    console.log(error);
  }
}

const uploadImageToStorage = async (chatId, imageUpload) => {
  // const imageUpload = req.file;
  try {
    if (!imageUpload || !chatId) {
      throw new Error("Image and chatId can't be empty");
    }
    const imageStore = await uploadImage(imageUpload);
    if (!imageStore) {
      throw new Error("Upload image fail");
    }
    const chatInfo = await ChatInfo.findById(chatId);

    await chatInfo.save();
    const source = {
      imageSrc: imageStore.blobUrl,
      previewSrc: imageStore.previewUrl,
    };
    return source;
  } catch (error) {
    throw new Error(error);
  }
};

const getChatDetail = async (req, res) => {
  const { chatId } = req.params;
  try {
    const chatInfo = await Chat.findById(chatId);
    if (!chatInfo) {
      return sendResponse(res, 404, { message: "ChatInfo not found" });
    }
    sendResponse(res, 200, { chatInfo });
  } catch (error) {
    sendResponse(res, 500, { message: error.message });
  }
};

const createChat = async (req, res) => {
  const { userInput, role, chatId } = req.body;
  const image = req.file;

  if (userInput.length > 1000) {
    return sendResponse(res, 500, { message: "Input too long" });
  }
  const responseStyle = styleResponse.find((item) => item.role === role);

  const textPart = {
    text: ` ${role || ""}.\n
    ${responseStyle.styleResponse || ""}.\n
    ${userInput || ""}`,
  };

  try {
    let fullTextResponse = "";
    let uploadImage = null;
    let newImage = null;
    if (image) {
      uploadImage = await uploadImageToStorage(chatId, image);
      newImage = await Image({
        imageName: image.originalname,
        imageURL: uploadImage.previewSrc,
      });
      await newImage.save();
    }
    if (uploadImage) {
      fullTextResponse = await createChatGeminiAI(
        textPart,
        uploadImage.imageSrc
      );
    } else {
      fullTextResponse = await createChatGeminiAI(textPart);
    }
    const chatInfo = await ChatInfo.findById(chatId).populate("chatContent");
    if (!chatInfo || !fullTextResponse) {
      return res.status(404).json({ error: "ChatInfo not found" });
    }
    const previousChat =
      chatInfo.chatContent.length > 0
        ? chatInfo.chatContent[chatInfo.chatContent.length - 1]
        : null;
    let restChat = previousChat
      ? `${previousChat.restChat}.\n\n  ${userInput}.\n\n  ${fullTextResponse} \n\n`
      : ` ${userInput}. \n\n ${fullTextResponse}\n\n `;

    if (restChat.length > 10000) {
      restChat = "";
    }
    const newChatDetail = await new Chat({
      sender: userInput,
      botResponse: fullTextResponse,
      imageURL: uploadImage ? uploadImage.previewSrc : "",
      restChat: restChat,
    });

    chatInfo.chatContent.push(newChatDetail);
    if (newImage) {
      chatInfo.imageList.push(newImage);
    }
    await newChatDetail.save();
    await chatInfo.save();
    sendResponse(res, 200, { message: "success" });
  } catch (error) {
    sendResponse(res, 500, { message: error });
  }
};

const continueChat = async (req, res) => {
  const { inputChat, chatId } = req.body;
  const image = req.file;
  try {
    let uploadImage = null;
    let newImage = null;
    if (image) {
      uploadImage = await uploadImageToStorage(chatId, image);
      newImage = await Image({
        imageName: image.originalname,
        imageURL: uploadImage.previewSrc,
      });
      if (newImage) await newImage.save();
    }
    const chatInfo = await ChatInfo.findById(chatId).populate("chatContent");
    if (!chatInfo) {
      return sendResponse(res, 404, { message: "ChatInfo not found" });
    }

    const previousChat =
      chatInfo.chatContent.length > 0
        ? chatInfo.chatContent[chatInfo.chatContent.length - 1]
        : null;

    const textPart = {
      text: `${previousChat ? previousChat.restChat : ""}. \n\n  
      ${inputChat || ""}`,
    };

    let valueChat = "";
    if (uploadImage) {
      valueChat = await createChatGeminiAI(textPart, uploadImage.imageSrc);
    } else {
      valueChat = await createChatGeminiAI(textPart);
    }

    let restChat = previousChat
      ? `${previousChat.restChat}. \n\n  ${inputChat}.\n\n  ${valueChat} \n\n `
      : `${inputChat}. \n\n ${valueChat}`;

    if (restChat.length > 10000) {
      restChat = "";
    }
    const newChatDetail = await new Chat({
      sender: inputChat,
      botResponse: valueChat,
      imageURL: uploadImage ? uploadImage.previewSrc : "",
      restChat: restChat,
    });

    chatInfo.chatContent.push(newChatDetail);
    if (newImage) {
      chatInfo.imageList.push(newImage);
    }
    await newChatDetail.save();
    await chatInfo.save();
    sendResponse(res, 200, { message: "success" });
  } catch (error) {
    sendResponse(res, 500, { message: error.message });
  }
};

export const chatDetailController = {
  createChat,
  continueChat,
  getChatDetail,
};
