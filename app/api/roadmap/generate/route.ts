import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import connectDB from "@/lib/db";
import Roadmap from "@/models/Roadmap";
import { verifyToken } from "@/lib/auth";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { goal, difficulty } = await req.json();

    if (!goal || goal.trim() === "") {
      return NextResponse.json({ error: "Learning goal is required" }, { status: 400 });
    }

    await connectDB();

    const prompt = `
      You are an elite educational consultant. A student wants to achieve the following learning goal: "${goal}"
      The student's current level is: "${difficulty || "Beginner"}"

      Generate a personalized learning roadmap. 
      The roadmap should include:
      1. A short, inspiring description of the journey.
      2. A list of 5-8 specific topics to master, in order.
      3. For each topic, provide a short description of what they will learn.
      4. Estimated number of weeks to complete this goal.

      RESPONSE FORMAT (Strict JSON):
      {
        "description": "inspiring description...",
        "estimatedWeeks": 4,
        "topics": [
          {
            "title": "Topic Title",
            "description": "What they will learn...",
            "order": 1
          }
        ]
      }
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful educational assistant that creates structured learning roadmaps in JSON format." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = aiResponse.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate roadmap content");
    }

    const parsedContent = JSON.parse(content);

    const newRoadmap = await Roadmap.create({
      userId: decoded.id,
      goal: goal.trim(),
      description: parsedContent.description,
      topics: parsedContent.topics.map((t: any) => ({ ...t, isCompleted: false })),
      difficulty: difficulty || "Beginner",
      estimatedWeeks: parsedContent.estimatedWeeks || 1,
      status: "active",
    });

    return NextResponse.json({ success: true, roadmap: newRoadmap }, { status: 201 });

  } catch (error: any) {
    console.error("Roadmap Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate your personalized roadmap. Please try again." },
      { status: 500 }
    );
  }
}
