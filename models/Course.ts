import mongoose from "mongoose";

const VideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
  }
);

const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["pdf"],
      default: "pdf",
    },
  }
);

const ModuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    videos: {
      type: [VideoSchema],
      default: [],
    },
    resources: {
      type: [ResourceSchema],
      default: [],
    },
  },
  { _id: true }
);

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a course title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please provide a course description"],
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Please provide a category"],
      enum: [
        "frontend",
        "backend",
        "security",
        "other",
        "Programming",
        "Mathematics",
        "Science",
        "Languages",
        "Other",
      ],
    },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    thumbnail: {
      type: String,
      default: "",
    },
    totalLessons: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    modules: {
      type: [ModuleSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
