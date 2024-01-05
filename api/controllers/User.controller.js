import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { sendResponse } from "../utils/helper.js";

const saltRounds = 10;
const createUser = async (req, res) => {
  const { userName, userPassword, userEmail } = req.body;
  try {
    const hash = await bcrypt.hash(userPassword, saltRounds);
    const user = await User.create({
      userName,
      userEmail,
      userPassword: hash,
    });
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, {
      expiresIn: "1d",
    });
    user.authToken = token;
    user.save();
    sendResponse(res, 200, user);
  } catch (error) {
    sendResponse(res, 500, { message: error.message });
  }
};

const removeUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return sendResponse(res, 404, { message: "User not found" });

    const removeUser = await User.deleteOne({ _id: userId });
    sendResponse(res, 200, removeUser);
  } catch (error) {
    sendResponse(res, 500, { message: error.message });
  }
};

const updateUser = async (req, res) => {
  const { userId } = req.params;
  const dataUpdate = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return sendResponse(res, 404, { message: "User not found" });
    // Check if all properties in dataUpdate exist in the user document
    if (!Object.keys(dataUpdate).every((item) => item in user))
      return sendResponse(res, 400, { message: "Data update invalid" });

    await User.updateOne({ _id: userId }, dataUpdate);
    sendResponse(res, 200, { message: "Update success" });
  } catch (error) {
    sendResponse(res, 500, { message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { userEmail, userPassword } = req.body;
  try {
    const user = await User.findOne({ userEmail });
    if (!user) return sendResponse(res, 404, { message: "User not found" });
    const isMatch = await bcrypt.compare(userPassword, user.userPassword);
    if (!isMatch) return sendResponse(res, 400, { message: "Wrong password" });
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, {
      expiresIn: "1d",
    });
    user.authToken = token;
    user.save();
    sendResponse(res, 200, user);
  } catch (error) {
    sendResponse(res, 500, { message: error.message });
  }
};

const UserController = {
  createUser,
  removeUser,
  updateUser,
  loginUser,
};

export default UserController;
