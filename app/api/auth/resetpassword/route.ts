import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resetToken, password } = body;

    const response = await axios.put(
      `${process.env.BACKEND_URL}/api/auth/resetpassword/${resetToken}`,
      { password }
    );

    console.log("Backend response:", response.data);

    return NextResponse.json({ success: true, data: response.data });
  } catch (error: any) {
    console.error(
      "Reset password error:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      {
        error:
          error.response?.data?.error ||
          "An error occurred during password reset",
      },
      { status: error.response?.status || 500 }
    );
  }
}
