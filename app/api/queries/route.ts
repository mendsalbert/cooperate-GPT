import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import axios from "axios";

export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const backendResponse = await axios.get(
      `${process.env.BACKEND_URL}/api/queries`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    return NextResponse.json(backendResponse.data);
  } catch (error) {
    console.error("Error fetching queries:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching queries" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const text = formData.get("text") as string;
    const modelId = formData.get("modelId") as string;
    const chatId = formData.get("chatId") as string | null;
    const file = formData.get("file") as File | null;

    if (!text && !file) {
      return NextResponse.json(
        { error: "Please provide query text or a file" },
        { status: 400 }
      );
    }

    if (!modelId) {
      return NextResponse.json(
        { error: "Please provide a model ID" },
        { status: 400 }
      );
    }

    const backendFormData = new FormData();
    backendFormData.append("text", text);
    backendFormData.append("modelId", modelId);
    if (chatId) {
      backendFormData.append("chatId", chatId);
    }
    if (file) {
      backendFormData.append("file", file);
    }

    const backendResponse = await axios.post(
      `${process.env.BACKEND_URL}/api/queries`,
      backendFormData,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return NextResponse.json(backendResponse.data);
  } catch (error) {
    console.error("Error processing query:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the query" },
      { status: 500 }
    );
  }
}
