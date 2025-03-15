"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const RetreiveInformationPage = () => {
  const router = useRouter();

  const handleFaceDetection = () => {
    router.push("/retrieve-info/face-detection");
  };

  const handleQRCodeScanner = () => {
    router.push("/retrieve-info/qrcode-scanner");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">
        You can retrieve information here 🚀
        <br />
        <small className="text-base font-normal text-gray-500">
          Select an option below
        </small>
      </h1>
      <div className="space-x-4">
        <Button
          onClick={handleFaceDetection}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md"
        >
          Face Detection
        </Button>
        <Button
          onClick={handleQRCodeScanner}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md"
        >
          QR Code Scanner
        </Button>
      </div>
      <p
        onClick={() => router.push("/")}
        className="text-blue-500 cursor-pointer mt-8"
      >
        back to home page
      </p>
    </div>
  );
};

export default RetreiveInformationPage;
