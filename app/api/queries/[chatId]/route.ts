import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import axios from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: { chatId: string } }
) {
  const session = (await getServerSession(authOptions)) as any;

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const chatId = params.chatId;

  try {
    const backendResponse = await axios.get(
      `${process.env.BACKEND_URL}/api/queries/chat/${chatId}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    return NextResponse.json(backendResponse.data);
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching chat history" },
      { status: 500 }
    );
  }
}
