import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./database/mongodb.js";
import userRouter from "./routes/User.route.js";
import chatRouter from "./routes/ChatInfo.route.js";
import chatDetailRouter from "./routes/Chat.route.js";

dotenv.config();
const app = express();
app.use(
  cors({
    origin: [process.env.ORIGIN_URL_1, process.env.ORIGIN_URL_2],
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/chatDetail", chatDetailRouter);

connectDB();
app.listen(process.env.PORT || 3005, () =>
  console.log("Example app listening on port 3005!")
);
