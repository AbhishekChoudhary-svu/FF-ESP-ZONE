import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import {Message} from "@/models/message.model"; // Ensure you have this model created

export async function GET() {
  try {
    // 1. Establish Database Connection
    await dbConnect();

    // 2. Fetch the last 50 messages, newest first, then reverse for chronological order
    const chatHistory = await Message.find()
      .sort({ timestamp: -1 })
      .limit(50);

    const formattedHistory = chatHistory.reverse();

    // 3. Return standardized response (matching your Player API format)
    return NextResponse.json(
      {
        success: true,
        messages: formattedHistory,
        count: formattedHistory.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Fetch chat history error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch chat history",
      },
      { status: 500 }
    );
  }
}