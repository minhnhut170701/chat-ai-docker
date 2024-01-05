import express from "express";
import { chatDetailController } from "../controllers/Chat.controller.js";
import Authorization from "../middleware/Authorization.js";

const chatDetailRouter = express.Router();

chatDetailRouter.get(
  "/:chatId",
  Authorization,
  chatDetailController.getChatDetail
);
chatDetailRouter.post(
  "/create",
  Authorization,
  chatDetailController.createChat
);
chatDetailRouter.post(
  "/continue",
  Authorization,
  chatDetailController.continueChat
);

export default chatDetailRouter;
