"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import SuccessMessage from "@/components/success-message";
import { IdentificationCard } from "@/components/identication-card";
import { Loader2 } from "lucide-react"; // Import a spinner icon

// Dynamically import the QR code reader to avoid SSR issues
const QrReader = dynamic(() => import("react-qr-reader"), { ssr: false });

const QRCodeScannerPage = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCard, setShowCard] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState<boolean>(false); // New loading state
  const router = useRouter();

  const handleScan = async (data: string | null) => {
    if (data) {
      setScanResult(data);
      setLoading(true); // Start loading state
      try {
        const response = await fetch("/api/qrcode-scan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ qrCodeData: data }),
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setShowCard(true);
        } else {
          setErrorMessage("Failed to retrieve user information.");
        }
      } catch (error) {
        console.error("Error retrieving user information:", error);
        setErrorMessage("An error occurred while retrieving user information.");
      } finally {
        setScanResult(null);

        // Simulate a 3-second delay for loading state
        setTimeout(() => {
          setLoading(false); // Stop loading state
          setErrorMessage(null);
        }, 3000);
      }
    }
  };

  const handleError = (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("QR Code Scan Error:", error);
    setErrorMessage("An error occurred while scanning the QR code.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Scan QR Code
        </h1>
        <div className="flex justify-center mb-6">
          {loading ? (
            // Display a professional loading message
            <div className="flex flex-col items-center justify-center h-[480px] bg-gray-100 rounded-lg">
              <Loader2 className="animate-spin h-12 w-12 text-gray-700" />
              <p className="mt-4 text-lg font-semibold text-gray-700">
                Processing your data...
              </p>
            </div>
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-lg overflow-hidden">
              <QrReader
                facingMode="environment"
                onScan={(result) => {
                  if (result) {
                    handleScan(result);
                  }
                }}
                onError={(error) => {
                  if (error) {
                    handleError(error);
                  }
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          )}
        </div>
        {scanResult && !loading && (
          <SuccessMessage
            message="QR code scanned successfully!"
            isError={false}
          />
        )}
        {errorMessage && (
          <SuccessMessage message={errorMessage} isError={true} />
        )}
        <div className="flex justify-center mt-6">
          <Button
            onClick={() => router.push("/")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-300"
          >
            Go Back
          </Button>
        </div>
      </div>
      {showCard && user && (
        <IdentificationCard
          user={user}
          isOpen={showCard}
          onClose={() => setShowCard(false)}
        />
      )}
    </div>
  );
};

export default QRCodeScannerPage;