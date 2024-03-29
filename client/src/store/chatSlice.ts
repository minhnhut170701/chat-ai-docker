import { writable } from "svelte/store";
import ChatApi from "~/api/v1/chatApi";

const chatApi = new ChatApi();

export const chatSlice = writable({
  loading: false,
  data: [
    {
      _id: "",
      chatName: "",
      chatContent: [{ userChat: "", botChat: "", imageSrc: "" }],
      imageBlob: "",
    },
  ],
});

export const setListChat = async (userId: string) => {
  try {
    const chatList = await chatApi.getChatInfo({ userId: userId });
    chatSlice.set({
      loading: false,
      data: chatList.data.chatInfo.map((item: any) => ({
        chatName: item.chatName,
        _id: item._id,
        chatContent: [],
        // imageList: [],
      })),
    });
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
            chatContent: [],
            imageBlob: "",
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
  } catch (error: any) {
    throw new Error(error);
  }
};

export const uploadImage = async (file: File, chatId: string) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("chatId", chatId);
    const image = await chatApi.uploadImageOnCloud(formData);
    chatSlice.update((state) => {
      return {
        ...state,
        imageBlob: image.data.source.imageSrc,
      };
    });
    return image.data.source.imageSrc;
  } catch (error: any) {
    throw new Error(error);
  }
};

export const clearChat = () => {
  chatSlice.set({ loading: false, data: [] });
};
