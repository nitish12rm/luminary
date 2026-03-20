import mongoose, { Schema, Document } from "mongoose";
import { ThemeId } from "@/types";

export interface ICoupleDocument extends Document {
  accessCode: string;
  partner1Name: string;
  partner2Name: string;
  startDate: Date;
  theme: ThemeId;
  coverPhotoPath?: string;
  bio?: string;
  createdAt: Date;
}

const CoupleSchema = new Schema<ICoupleDocument>(
  {
    accessCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    partner1Name: { type: String, required: true, trim: true },
    partner2Name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    theme: {
      type: String,
      enum: ["blush", "golden", "velvet"],
      default: "blush",
    },
    coverPhotoPath: { type: String, default: null },
    bio: { type: String, maxlength: 500, default: "" },
  },
  { timestamps: true }
);

CoupleSchema.index({ accessCode: 1 });

const Couple =
  mongoose.models.Couple ||
  mongoose.model<ICoupleDocument>("Couple", CoupleSchema);

export default Couple;
