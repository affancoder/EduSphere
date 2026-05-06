import mongoose from "mongoose";

const RazorpayOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true, // in paise (Razorpay expects smallest currency unit)
      min: [0, "Amount cannot be negative"],
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
      index: true,
    },
    lastSignature: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.RazorpayOrder ||
  mongoose.model("RazorpayOrder", RazorpayOrderSchema);

