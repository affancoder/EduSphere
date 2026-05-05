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

    const { roadmapId, topicTitle } = await req.json();

    if (!roadmapId || !topicTitle) {
      return NextResponse.json({ error: "Missing roadmap ID or topic title" }, { status: 400 });
    }

    await connectDB();

    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId: decoded.id });
    if (!roadmap) {
      return NextResponse.json({ error: "Roadmap not found" }, { status: 404 });
    }

    const prompt = `
      You are an elite tutor for the goal: "${roadmap.goal}".
      Current Topic: "${topicTitle}"
      
      Generate a comprehensive lesson for this topic. 
      The lesson must include:
      1. A detailed explanation of the concept (using Markdown).
      2. A practical code example or real-world scenario.
      3. A key takeaway summary.
      4. 3 multiple-choice questions to test understanding.

      RESPONSE FORMAT (Strict JSON):
      {
        "content": "markdown explanation...",
        "codeExample": "code or scenario...",
        "takeaway": "key takeaway...",
        "quiz": [
          {
            "question": "question text",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": 0
          }
        ]
      }
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful educational assistant that generates detailed lesson content in JSON format." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = aiResponse.choices[0].message.content;
    if (!content) {
      throw new Error("Failed to generate lesson content");
    }

    return NextResponse.json({ success: true, lesson: JSON.parse(content) }, { status: 200 });

  } catch (error: any) {
    console.error("Topic Content Generation Error:", error);
    return NextResponse.json(
      { error: "Failed to generate lesson content. Please try again." },
      { status: 500 }
    );
  }
}
