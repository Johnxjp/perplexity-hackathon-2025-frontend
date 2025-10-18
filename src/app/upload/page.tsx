"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const BACKEND_URL = "http://localhost:8000";
const SUPABASE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET || "dev";

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = (file: File) => {
    if (file && file.type === "video/mp4") {
      setSelectedFile(file);
      setYoutubeUrl("");
    } else {
      alert("Please select an MP4 file");
    }
  };

  const uploadFileToSupabase = async (file: File) => {
    setIsSubmitting(true);

    try {
      // Upload file to Supabase storage (upsert to replace if exists)
      const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .upload(file.name, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw new Error(`Supabase upload failed: ${error.message}`);
      }

      // Get the public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from(SUPABASE_BUCKET)
        .getPublicUrl(file.name);

      console.log("File uploaded to Supabase:", publicUrl);

      // Try to send to backend, fallback to mock data if backend is unavailable
      try {
        const response = await fetch(`${BACKEND_URL}/upload/file`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            file_path: publicUrl,
            title: title || "Untitled",
          }),
        });

        if (!response.ok) {
          throw new Error("Backend unavailable");
        }

        const backendData = await response.json();
        console.log("Backend response:", backendData);

        // Navigate to project editor using project_id from backend
        const projectId = backendData.project_id || "123";
        router.push(`/project/${projectId}`);
      } catch (backendError) {
        console.log("Backend unavailable, using mock data");
        // Navigate to mock project page
        router.push("/project/123");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "video/mp4") {
        setSelectedFile(file);
        setYoutubeUrl("");
        // Automatically upload the file
        await uploadFileToSupabase(file);
      } else {
        alert("Please select an MP4 file");
      }
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type === "video/mp4") {
        setSelectedFile(file);
        setYoutubeUrl("");
        // Automatically upload the file
        await uploadFileToSupabase(file);
      } else {
        alert("Please select an MP4 file");
      }
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
      // Try to send to backend, fallback to mock data if backend is unavailable
      try {
        const response = await fetch(`${BACKEND_URL}/upload/youtube`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            youtube_url: youtubeUrl,
            title: title || "Untitled",
          }),
        });

        if (!response.ok) {
          throw new Error("Backend unavailable");
        }

        const backendData = await response.json();
        console.log("Backend response:", backendData);

        // Navigate to project editor using project_id from backend
        const projectId = backendData.project_id || "123";
        router.push(`/project/${projectId}`);
      } catch (backendError) {
        console.log("Backend unavailable, using mock data");
        // Navigate to mock project page
        router.push("/project/123");
      }
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
          onClick={!isSubmitting ? handleBoxClick : undefined}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-2xl p-20 text-center transition-all mb-6 bg-white ${
            isDragging
              ? "border-gray-400"
              : "border-gray-200 hover:border-gray-300"
          } ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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

            {isSubmitting ? (
              <div>
                <p className="text-base font-semibold text-gray-900">
                  Uploading...
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Please wait while your file is being uploaded
                </p>
              </div>
            ) : selectedFile ? (
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
