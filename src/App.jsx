import React from "react";
import { useState } from "react";
import CanvasEditor from "./components/CanvasEditor";
import ImageUploader from "./components/ImageUploader";

export default function App() {
  const [image, setImage] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white flex flex-col items-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-32 h-32 bg-pink-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-cyan-400 rounded-full blur-2xl animate-bounce"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
            ✨ Anime Avatarify ✨
          </h1>
          <p className="text-lg text-gray-300 font-light tracking-wide">
            Transform your images with magical anime effects
          </p>
        </div>

        {!image ? (
          <ImageUploader setImage={setImage} />
        ) : (
          <CanvasEditor image={image} setImage={setImage} />
        )}
      </div>
    </div>
  );
}

