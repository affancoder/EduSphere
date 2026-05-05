import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IDoubt extends Document {
  userId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  subject?: string;
  status: "pending" | "understood";
  createdAt: Date;
  updatedAt: Date;
}

const DoubtSchema = new Schema<IDoubt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: String,
      required: [true, "Please provide a question"],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, "Please provide an answer"],
    },
    subject: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "understood"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite in Next.js development during hot reloads
const Doubt = models.Doubt || model<IDoubt>("Doubt", DoubtSchema);

export default Doubt;
