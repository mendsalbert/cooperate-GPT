import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import axios from "axios";

const modelSchema = z.object({
  name: z.string().min(2),
  provider: z.enum(["OpenAI", "Gemini", "Claude"]),
  apiKey: z.string().min(1),
});

export async function GET(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await axios.get(`${process.env.BACKEND_URL}/api/models`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Error fetching models:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;

  console.log("Session in POST /api/models:", session);

  if (!session || !session.accessToken) {
    return NextResponse.json(
      { error: "Unauthorized", session: session },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const validatedData = modelSchema.parse(body);

    const response = await axios.post(
      `${process.env.BACKEND_URL}/api/models`,
      validatedData,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      }
    );

    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error creating model:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const body = await req.json();
    const validatedData = modelSchema.partial().parse(body);

    const response = await axios.put(
      `${process.env.BACKEND_URL}/api/models/${id}`,
      validatedData,
      {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error updating model:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = (await getServerSession(authOptions)) as any;

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Model ID is required" },
        { status: 400 }
      );
    }

    await axios.delete(`${process.env.BACKEND_URL}/api/models/${id}`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    return NextResponse.json({ message: "Model deleted successfully" });
  } catch (error) {
    console.error("Error deleting model:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
