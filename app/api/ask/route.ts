import { NextResponse } from "next/server";
import OpenAI from "openai";
import connectDB from "@/lib/db";
import Doubt from "@/models/Doubt";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. Parse and validate request body
    const { question, subject } = await req.json();

    if (!question || typeof question !== "string" || question.trim() === "") {
      return NextResponse.json(
        { error: "Question is required and cannot be empty." },
        { status: 400 }
      );
    }

    // 2. Connect to MongoDB
    await connectDB();

    // 3. AI Integration: Generate explanation, example, and quiz
    const prompt = `
      You are an expert tutor. A student has a doubt about the following:
      Question: "${question}"
      Subject: "${subject || "General"}"

      Please provide:
      1. A simple, clear explanation.
      2. A real-world example.
      3. 3 quiz questions to test their understanding.

      RESPONSE FORMAT:
      You MUST return ONLY a valid JSON object. Do not include any other text, markdown formatting, or explanations outside the JSON.
      
      {
        "explanation": "Your clear explanation here...",
        "example": "Your real-world example here...",
        "quiz": ["Question 1", "Question 2", "Question 3"]
      }
    `;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using a cost-effective and fast model
      messages: [
        { role: "system", content: "You are a helpful and concise educational assistant that only communicates in JSON." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" }, // Ensures valid JSON response
    });

    const content = aiResponse.choices[0].message.content;

    if (!content) {
      throw new Error("Failed to get content from AI response.");
    }

    // 4. Parse AI response safely
    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error("AI JSON Parsing Error:", parseError, "Content:", content);
      return NextResponse.json(
        { error: "AI returned an invalid response format. Please try again." },
        { status: 500 }
      );
    }

    // 5. Database: Save the doubt to MongoDB
    const savedDoubt = await Doubt.create({
      question: question.trim(),
      subject: subject || "General",
      explanation: parsedContent.explanation,
      example: parsedContent.example,
      quiz: parsedContent.quiz,
      status: "pending",
    });

    // 6. Return the saved object as JSON
    return NextResponse.json(savedDoubt, { status: 201 });

  } catch (error: any) {
    console.error("API Error (/api/ask):", error);
    
    // Handle specific OpenAI errors if needed
    if (error.status === 401) {
      return NextResponse.json(
        { error: "OpenAI API key is invalid or missing." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
