"use client";

import { useState, useRef } from "react";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type === "video/mp4") {
      setSelectedFile(file);
      setYoutubeUrl("");
    } else {
      alert("Please select an MP4 file");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleBoxClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 p-8">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Name your creation"
          className="text-2xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 mb-8 bg-transparent border-none outline-none focus:ring-0 w-full"
        />

        {/* File Upload Box */}
        <div
          onClick={handleBoxClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-2xl p-20 text-center cursor-pointer transition-all mb-6 bg-white dark:bg-gray-950 ${
            isDragging
              ? "border-gray-400 dark:border-gray-500"
              : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            {/* File Icon */}
            <div className="w-20 h-20 rounded-2xl border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 flex items-center justify-center relative">
              <svg
                className="w-10 h-10 text-gray-400 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 4v16M17 4v16M3 8h18M3 12h18M3 16h18"
                />
              </svg>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-950 border-2 border-gray-300 dark:border-gray-700 flex items-center justify-center">
                <span className="text-gray-400 dark:text-gray-600 text-xs">+</span>
              </div>
            </div>

            {selectedFile ? (
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Upload file
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Click to browse
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  or drag & drop a file here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* YouTube Link Input */}
        <div className="relative mb-4">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
          </div>
          <input
            type="url"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Paste a video link from YouTube"
            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800"
          />
        </div>
      </div>
    </div>
  );
}
