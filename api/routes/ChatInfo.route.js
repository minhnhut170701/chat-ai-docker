import express from "express";
import { chatInfoController } from "../controllers/ChatInfo.controller.js";
import Authorization from "../middleware/Authorization.js";

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

chatInfoRouter.delete(
  "/delete/image",
  Authorization,
  chatInfoController.removeImageStore
);

export default chatInfoRouter;
