# Perplexity Hackathon Frontend

A Next.js 15 application for video processing with automatic transcription and reference hyperlinking. Built for the Perplexity hackathon.

## Features

- 🎥 Video upload (MP4) and YouTube URL support
- 📝 Automatic transcription with clickable timestamps
- 🔗 Smart reference detection and hyperlinking
- 📊 Show notes grouped by type (People, Organizations, Books, etc.)
- 🎨 Resizable video/transcript panes
- ⚡ Real-time processing status with visual feedback
- 💾 Supabase integration for video storage

## Tech Stack

- **Framework**: Next.js 15.5.6 with App Router
- **Runtime**: React 19.1.0
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **Database/Storage**: Supabase
- **Build Tool**: Turbopack
- **Fonts**: Figtree, Nunito Sans (Google Fonts)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v20 or higher
- **npm**: v9 or higher (comes with Node.js)
- **Git**: For cloning the repository

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd perplexity-hackathon-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_SECRET_KEY=your_supabase_anon_key
NEXT_PUBLIC_SUPABASE_BUCKET=your_bucket_name

# Backend API (optional - defaults to localhost:8000)
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**Note**: If you don't have a backend running, the app will automatically fallback to mock data for testing.

### 4. Supabase Setup

If using Supabase for video storage:

1. Create a [Supabase account](https://supabase.com)
2. Create a new project
3. Go to **Storage** → Create a new bucket (e.g., "perplexed" or "dev")
4. Make the bucket public (or configure appropriate policies)
5. Copy your project URL and anon key to `.env.local`

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build production bundle
npm start            # Run production server
npm run lint         # Run ESLint
```

## Project Structure

```
perplexity-hackathon-frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── project/[id]/    # API route for serving mock data
│   │   ├── project/[id]/        # Project viewer page
│   │   ├── upload/              # Upload page
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles
│   └── lib/
│       └── supabase.ts          # Supabase client setup
├── public/
│   ├── mock_response.json       # Mock project data for testing
│   └── yt_video.mp4             # Sample video (if present)
├── CLAUDE.md                    # Claude Code instructions
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## Usage

### Uploading a Video

1. Navigate to `/upload`
2. Either:
   - Drag and drop an MP4 file
   - Click to browse and select an MP4 file
   - Paste a YouTube URL
3. Optionally add a title
4. Watch the processing steps:
   - Uploading Video
   - Chunking Video
   - Transcribing Chunks
   - Searching for References
   - Hyperlinking References
   - Creating New Video
   - Readying
5. You'll be redirected to the project page when complete

### Project Viewer

The project page displays:
- **Video Player**: On the left side with playback controls
- **Show Notes**: Below the video, grouped by type with clickable timestamps
- **Transcript**: On the right side with clickable timestamps
- **Resizable Panes**: Drag the divider between video and transcript to adjust width

### Using Mock Data

For testing without a backend:
1. The app includes a mock data file at `public/mock_response.json`
2. When the backend is unavailable, the app automatically uses this mock data
3. Navigate to `/project/123` to view the mock project directly

## Backend Integration

The frontend expects the backend to provide these endpoints:

### Upload Endpoints

**POST** `/upload/file`

Request:
```json
{
  "video_path": "string (Supabase URL)"
}
```

**POST** `/upload/youtube`

Request:
```json
{
  "youtube_url": "string",
  "title": "string"
}
```

**Upload Response Format:**
```json
{
  "project_id": "string",
  "job_id": "string",
  "status": "PENDING",
  "message": "string"
}
```

**Flow:**
1. Frontend uploads file to Supabase
2. Frontend calls `/upload/file` with Supabase URL
3. Backend returns `project_id`, `job_id`, and initial status
4. Frontend polls `/job/{job_id}` every 2 seconds
5. When `job_status` is "completed", frontend navigates to `/project/{project_id}`

### Job Status Endpoint

**GET** `/job/{job_id}`

**Response Format:**
```json
{
  "job_id": "string",
  "job_status": "pending|processing|completed|failed",
  "progress": 0.0,
  "message": "string"
}
```

The frontend polls this endpoint until `job_status` is "completed" or "failed".

### Project Data Endpoint

**GET** `/project/{id}`

**Response Format:**
```json
{
  "project_id": "string",
  "video_path": "string (URL)",
  "title": "string",
  "transcript": [
    {
      "start_time": 0.0,
      "duration": 0.0,
      "text": "string"
    }
  ],
  "show_notes": [
    {
      "text": "string",
      "url": "string",
      "image_url": "string",
      "type": "person|organisation|book|item|video|article",
      "timestamps": [0.0, 1.0]
    }
  ],
  "timestamps": [0.0]
}
```

## Customization

### Processing Step Durations

Edit `src/app/upload/page.tsx` to adjust processing step durations:

```typescript
const PROCESSING_STEPS: ProcessingStep[] = [
  { message: "Uploading Video", minDuration: 5000, maxDuration: 10000 },
  { message: "Chunking Video", minDuration: 2000, maxDuration: 4000 },
  // ... etc
];
```

### Fonts

To change fonts, edit `src/app/layout.tsx` and update the Google Fonts links in the `<head>` section.

### Theme Colors

Modify `src/app/globals.css` to change the color scheme:

```css
@theme {
  --color-background: 0 0% 100%;
  --color-foreground: 240 10% 3.9%;
}
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:
```bash
PORT=3001 npm run dev
```

### Supabase Upload Errors

- Ensure your bucket is public or has the correct RLS policies
- Check that your environment variables are correctly set
- Verify the bucket name matches your configuration

### Backend Connection Refused

This is expected if the backend isn't running. The app will automatically fallback to mock data. To disable this warning, you can comment out the backend fetch in the upload handlers.

### Build Errors

Clear the Next.js cache and rebuild:
```bash
rm -rf .next
npm run build
```

## Development Tips

- The app uses Next.js 15's new async params API with `React.use()`
- Turbopack is enabled for faster builds and HMR
- TypeScript strict mode is enabled - all types must be properly defined
- Uses App Router (not Pages Router)

## Contributing

When making changes:
1. Follow the existing code style
2. Update TypeScript types as needed
3. Test with both backend and mock data
4. Ensure the build passes: `npm run build`

## License

[Add your license here]

## Support

For issues or questions, please [create an issue](link-to-issues) in the repository.
