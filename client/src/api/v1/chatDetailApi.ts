import axiosClient from "../axiosClient";
import ResourceApi from "../resourceApi";

class ChatApi<T> extends ResourceApi<T> {
  constructor() {
    super("/api/chatDetail");
  }

  getChatInfo(data: any) {
    return axiosClient({
      url: `${this.uri}/${data.chatId}`,
      method: "GET",
    });
  }

  createChat(data: any) {
    return axiosClient({
      url: `${this.uri}/create`,
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: data,
    });
  }

  continueChat(data: any) {
    return axiosClient({
      url: `${this.uri}/continue`,
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: data,
    });
  }
}

export default ChatApi;
