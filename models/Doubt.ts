import mongoose, { Schema, Document, model, models } from "mongoose";

export interface IDoubt extends Document {
  question: string;
  subject?: string;
  explanation?: string;
  example?: string;
  quiz?: string[];
  status: "pending" | "understood";
  createdAt: Date;
  updatedAt: Date;
}

const DoubtSchema = new Schema<IDoubt>(
  {
    question: {
      type: String,
      required: [true, "Please provide a question"],
      trim: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    explanation: {
      type: String,
    },
    example: {
      type: String,
    },
    quiz: {
      type: [String],
      default: [],
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
