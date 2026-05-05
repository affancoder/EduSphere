import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
import connectDB from "@/lib/db";
import Doubt from "@/models/Doubt";
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

    const decoded: any = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { question } = await req.json();

    if (!question || question.trim() === "") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    await connectDB();

    let answer = "";
    let topic = "General";
    
    if (process.env.OPENAI_API_KEY) {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: `You are an elite educational assistant at EduSphere. 
            Provide clear, concise, and helpful answers to the student's questions.
            
            EXTRACT TOPIC:
            Also, extract a short (1-3 words) topic that best categorizes the question.
            
            RESPONSE FORMAT (Strict JSON):
            {
              "answer": "your helpful answer...",
              "topic": "extracted topic"
            }` 
          },
          { role: "user", content: question },
        ],
        response_format: { type: "json_object" },
      });
      
      const resContent = JSON.parse(aiResponse.choices[0].message.content || "{}");
      answer = resContent.answer || "I couldn't generate an answer. Please try again.";
      topic = resContent.topic || "General";
    } else {
      // Fallback to mock if API key is missing
      answer = `[Mock AI Response] This is a helpful answer to your question: "${question}". At EduSphere, we provide elite AI-driven learning insights to help you master any subject.`;
      topic = "Mock Learning";
    }

    const newDoubt = await Doubt.create({
      userId: decoded.id,
      question: question.trim(),
      answer: answer,
      topic: topic,
      subject: "AI Assistant",
      status: "understood",
    });

    return NextResponse.json({ success: true, doubt: newDoubt }, { status: 201 });

  } catch (error: any) {
    console.error("AI Ask Error:", error);
    return NextResponse.json(
      { error: "Failed to get AI answer. Please try again." },
      { status: 500 }
    );
  }
}
