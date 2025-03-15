// utils/cloudinary-upload.ts
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = async (
  file: File | Buffer,
  name: string
): Promise<string | null> => {
  try {
    // Convert File to Buffer (if it's a File object)
    const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

    // Convert the buffer to a data URL or base64 string
    const base64Data = buffer.toString('base64');
    const dataUri = `data:application/octet-stream;base64,${base64Data}`;

    // Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      public_id: name, // Optional: specify a public ID for the uploaded file
      resource_type: 'auto', // Automatically detect the file type
    });

    console.log("Upload successful:", result);
    return result.secure_url; // Return the secure URL of the uploaded file
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Error uploading file to Cloudinary:", error);

    // Log the error details
    if (error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error message:", error.message);
    }

    return null;
  }
};