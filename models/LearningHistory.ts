import mongoose from "mongoose";

const LearningHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    lessonName: {
      type: String,
      required: true,
    },
    timeSpent: {
      type: Number, // in minutes
      default: 0,
    },
    completionStatus: {
      type: String,
      enum: ["completed", "in-progress"],
      default: "in-progress",
    },
  },
  { timestamps: true }
);

export default mongoose.models.LearningHistory || mongoose.model("LearningHistory", LearningHistorySchema);
