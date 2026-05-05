import mongoose from "mongoose";
import * as dotenv from "dotenv";
import Course from "../models/Course";
import Lesson from "../models/Lesson";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env");
  process.exit(1);
}

const seedData = [
  {
    course: {
      title: "React Basics",
      description: "Learn the fundamentals of React, including components, props, and state.",
      category: "Programming",
      level: "Beginner",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop",
      duration: 120,
    },
    lessons: [
      {
        title: "Introduction to React",
        description: "What is React and why use it?",
        content: "React is a JavaScript library for building user interfaces. It is component-based and uses a declarative approach.",
        videoUrl: "https://www.youtube.com/watch?v=Ke90Tje7VS0",
        order: 1,
        duration: 30,
      },
      {
        title: "JSX and Components",
        description: "Understanding JSX and how to create functional components.",
        content: "JSX is a syntax extension for JavaScript that looks like HTML. Components are the building blocks of a React application.",
        videoUrl: "https://www.youtube.com/watch?v=7fPXI_MnBOY",
        order: 2,
        duration: 45,
      },
      {
        title: "Props and State",
        description: "How to pass data and manage internal component state.",
        content: "Props are read-only data passed to components. State is internal data that can change over time.",
        videoUrl: "https://www.youtube.com/watch?v=4ORZ1GmjaMc",
        order: 3,
        duration: 45,
      },
    ],
  },
  {
    course: {
      title: "JavaScript Fundamentals",
      description: "Master the core concepts of JavaScript from variables to ES6 features.",
      category: "Programming",
      level: "Beginner",
      thumbnail: "https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=800&auto=format&fit=crop",
      duration: 150,
    },
    lessons: [
      {
        title: "Variables and Data Types",
        description: "Introduction to let, const, and basic data types.",
        content: "JavaScript has various data types like String, Number, Boolean, Null, and Undefined. Use const by default.",
        videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
        order: 1,
        duration: 40,
      },
      {
        title: "Functions and Scope",
        description: "Defining functions and understanding global vs local scope.",
        content: "Functions are reusable blocks of code. Scope determines the accessibility of variables.",
        videoUrl: "https://www.youtube.com/watch?v=G30XvU266To",
        order: 2,
        duration: 50,
      },
      {
        title: "ES6+ Features",
        description: "Arrow functions, template literals, and destructuring.",
        content: "ES6 introduced modern syntax that makes JavaScript more concise and readable.",
        videoUrl: "https://www.youtube.com/watch?v=nZ1DMMsyVyI",
        order: 3,
        duration: 60,
      },
    ],
  },
  {
    course: {
      title: "Node.js Basics",
      description: "Build scalable server-side applications using Node.js and Express.",
      category: "Programming",
      level: "Intermediate",
      thumbnail: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop",
      duration: 180,
    },
    lessons: [
      {
        title: "What is Node.js?",
        description: "Introduction to the Node.js runtime environment.",
        content: "Node.js is a runtime that allows you to run JavaScript on the server. It uses an event-driven, non-blocking I/O model.",
        videoUrl: "https://www.youtube.com/watch?v=ENrzD9HAZK4",
        order: 1,
        duration: 45,
      },
      {
        title: "Building a Simple Server",
        description: "Using the http module and introducing Express.",
        content: "Express is a fast, unopinionated, minimalist web framework for Node.js.",
        videoUrl: "https://www.youtube.com/watch?v=L72fhGm1tfE",
        order: 2,
        duration: 60,
      },
      {
        title: "Working with Modules",
        description: "CommonJS vs ES Modules in Node.js.",
        content: "Modules are blocks of code that can be exported and imported into other files.",
        videoUrl: "https://www.youtube.com/watch?v=mK5HyItH_S4",
        order: 3,
        duration: 75,
      },
    ],
  },
];

async function seedDatabase() {
  console.log("🚀 Starting seeding process...");
  try {
    if (!MONGODB_URI) throw new Error("MONGODB_URI is missing");
    
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB for seeding");

    // Clear existing data
    await Course.deleteMany({});
    await Lesson.deleteMany({});
    console.log("🧹 Cleared existing courses and lessons");

    for (const data of seedData) {
      const course = await Course.create({
        ...data.course,
        totalLessons: data.lessons.length,
      });

      console.log(`📚 Created Course: ${course.title}`);

      for (const lessonData of data.lessons) {
        await Lesson.create({
          ...lessonData,
          courseId: course._id,
        });
      }
      console.log(`   ✅ Added ${data.lessons.length} lessons to ${course.title}`);
    }

    console.log("✨ Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDatabase();
