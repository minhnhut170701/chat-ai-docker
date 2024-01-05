import { writable } from "svelte/store";
import ChatApi from "~/api/v1/chatApi";

const chatApi = new ChatApi();

export const chatSlice = writable({
  loading: false,
  data: [
    {
      _id: "",
      chatName: "",
      chatContent: [{ userChat: "", botChat: "" }],
    },
  ],
});

export const setListChat = async (userId: string) => {
  try {
    const chatList = await chatApi.getChatInfo({ userId: userId });
    chatSlice.set({ loading: false, data: chatList.data.chatInfo });
  } catch (error) {
    chatSlice.set({ loading: false, data: [] });
    return error;
  }
};

export const addNewChat = async (userId: string) => {
  try {
    const chat = await chatApi.createChat({ userId });
    chatSlice.update((state) => {
      return {
        ...state,
        data: [
          ...state.data,
          {
            _id: chat.data._id,
            chatName: chat.data.chatName,
            chatContent: [{ userChat: "", botChat: "" }],
          },
        ],
      };
    });
  } catch (error) {
    return error;
  }
};

export const deleteChat = async (data: { userId: string; chatId: string }) => {
  try {
    await chatApi.deleteChat(data);
    chatSlice.update((state) => {
      return {
        ...state,
        data: state.data.filter((chat) => chat._id !== data.chatId),
      };
    });
  } catch (error) {
    return error;
  }
};

export const getChatInfoDetail = async (chatId: string) => {
  try {
    const chatDetail = await chatApi.getChatDetail(chatId);
    chatSlice.update((state) => {
      return {
        ...state,
        data: state.data.map((chat) => {
          if (chat._id === chatId) {
            return {
              ...chat,
              chatContent: chatDetail.data,
            };
          } else {
            return chat;
          }
        }),
      };
    });
    return chatDetail.data;
  } catch (error) {
    return error;
  }
};

export const clearChat = () => {
  chatSlice.set({ loading: false, data: [] });
};