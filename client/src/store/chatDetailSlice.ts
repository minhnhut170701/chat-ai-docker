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
  image?: string;
}) => {
  try {
    await chatDetailApi.createChat(data);
  } catch (error) {
    return error;
  }
};

export const continueChat = async (data: {
  chatId: string;
  inputChat: string;
  image?: string;
}) => {
  try {
    await chatDetailApi.continueChat(data);
  } catch (error) {
    return error;
  }
};
