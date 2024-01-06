import express from "express";
import multer from "multer";
import { chatInfoController } from "../controllers/ChatInfo.controller.js";
import Authorization from "../middleware/Authorization.js";

const upload = multer({ dest: process.env.UPLOAD_STORE_FOLDER });

const chatInfoRouter = express.Router();

chatInfoRouter.post("/create", Authorization, chatInfoController.createChat);
chatInfoRouter.delete("/delete", Authorization, chatInfoController.removeChat);
chatInfoRouter.get("/get/:userId", Authorization, chatInfoController.getChat);
chatInfoRouter.delete("/clear", Authorization, chatInfoController.clearChat);
chatInfoRouter.get(
  "/get/all/:chatInfoId",
  Authorization,
  chatInfoController.getAllChatDetail
);
chatInfoRouter.post(
  "/upload/image",
  Authorization,
  upload.single("file"),
  chatInfoController.uploadImageToStorage
);

export default chatInfoRouter;
