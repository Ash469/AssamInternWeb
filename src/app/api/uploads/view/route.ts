import { NextRequest, NextResponse } from "next/server";
import { createSignedDownloadUrl, extractStoragePath } from "@/lib/supabase-admin";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPath = searchParams.get("path") || searchParams.get("url");

    if (!rawPath) {
      return NextResponse.json(
        { error: "Missing required parameter: path" },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanPath = extractStoragePath(rawPath);
    if (!cleanPath) {
      return NextResponse.json(
        { error: "Invalid storage path" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generate fresh 10-minute presigned download URL for private bucket file
    const signedUrl = await createSignedDownloadUrl(cleanPath, 60 * 10);

    // Redirect browser directly to the authenticated presigned URL
    return NextResponse.redirect(signedUrl, {
      status: 307,
      headers: corsHeaders,
    });
  } catch (error: any) {
    console.error("Error generating presigned download view URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate presigned download URL" },
      { status: 500, headers: corsHeaders }
    );
  }
}
