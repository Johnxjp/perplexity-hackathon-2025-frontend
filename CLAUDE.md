# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application for a Perplexity hackathon, built with:
- Next.js 15.5.6 with Turbopack
- React 19.1.0
- TypeScript (strict mode enabled)
- Tailwind CSS v4
- App Router architecture

## Development Commands

### Running the Application
```bash
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Build production bundle with Turbopack
npm start            # Run production server
npm run lint         # Run ESLint
```

## Architecture

### Directory Structure
- `src/app/` - App Router pages and layouts (Next.js 13+ convention)
  - `layout.tsx` - Root layout with Geist fonts (Sans and Mono)
  - `page.tsx` - Home page component
  - `globals.css` - Global styles with Tailwind v4 imports
- `public/` - Static assets

### Path Aliases
- `@/*` maps to `./src/*` (configured in tsconfig.json:22)

### Styling
- Uses Tailwind CSS v4 with inline theme configuration in globals.css
- CSS variables define light/dark mode colors (--background, --foreground)
- Geist font family loaded via next/font/google
- Dark mode via `prefers-color-scheme` media query

### TypeScript Configuration
- Strict mode enabled
- Target: ES2017
- Module resolution: bundler
- JSX: preserve (handled by Next.js)

### Build Tool
- Turbopack is enabled for both dev and build (--turbopack flag)
- This provides faster builds and hot module replacement

### ESLint Configuration
- Uses Next.js recommended configs: "next/core-web-vitals" and "next/typescript"
- Ignores: node_modules, .next, out, build directories
