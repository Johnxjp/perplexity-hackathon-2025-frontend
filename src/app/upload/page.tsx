"use client";

import { useState, useRef, useEffect } from "react";

const BACKEND_URL = "http://localhost:8000";

type TranscriptSegment = [number, number, string];

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
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

  const handleYoutubeSubmit = async () => {
    if (!youtubeUrl.trim()) {
      alert("Please enter a YouTube URL");
      return;
    }

    setIsSubmitting(true);
    try {
      // Load dummy transcript data
      const transcriptResponse = await fetch("/yt_video_t.json");
      const transcriptData = await transcriptResponse.json();

      // Create dummy response matching backend format
      const dummyResponse = {
        video_url: "/yt_video.mp4",
        transcripts: transcriptData
      };

      console.log("YouTube URL submitted successfully:", dummyResponse);

      // Set video and transcript data
      setVideoUrl(dummyResponse.video_url);
      setTranscript(dummyResponse.transcripts);

      // Switch to editor view
      setShowEditor(true);
    } catch (error) {
      console.error("Error submitting YouTube URL:", error);
      alert("Failed to submit YouTube URL. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleYoutubeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleYoutubeSubmit();
    }
  };

  // Upload View
  if (!showEditor) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto pt-8">
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Name your creation"
            className="text-2xl text-gray-900 placeholder-gray-400 mb-8 bg-transparent border-none outline-none focus:ring-0 w-full"
          />

          {/* File Upload Box */}
          <div
            onClick={handleBoxClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-2xl p-20 text-center cursor-pointer transition-all mb-6 bg-white ${
              isDragging
                ? "border-gray-400"
                : "border-gray-200 hover:border-gray-300"
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
              <div className="w-20 h-20 rounded-2xl border-2 border-gray-300 bg-white flex items-center justify-center relative">
                <svg
                  className="w-10 h-10 text-gray-400"
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
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">+</span>
                </div>
              </div>

              {selectedFile ? (
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-base font-semibold text-gray-900">
                    Upload file
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Click to browse
                  </p>
                  <p className="text-sm text-gray-400">
                    or drag & drop a file here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* YouTube Link Input */}
          <div className="relative mb-4">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
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
              onKeyPress={handleYoutubeKeyPress}
              placeholder="Paste a video link from YouTube"
              disabled={isSubmitting}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>
      </div>
    );
  }

  // Editor View
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">
          {title || "Untitled"}
        </h1>
      </div>

      {/* Main Content: Video + Transcript */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Video */}
        <div className="w-1/2 border-r border-gray-200 p-6 flex flex-col">
          <video
            className="w-full rounded-lg bg-black"
            controls
            src={videoUrl}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Right Side: Transcript */}
        <div className="w-1/2 p-6 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Transcript</h2>
          <div className="space-y-4">
            {transcript.map((segment, index) => {
              const [start, duration, text] = segment;
              return (
                <div
                  key={index}
                  className="p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-gray-500 font-mono min-w-[60px]">
                      {Math.floor(start / 60)}:{String(Math.floor(start % 60)).padStart(2, '0')}
                    </span>
                    <p className="text-sm text-gray-900 leading-relaxed">
                      {text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
