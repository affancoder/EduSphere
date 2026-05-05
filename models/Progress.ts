import mongoose from "mongoose";

const ProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    totalLessons: {
      type: Number,
      required: true,
    },
    completedLessons: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-calculate percentage before saving
ProgressSchema.pre("save", function (next) {
  if (this.totalLessons && this.totalLessons > 0) {
    const calc = (this.completedLessons / this.totalLessons) * 100;
    this.percentage = Math.min(100, Math.max(0, Math.round(calc)));
  } else {
    this.percentage = 0;
  }
  next();
});

export default mongoose.models.Progress || mongoose.model("Progress", ProgressSchema);
