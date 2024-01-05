import {
  VertexAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google-cloud/vertexai";
import config from "../configs/index.js";
import ChatInfo from "../models/ChatInfo.model.js";
import Chat from "../models/Chat.model.js";
import { sendResponse } from "../utils/helper.js";

const { styleResponse } = config;

const initConfig = {
  projectId: process.env.GOOGLE_SERVICE_ID,
  location: "asia-northeast1",
  model: "gemini-pro",
  // image: "gs://generativeai-downloads/images/scones.jpg",
  // mimeType: "image/jpeg"
};

const vertexAI = new VertexAI({
  project: initConfig.projectId,
  location: initConfig.location,
});

const generativeModel = vertexAI.preview.getGenerativeModel({
  model: initConfig.model,
  generation_config: {
    max_output_tokens: 8192,
    temperature: 0.2,
  },

  safety_settings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },

    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_UNSPECIFIED,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

// const createChatGeminiAI = async (textPart) => {
//
//   const request = {
//     contents: [{ role: "user", parts: [textPart] }],
//   };
//   try {
//     const responseStream = await generativeVisionModel.generateContentStream(
//       request
//     );

//     // Wait for the response stream to complete
//     const aggregatedResponse = await responseStream.response;

//     // Select the text from the response
//     let fullTextResponse =
//       aggregatedResponse.candidates[0].content.parts[0].text;

//     // Convert the text to HTML
//     // fullTextResponse = fullTextResponse
//     //   .replace(/\n/g, "<br/>")
//     //   .replace(/```javascript([^`]*)```/g, "<pre><code>$1</code></pre>");
//     return fullTextResponse;
//   } catch (error) {
//     sendResponse(res, 500, { error: error.message });
//   }
// };

const createChatGeminiAI = async (textPart) => {
  const chat = generativeModel.startChat({});
  try {
    const userMessage0 = [{ text: textPart }];
    const streamResult0 = await chat.sendMessageStream(userMessage0);
    const response = await streamResult0.response;
    return response.candidates[0].content.parts[0].text;
  } catch (error) {
    sendResponse(res, 500, { error: error.message });
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
  if (userInput.length > 1000) {
    return sendResponse(res, 500, { message: "Input too long" });
  }
  const responseStyle = styleResponse.find((item) => item.role === role);

  const textPart = `
    ${role || ""}.\n
    ${responseStyle.styleResponse || ""}.\n
    ${userInput || ""}
    `;
  try {
    const fullTextResponse = await createChatGeminiAI(textPart);
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
    sendResponse(res, 200, chatId);
  } catch (error) {
    sendResponse(res, 500, { message: error.message });
  }
};

const continueChat = async (req, res) => {
  const { inputChat, chatId } = req.body;
  try {
    const chatInfo = await ChatInfo.findById(chatId).populate("chatContent");
    if (!chatInfo) {
      return sendResponse(res, 404, { message: "ChatInfo not found" });
    }

    const previousChat =
      chatInfo.chatContent.length > 0
        ? chatInfo.chatContent[chatInfo.chatContent.length - 1]
        : null;

    const textPart = `
    ${previousChat ? previousChat.restChat : ""}. \n\n  ${inputChat || ""}
    `;

    const valueChat = await createChatGeminiAI(textPart);

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
