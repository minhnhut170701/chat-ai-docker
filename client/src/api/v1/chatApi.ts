import axiosClient from "../axiosClient";
import ResourceApi from "../resourceApi";

class ChatApi<T> extends ResourceApi<T> {
  constructor() {
    super("/api/chat");
  }

  getChatInfo(data: any) {
    return axiosClient({
      url: `${this.uri}/get/${data.userId}`,
      method: "GET",
    });
  }

  getChatDetail(chatId: string) {
    return axiosClient({
      url: `${this.uri}/get/all/${chatId}`,
      method: "GET",
    });
  }

  createChat(data: any) {
    return axiosClient({
      url: `${this.uri}/create`,
      method: "POST",
      data: data,
    });
  }

  deleteChat(data: any) {
    return axiosClient({
      url: `${this.uri}/delete`,
      method: "DELETE",
      data: data,
    });
  }

  clearChat(data: any) {
    return axiosClient({
      url: `${this.uri}/clear`,
      method: "DELETE",
      data: data,
    });
  }

  uploadImageOnCloud(data: any) {
    return axiosClient({
      url: `${this.uri}/upload/image`,
      method: "POST",
      data: data,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
}

export default ChatApi;
