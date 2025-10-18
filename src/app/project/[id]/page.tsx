"use client";

import { useState, useEffect, useRef } from "react";

type TranscriptSegment = [number, number, string];

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Load project data
    const loadProject = async () => {
      try {
        // For now, load dummy data
        const transcriptResponse = await fetch("/yt_video_t.json");
        const transcriptData = await transcriptResponse.json();

        // Set dummy data
        setVideoUrl("/yt_video.mp4");
        setTranscript(transcriptData);
        setTitle("Untitled");
      } catch (error) {
        console.error("Error loading project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [params.id]);

  const handleTranscriptClick = (startTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

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
            ref={videoRef}
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
                  onClick={() => handleTranscriptClick(start)}
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
