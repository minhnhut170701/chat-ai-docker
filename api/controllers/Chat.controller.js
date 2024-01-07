import { VertexAI } from "@google-cloud/vertexai";

import config from "../configs/index.js";
import ChatInfo from "../models/ChatInfo.model.js";
import Chat from "../models/Chat.model.js";

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
    const request = {
      contents: [
        { role: "user", parts: !image ? [textPart] : [textPart, filePart] },
      ],
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
  const { userInput, role, chatId, image } = req.body;

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
    if (image) {
      fullTextResponse = await createChatGeminiAI(textPart, image);
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
      restChat: restChat,
    });
    chatInfo.chatContent.push(newChatDetail);

    await newChatDetail.save();
    await chatInfo.save();
    sendResponse(res, 200, { message: "success" });
  } catch (error) {
    sendResponse(res, 500, { message: error });
  }
};

const continueChat = async (req, res) => {
  const { inputChat, chatId, image } = req.body;
  try {
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
    if (image) {
      valueChat = await createChatGeminiAI(textPart, image);
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
      restChat: restChat,
    });

    chatInfo.chatContent.push(newChatDetail);
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
