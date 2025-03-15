
"use client"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const HomePage = () => {
  const router = useRouter();

  const handleRegister = () => {
    router.push("/register");
  };

  
  const handleRetrieveInfo = () => {
    router.push("/retrieve-info");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Welcome to Image Capture</h1>
      <div className="space-x-4">
        <Button onClick={handleRegister} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md">
          Register
        </Button>
        <Button onClick={handleRetrieveInfo} className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md">
          Retrieve Information
        </Button>
      </div>
    </div>
  );
};

export default HomePage;