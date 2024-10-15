import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import axios from "axios";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = (await getServerSession(authOptions)) as any;

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = params.id;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  try {
    let url;
    if (type === "chat") {
      url = `${process.env.BACKEND_URL}/api/queries/chat/${id}`;
    } else {
      url = `${process.env.BACKEND_URL}/api/queries/${id}`;
    }

    const backendResponse = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    if (!backendResponse.data) {
      throw new Error("Invalid response from backend");
    }

    return NextResponse.json(backendResponse.data);
  } catch (error) {
    console.error("Error fetching query/chat history:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching data" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = (await getServerSession(authOptions)) as any;

  if (!session || !session.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const queryId = params.id;

  try {
    await axios.delete(`${process.env.BACKEND_URL}/api/queries/${queryId}`, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting query:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting the query" },
      { status: 500 }
    );
  }
}
