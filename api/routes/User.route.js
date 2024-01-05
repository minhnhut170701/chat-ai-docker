import express from "express";
import UserController from "../controllers/User.controller.js";
import Authorization from "../middleware/Authorization.js";

const userRouter = express.Router();

userRouter.post("/register", UserController.createUser);
userRouter.post("/login", UserController.loginUser);
userRouter.put("/update/:userId", Authorization, UserController.updateUser);

export default userRouter;
