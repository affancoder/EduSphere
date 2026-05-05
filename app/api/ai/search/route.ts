import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import OpenAI from "openai";
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

    const { query } = await req.json();

    if (!query || query.trim() === "") {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 });
    }

    let explanation = "";
    let topic = query.trim();

    if (process.env.OPENAI_API_KEY) {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: `You are an elite educational researcher at EduSphere. 
            Provide a comprehensive, high-level explanation of the requested topic.
            
            EXTRACT TOPIC:
            Also, provide a standardized name for this topic.
            
            RESPONSE FORMAT (Strict JSON):
            {
              "explanation": "comprehensive markdown explanation...",
              "standardizedTopic": "Topic Name"
            }` 
          },
          { role: "user", content: `Explain this topic in detail: ${query}` },
        ],
        response_format: { type: "json_object" },
      });
      
      const resContent = JSON.parse(aiResponse.choices[0].message.content || "{}");
      explanation = resContent.explanation || "I couldn't generate an explanation. Please try again.";
      topic = resContent.standardizedTopic || query;
    } else {
      explanation = `[Mock Search Result] This is a comprehensive explanation for "${query}". It covers the core principles, advanced applications, and strategic importance within the EduSphere ecosystem.`;
    }

    return NextResponse.json({ 
      success: true, 
      explanation, 
      topic 
    }, { status: 200 });

  } catch (error: any) {
    console.error("AI Search Error:", error);
    return NextResponse.json(
      { error: "Failed to perform AI search. Please try again." },
      { status: 500 }
    );
  }
}
