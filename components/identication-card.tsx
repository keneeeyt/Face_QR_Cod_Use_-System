"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Image from "next/image";
import html2canvas from "html2canvas-pro"; // Updated import
import jsPDF from "jspdf";

interface User {
  name: string;
  email: string;
  image_capture: string;
  qr_code: string;
}

const replaceOklchColors = (element: HTMLElement) => {
  // Implement the logic to replace oklch colors
  // This is a placeholder function
  console.log("Replacing oklch colors in", element);
};

export const IdentificationCard: React.FC<{
  user: User;
  isOpen: boolean;
  onClose: () => void;
}> = ({ user, isOpen, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [qrCodeError, setQrCodeError] = useState(false);

  const handleDownloadPDF = async () => {
    try {
      if (cardRef.current) {
        setIsGeneratingPDF(true);

    // Replace oklch colors before capturing
    replaceOklchColors(cardRef.current);

    // Ensure images are loaded
    const images = cardRef.current.querySelectorAll("img");
    const imageLoadPromises = Array.from(images).map(
      (img) =>
        new Promise((resolve) => {
          if ((img as HTMLImageElement).complete) {
            resolve(null);
          } else {
            img.addEventListener("load", resolve);
          }
        })
    );

    await Promise.all(imageLoadPromises);

    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("portrait", "mm", "a4");

    const margin = 10;
    const pdfWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", margin, margin, pdfWidth, pdfHeight);
    pdf.save(`${user.name}_ID_Card.pdf`);

    setIsGeneratingPDF(false);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsGeneratingPDF(false);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle></DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-6">
          <Card
            ref={cardRef}
            className="w-full bg-white border border-gray-200 shadow-none border-none overflow-hidden"
          >
            <CardHeader className="bg-blue-600 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  Captured information
                </h2>
                <Avatar className="h-12 w-12 border-2 border-white">
                  {imageError ? (
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  ) : (
                    <AvatarImage
                      src={user.image_capture}
                      alt={user.name}
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                  )}
                </Avatar>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  {imageError ? (
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  ) : (
                    <AvatarImage
                      src={user.image_capture}
                      alt={user.name}
                      className="object-cover"
                      onError={() => setImageError(true)}
                    />
                  )}
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-center">
                  {qrCodeError ? (
                    <div className="w-32 h-32 flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500">QR Code Not Available</span>
                    </div>
                  ) : (
                    <Image
                      src={user.qr_code}
                      alt="QR Code"
                      width={120}
                      height={120}
                      className="w-32 h-32"
                      onError={() => setQrCodeError(true)}
                    />
                  )}
                </div>
                <p className="text-sm text-gray-500 text-center mt-2">
                  Scan this QR code to verify the user.
                </p>
              </div>
            </CardContent>
          </Card>
          <Button
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? "Generating PDF..." : "Download ID Card as PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};