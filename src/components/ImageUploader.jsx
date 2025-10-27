import React, { useRef, useState } from "react";

export default function ImageUploader({ setImage }) {
    const inputRef = useRef();
    const [isDragging, setIsDragging] = useState(false);

    const handleUpload = (file) => {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setImage(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        handleUpload(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleUpload(file);
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            {/* Drag and Drop Area */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative group cursor-pointer transition-all duration-300 ${
                    isDragging ? 'scale-105' : 'hover:scale-102'
                }`}
                onClick={() => inputRef.current.click()}
            >
                <div className={`w-80 h-60 rounded-2xl border-2 border-dashed transition-all duration-300 ${
                    isDragging 
                        ? 'border-pink-400 bg-pink-500/10' 
                        : 'border-purple-400/50 bg-white/5 hover:bg-white/10 hover:border-pink-400/70'
                } backdrop-blur-lg flex flex-col items-center justify-center space-y-4`}>
                    
                    {/* Upload Icon */}
                    <div className="text-6xl animate-bounce">
                        {isDragging ? '✨' : '🎨'}
                    </div>
                    
                    {/* Text */}
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                            {isDragging ? 'Drop your image here!' : 'Upload Your Image'}
                        </h3>
                        <p className="text-sm text-gray-300">
                            Drag & drop or click to browse
                        </p>
                        <p className="text-xs text-gray-400">
                            Supports JPG, PNG, GIF
                        </p>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-4 right-4 text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                        🌟
                    </div>
                    <div className="absolute bottom-4 left-4 text-2xl opacity-50 group-hover:opacity-100 transition-opacity">
                        💫
                    </div>
                </div>
            </div>

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
            />

            {/* Alternative upload button */}
            <button
                onClick={() => inputRef.current.click()}
                className="group relative px-8 py-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
                <span className="relative z-10 font-semibold text-white flex items-center space-x-2">
                    <span>🎭</span>
                    <span>Choose Image</span>
                </span>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
            </button>
        </div>
    );
}
