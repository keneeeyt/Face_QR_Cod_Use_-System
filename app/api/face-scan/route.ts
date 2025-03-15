import { db } from "@/config/db";
import { NextRequest, NextResponse } from "next/server";

function calculateEuclideanDistance(
  descriptor1: number[],
  descriptor2: number[]
): number {
  if (descriptor1.length !== descriptor2.length) {
    throw new Error("Descriptor lengths do not match");
  }

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    sum += Math.pow(descriptor1[i] - descriptor2[i], 2);
  }
  return Math.sqrt(sum);
}

const SIMILARITY_THRESHOLD = 0.6; // Adjust this threshold as needed

export async function POST(request: NextRequest) {
  try {
    const { face_data } = await request.json();

    if (!face_data) {
      return NextResponse.json(
        { message: "No face data provided" },
        { status: 400 }
      );
    }

    // Parse the face_data to compare
    const parsedFaceData: number[] = JSON.parse(face_data);

    // Fetch all users and compare their face_data
    const allUsers = await db.user.findMany();
    const matchedUser = allUsers.find((user) => {
      const storedFaceData = user.face_data as number[] | null;
      if (!storedFaceData) {
        return false;
      }
      const distance = calculateEuclideanDistance(parsedFaceData, storedFaceData);
      return distance < SIMILARITY_THRESHOLD;
    });

    if (matchedUser) {
      return NextResponse.json(
        { message: "User found", user: matchedUser },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}