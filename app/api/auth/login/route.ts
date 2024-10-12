import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await axios.post(
      `${process.env.BACKEND_URL}/api/auth/login`,
      body
    );

    console.log("Backend response:", response.data);

    const { token } = response.data;

    // Create a new response
    const nextResponse = NextResponse.json({ success: true, token });

    // Set the token as an HTTP-only cookie
    nextResponse.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: Number(process.env.JWT_COOKIE_EXPIRE!) * 24 * 60 * 60,
      path: "/",
    });

    return nextResponse;
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    return NextResponse.json(
      {
        error: error.response?.data?.error || "An error occurred during login",
      },
      { status: error.response?.status || 500 }
    );
  }
}
