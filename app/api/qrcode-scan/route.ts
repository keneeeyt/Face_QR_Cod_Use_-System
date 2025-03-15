import { db } from "@/config/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { qrCodeData } = await request.json();

    const parseData = JSON.parse(qrCodeData);

    if (!qrCodeData) {
      return NextResponse.json(
        { message: "No QR code data provided" },
        { status: 400 }
      );
    }

    // Assuming the QR code data contains the user's email or ID
    const user = await db.user.findUnique({
      where: { email: parseData.email }, // or { id: qrCodeData } depending on your QR code data
    });

    if (user) {
      return NextResponse.json(user, { status: 200 });
    } else {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error retrieving user information:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}