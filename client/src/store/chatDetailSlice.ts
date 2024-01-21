import { writable } from "svelte/store";
import ChatDetailApi from "~/api/v1/chatDetailApi";

const chatDetailApi = new ChatDetailApi();

export const chatDetailSlice = writable({
  chatDetail: [
    {
      chatId: "",
      senderContent: "",
      botContent: "",
    },
  ],
});

export const chatDetailSliceCreate = async (data: {
  userInput: string;
  role: string;
  chatId: string;
  image?: any;
}) => {
  try {
    const formData = new FormData();
    formData.append("userInput", data.userInput);
    formData.append("chatId", data.chatId);
    formData.append("role", data.role);
    formData.append("file", data.image);
    await chatDetailApi.createChat(formData);
  } catch (error) {
    return error;
  }
};

export const continueChat = async (data: {
  chatId: string;
  inputChat: string;
  image?: any;
}) => {
  try {
    const formData = new FormData();
    formData.append("file", data.image);
    formData.append("inputChat", data.inputChat);
    formData.append("chatId", data.chatId);
    await chatDetailApi.continueChat(formData);
  } catch (error) {
    return error;
  }
};
