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
        { success: false, error: "Missing required parameter: path" },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanPath = extractStoragePath(rawPath);
    if (!cleanPath) {
      return NextResponse.json(
        { success: false, error: "Invalid storage path" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generate 10-minute (600s) presigned download URL
    const expiresIn = 60 * 10;
    const signedUrl = await createSignedDownloadUrl(cleanPath, expiresIn);

    return NextResponse.json(
      {
        success: true,
        data: {
          signedUrl,
          storagePath: cleanPath,
          expiresInSeconds: expiresIn,
        },
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error generating presigned download URL:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate presigned download URL",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
