import mongoose, { Schema } from "mongoose";

const SubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

SubscriptionSchema.index({ userId: 1, courseId: 1, createdAt: -1 });

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);
