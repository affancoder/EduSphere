import mongoose, { Schema, Document } from "mongoose";

export interface ITopic {
  title: string;
  description: string;
  isCompleted: boolean;
  order: number;
}

export interface IRoadmap extends Document {
  userId: mongoose.Types.ObjectId;
  goal: string;
  description: string;
  topics: ITopic[];
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedWeeks: number;
  status: "active" | "completed" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  order: { type: Number, required: true },
});

const RoadmapSchema = new Schema<IRoadmap>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    goal: {
      type: String,
      required: [true, "Please provide a learning goal"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    topics: [TopicSchema],
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    estimatedWeeks: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["active", "completed", "archived"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Roadmap || mongoose.model<IRoadmap>("Roadmap", RoadmapSchema);
