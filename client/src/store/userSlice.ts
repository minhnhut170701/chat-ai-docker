import { writable } from "svelte/store";
import AccessTokenService from "../services/accessToken.service";
import AuthApi from "~/api/v1/authApi";

const authService = new AccessTokenService();
const Auth = new AuthApi();

export const userSlice = writable({
  _id: "",
  userName: "",
  userEmail: "",
  userPassword: "",
});

export const loginUser = async (data: {
  userEmail: string;
  userPassword: string;
}) => {
  try {
    const response = await Auth.login(data);
    authService.set(response.data.authToken);
    userSlice.set({
      _id: response.data._id,
      userName: response.data.userName,
      userEmail: response.data.userEmail,
      userPassword: response.data.userPassword,
    });
    return response;
  } catch (error) {
    return error;
  }
};

export const logoutUser = () => {
  authService.remove();
  userSlice.set({
    _id: "",
    userName: "",
    userEmail: "",
    userPassword: "",
  });
};

export const registerUser = async (data: {
  userName: string;
  userEmail: string;
  userPassword: string;
}) => {
  try {
    const response = await Auth.register(data);
    authService.set(response.data._id);
    userSlice.set({
      _id: response.data._id,
      userName: response.data.userName,
      userEmail: response.data.userEmail,
      userPassword: response.data.userPassword,
    });
  } catch (error) {
    return error;
  }
};
