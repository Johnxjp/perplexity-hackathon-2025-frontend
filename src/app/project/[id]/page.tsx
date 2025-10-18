"use client";

import { useState, useEffect, useRef, use } from "react";

const BACKEND_URL = "http://localhost:8000";

type TranscriptSegment = {
  start_time: number;
  duration: number;
  text: string;
};

type TranscriptArray = [number, number, string];

type ShowNoteType = "person" | "organisation" | "book" | "item" | "video" | "article";

type ShowNote = {
  text: string;
  url: string;
  image_url: string;
  type: ShowNoteType;
  timestamps?: number[];
};

type ProjectData = {
  project_id: string;
  video_path: string;
  transcript: TranscriptSegment[] | TranscriptArray[];
  show_notes: ShowNote[];
  title: string;
  timestamps: number[];
};

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const { id } = use(params);
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [showNotes, setShowNotes] = useState<ShowNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const loadProject = async () => {
      try {
        let response;

        // Try to fetch from backend first, fallback to local API route
        try {
          response = await fetch(`${BACKEND_URL}/project/${id}`);
          if (!response.ok) {
            throw new Error("Backend returned error");
          }
        } catch (backendError) {
          console.log("Backend unavailable, trying local API route...");
          response = await fetch(`/api/project/${id}`);
        }

        if (!response.ok) {
          throw new Error("Failed to fetch project data");
        }

        const data: ProjectData = await response.json();
        console.log("Project data:", data);

        // Check if video_path is a Supabase URL and needs to be downloaded
        let finalVideoUrl = data.video_path;

        if (data.video_path.includes("supabase")) {
          // Download video from Supabase and save locally
          try {
            const videoResponse = await fetch(data.video_path);
            const videoBlob = await videoResponse.blob();
            finalVideoUrl = URL.createObjectURL(videoBlob);
          } catch (error) {
            console.error("Error downloading video from Supabase:", error);
            // Fallback to direct URL if download fails
            finalVideoUrl = data.video_path;
          }
        }

        // Normalize transcript format (handle both array and object formats)
        const normalizedTranscript: TranscriptSegment[] = data.transcript.map((segment) => {
          if (Array.isArray(segment)) {
            return {
              start_time: segment[0],
              duration: segment[1],
              text: segment[2],
            };
          }
          return segment;
        });

        setVideoUrl(finalVideoUrl);
        setTranscript(normalizedTranscript);
        setShowNotes(data.show_notes);
        setTitle(data.title);
      } catch (error) {
        console.error("Error loading project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id]);

  const handleTranscriptClick = (startTime: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = startTime;
      videoRef.current.play();
    }
  };

  const formatTimestamp = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${minutes}:${String(secs).padStart(2, '0')}`;
  };

  // Normalize show note types (handle "people" -> "person" mapping)
  const normalizedShowNotes = showNotes.map((note) => ({
    ...note,
    type: (note.type === "people" ? "person" : note.type) as ShowNoteType,
  }));

  // Group show notes by type
  const groupedShowNotes = normalizedShowNotes.reduce((acc, note) => {
    if (!acc[note.type]) {
      acc[note.type] = [];
    }
    acc[note.type].push(note);
    return acc;
  }, {} as Record<ShowNoteType, ShowNote[]>);

  // Type display names
  const typeDisplayNames: Record<ShowNoteType, string> = {
    person: "People",
    organisation: "Organizations",
    book: "Books",
    item: "Items",
    video: "Videos",
    article: "Articles",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <h1 className="text-xl font-semibold text-gray-900">
          {title || "Untitled"}
        </h1>
      </div>

      {/* Main Content: Video + Transcript */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Side: Video and Show Notes */}
        <div className="w-1/2 border-r border-gray-200 p-6 flex flex-col overflow-y-auto">
          {videoUrl ? (
            <video
              ref={videoRef}
              className="w-full rounded-lg bg-black mb-6"
              controls
              src={videoUrl}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="w-full rounded-lg bg-gray-100 mb-6 flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
              <p className="text-gray-500">Loading video...</p>
            </div>
          )}

          {/* Show Notes Section */}
          {showNotes.length > 0 && (
            <div className="mt-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Show Notes</h2>
              <div className="space-y-6">
                {Object.entries(groupedShowNotes).map(([type, notes]) => (
                  <div key={type}>
                    <h3 className="text-md font-semibold text-gray-700 mb-2">
                      {typeDisplayNames[type as ShowNoteType]}
                    </h3>
                    <ul className="space-y-2">
                      {notes.map((note, index) => (
                        <li key={index} className="text-sm text-gray-900">
                          <div className="flex items-start gap-2">
                            <div className="flex-1">
                              {note.url ? (
                                <a
                                  href={note.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                  {note.text}
                                </a>
                              ) : (
                                <span>{note.text}</span>
                              )}
                            </div>
                            {note.timestamps && note.timestamps.length > 0 && (
                              <div className="flex gap-1 flex-wrap">
                                {note.timestamps.map((timestamp, tsIndex) => (
                                  <button
                                    key={tsIndex}
                                    onClick={() => handleTranscriptClick(timestamp)}
                                    className="text-xs text-gray-600 hover:text-blue-600 hover:underline cursor-pointer px-1 py-0.5 rounded hover:bg-gray-100"
                                    title={`Jump to ${formatTimestamp(timestamp)}`}
                                  >
                                    [{formatTimestamp(timestamp)}]
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Transcript */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="px-6 pt-6 pb-4 flex-shrink-0">
            <h2 className="text-lg font-semibold text-gray-900">Transcript</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-4">
              {transcript.map((segment, index) => {
                const { start_time, duration, text } = segment;
                return (
                  <div
                    key={index}
                    onClick={() => handleTranscriptClick(start_time)}
                    className="p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-gray-500 font-mono min-w-[60px]">
                        {Math.floor(start_time / 60)}:{String(Math.floor(start_time % 60)).padStart(2, '0')}
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
    </div>
  );
}
