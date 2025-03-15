import { db } from "@/config/db";
import { NextRequest, NextResponse } from "next/server";
import { uploadFileToCloudinary } from "@/utils/s3-upload";
import QRCode from "qrcode";

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
    const formData = await request.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const face_data = formData.get("face_data") as string;
    const imageFile = formData.get("image_capture") as File;

    if (!imageFile) {
      return NextResponse.json(
        { message: "No image file provided" },
        { status: 400 }
      );
    }

    // Check if a user with the same email already exists
    const existingUserByEmail = await db.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 } // 409 Conflict
      );
    }

    // Parse the face_data to compare
    const parsedFaceData = JSON.parse(face_data);

    // Fetch all users and compare their face_data
    const allUsers = await db.user.findMany();
    const isFaceDataRegistered = allUsers.some((user) => {
      const storedFaceData = user.face_data as number[] | null;
      if (!storedFaceData) {
        return false;
      }
      const distance = calculateEuclideanDistance(parsedFaceData, storedFaceData);
      return distance < SIMILARITY_THRESHOLD;
    });

    if (isFaceDataRegistered) {
      return NextResponse.json(
        { message: "Face data already registered" },
        { status: 409 } // 409 Conflict
      );
    }

    // Upload the image to S3 using your existing function
    const s3Url = await uploadFileToCloudinary(imageFile, name);

    if (!s3Url) {
      throw new Error("Failed to upload image to S3");
    }

    // Generate a QR code
    const qrCodeData = JSON.stringify({ email, name }); // Encode user data in the QR code
    const qrCodeImage = await QRCode.toDataURL(qrCodeData); // Generate QR code as a data URL

    // Convert the data URL to a Blob
    const qrCodeBlob = await fetch(qrCodeImage).then((res) => res.blob());

    // Upload the QR code to Cloudinary
    const qrCodeFile = new File([qrCodeBlob], `qr_${email}.png`, { type: 'image/png' });
    const qrCodeUrl = await uploadFileToCloudinary(qrCodeFile, `qr_${email}`);

    if (!qrCodeUrl) {
      throw new Error("Failed to upload QR code to Cloudinary");
    }

    // Create a new user with the S3 image URL and QR code URL
   const user = await db.user.create({
      data: {
        name,
        email,
        image_capture: s3Url, // Save the S3 URL
        face_data: parsedFaceData, // Use the parsed face_data
        qr_code: qrCodeUrl, // Save the QR code URL
      },
    });

    return NextResponse.json(
      { message: "User created successfully", user },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
