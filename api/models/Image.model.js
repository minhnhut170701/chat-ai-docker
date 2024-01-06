import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    imageName: {
      type: String,
      required: true,
    },
    imageURL: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "imageList",
  }
);

export default mongoose.model("Image", ImageSchema);
