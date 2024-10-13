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

  const queryId = params.id;

  try {
    const backendResponse = await axios.get(
      `${process.env.BACKEND_URL}/api/queries/${queryId}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    );

    if (!backendResponse.data || !backendResponse.data.data) {
      throw new Error("Invalid response from backend");
    }

    return NextResponse.json(backendResponse.data);
  } catch (error) {
    console.error("Error fetching query history:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching query history" },
      { status: 500 }
    );
  }
}
