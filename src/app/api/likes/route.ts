import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Path to the file that will store our likes data
const likesFilePath = path.join(process.cwd(), "likes-data.json");

// Initialize the likes file if it doesn't exist
function initLikesFile() {
  if (!fs.existsSync(likesFilePath)) {
    fs.writeFileSync(likesFilePath, JSON.stringify({ totalLikes: 0 }));
  }
}

// Get the current likes from the file
function getLikes() {
  initLikesFile();
  const likesData = fs.readFileSync(likesFilePath, "utf-8");
  return JSON.parse(likesData);
}

// Write likes to the file
function saveLikes(data: any) {
  fs.writeFileSync(likesFilePath, JSON.stringify(data));
}

// GET handler to retrieve the current like count
export async function GET() {
  try {
    const likesData = getLikes();
    return NextResponse.json(likesData);
  } catch (error) {
    console.error("Error getting likes:", error);
    return NextResponse.json({ error: "Failed to get likes" }, { status: 500 });
  }
}

// POST handler to increment the like count
export async function POST(request: NextRequest) {
  try {
    const likesData = getLikes();
    likesData.totalLikes += 1;
    saveLikes(likesData);
    return NextResponse.json(likesData);
  } catch (error) {
    console.error("Error updating likes:", error);
    return NextResponse.json(
      { error: "Failed to update likes" },
      { status: 500 }
    );
  }
}
