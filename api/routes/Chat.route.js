import express from "express";
import multer from "multer";
import { chatDetailController } from "../controllers/Chat.controller.js";
import Authorization from "../middleware/Authorization.js";

const chatDetailRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

chatDetailRouter.get(
  "/:chatId",
  Authorization,
  chatDetailController.getChatDetail
);
chatDetailRouter.post(
  "/create",
  upload.single("file"),
  Authorization,
  chatDetailController.createChat
);
chatDetailRouter.post(
  "/continue",
  upload.single("file"),
  Authorization,
  chatDetailController.continueChat
);

export default chatDetailRouter;
