import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // For demo purposes, always return mock data from public folder
    // In production, you would fetch from your backend based on the id
    const { id } = await params;

    console.log(`Serving mock data for project ${id}`);

    // Read mock data from public folder using Node.js fs
    const filePath = join(process.cwd(), 'public', 'mock_response.json');
    const fileContents = await readFile(filePath, 'utf-8');
    const mockData = JSON.parse(fileContents);

    return NextResponse.json(mockData);
  } catch (error) {
    console.error('Error loading mock data:', error);
    return NextResponse.json(
      { error: 'Failed to load project data' },
      { status: 500 }
    );
  }
}
