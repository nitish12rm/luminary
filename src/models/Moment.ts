import mongoose, { Schema, Document, Types } from "mongoose";
import { MomentCategory } from "@/types";

export interface IMomentDocument extends Document {
  coupleId: Types.ObjectId;
  category: MomentCategory;
  customLabel?: string;
  date: Date;
  rawDescription: string;
  poeticNarrative?: string;
  photoPath?: string;
  photoAlt?: string;
  order: number;
  createdAt: Date;
}

const MomentSchema = new Schema<IMomentDocument>(
  {
    coupleId: {
      type: Schema.Types.ObjectId,
      ref: "Couple",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        "first_meeting",
        "first_conversation",
        "first_walk",
        "knowing_feelings",
        "proposal",
        "first_kiss",
        "first_date",
        "first_fight",
        "custom",
      ],
      required: true,
    },
    customLabel: { type: String, default: "" },
    date: { type: Date, required: true },
    rawDescription: { type: String, required: true, maxlength: 2000 },
    poeticNarrative: { type: String, default: "" },
    photoPath: { type: String, default: null },
    photoAlt: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

MomentSchema.index({ coupleId: 1, date: 1 });

const Moment =
  mongoose.models.Moment ||
  mongoose.model<IMomentDocument>("Moment", MomentSchema);

export default Moment;
