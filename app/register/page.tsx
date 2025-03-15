"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState, useCallback } from "react";
import { loadModels, getFaceDescriptor } from "@/utils/face-recognation";
import * as faceapi from "face-api.js";
import { toast } from "sonner";
import SuccessMessage from "@/components/success-message";
import { Input } from "@/components/ui/input";
import { IdentificationCard } from "@/components/identication-card";
import { Loader2 } from "lucide-react"; // Import a spinner icon

export default function RegisterPage() {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [showCard, setShowCard] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [isError, setIsError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // New loading state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        await loadModels();
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading models:", error);
      }
    };
    load();
  }, []);

  const startFaceDetection = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      console.warn("Video not ready yet, retrying...");
      setTimeout(startFaceDetection, 500);
      return;
    }

    const displaySize = { width: video.videoWidth, height: video.videoHeight };
    faceapi.matchDimensions(canvas, displaySize);

    detectionIntervalRef.current = setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      const resizedDetections = faceapi.resizeResults(detections, displaySize);

      const context = canvas.getContext("2d");
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }

      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 1000);
  }, []);

  const startVideo = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current!.play();
          startFaceDetection();
        };
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
    }
  }, [startFaceDetection]);

  const stopVideo = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop()); // Stop all tracks
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null; // Clear the video source
    }
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current); // Stop face detection
    }
  }, []);

  useEffect(() => {
    if (modelsLoaded) {
      startVideo();
    }
  }, [modelsLoaded, startVideo]);

  useEffect(() => {
    return () => {
      stopVideo(); // Cleanup on unmount
    };
  }, [stopVideo]);

  const captureImage = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!canvasRef.current || !videoRef.current) {
        reject(new Error("Canvas or video element not found"));
        return;
      }

      const canvas = canvasRef.current;
      const video = videoRef.current;

      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to capture image"));
        }
      }, "image/jpeg");
    });
  };

  const handleSubmit = async () => {
    if (!videoRef.current) return;

    const descriptor = await getFaceDescriptor(videoRef.current);
    if (!descriptor) {
      toast.error("No face detected. Try again.");
      setLoading(false); // Stop loading state
      startVideo(); // Restart the camera feed
      return;
    }

    try {
      // Capture the image
      const imageBlob = await captureImage();

      if(imageBlob){
        setLoading(true); // Start loading state
        stopVideo(); // Stop the camera feed
      }

      // Create a FormData object to send the image and other data
      const formData = new FormData();
      formData.append("face_data", JSON.stringify(Array.from(descriptor)));
      formData.append("name", name);
      formData.append("email", email);
      formData.append("image_capture", imageBlob, "capture.jpg");

      // Simulate a 3-second delay for loading state
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Send the data to your backend
      const res = await fetch("/api/users", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setShowMessage("User created successfully");
        setName("");
        setEmail("");
        setUser(data.user);
        setShowCard(true);
      } else {
        setIsError(true);
        setShowMessage(data.message);
      }
    } catch (error) {
      console.error("Error capturing or uploading image:", error);
      toast.error("Failed to capture or upload image.");
    } finally {
      setLoading(false); // Stop loading state
      setTimeout(() => setShowMessage(null), 3000);
      startVideo(); // Restart the camera feed after loading
    }
  };

  return (
    <main className="max-w-full border mx-auto p-20 h-screen">
      <div className="flex flex-col items-center justify-center gap-10">
        <div className="relative w-full max-w-lg">
          {loading ? (
            // Display a professional loading message
            <div className="flex flex-col items-center justify-center h-[480px] bg-gray-100 rounded-lg">
              <Loader2 className="animate-spin h-12 w-12 text-gray-700" />
              <p className="mt-4 text-lg font-semibold text-gray-700">
                Processing your data...
              </p>
            </div>
          ) : (
            // Display the video feed
            <>
              <video
                ref={videoRef}
                className="w-full h-auto"
                width={640}
                height={480}
                autoPlay
                playsInline
                muted
              />
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className="absolute top-0 left-0 w-full h-full z-10"
              />
            </>
          )}
        </div>
        <div className="flex flex-col justify-start mt-4 gap-5 w-full max-w-xl">
          <Input
            type="text"
            placeholder="Name"
            value={name}
            className="w-full"
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            className="w-full"
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            onClick={() => handleSubmit()}
            className="w-full p-10 bg-green-500 hover:bg-green-700 text-lg font-bold"
            disabled={loading} // Disable button while loading
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" /> {/* Spinner icon */}
                <span>Processing...</span> {/* Loading message */}
              </div>
            ) : (
              "Create User"
            )}
          </Button>
        </div>
      </div>
      <div className="col-span-2">
        {showMessage && <SuccessMessage message={showMessage} isError={isError} />}
        {showCard && user && <IdentificationCard user={user} isOpen={showCard} onClose={() => setShowCard(false)} />}
      </div>
    </main>
  );
}