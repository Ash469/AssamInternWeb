import { NextRequest, NextResponse } from "next/server";
import { getSignedUploadUrl, validateUploadFile } from "@/lib/storage";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    const { fileName, fileType, fileSize, userId, district, fullName, name, category } = body;
    const personName = fullName || name;

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: fileName" },
        { status: 400, headers: corsHeaders }
      );
    }

    const type = fileType || "application/octet-stream";

    // Validate file type & size constraints (supports extension fallback)
    const validation = validateUploadFile(type, fileSize, fileName);
    if (!validation.valid) {
      console.warn("[Upload Sign] Validation rejected:", validation.error, { fileName, fileType, fileSize });
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log("[Upload Sign] Generating signed URL for:", {
      fileName,
      resolvedType: validation.resolvedType,
      fileSize,
      userId,
      district,
      personName,
    });

    // Generate signed upload URL organized by applications/district/personName
    const uploadData = await getSignedUploadUrl({
      fileName,
      fileType: validation.resolvedType,
      userId: userId ? String(userId) : undefined,
      district: district ? String(district) : undefined,
      fullName: personName ? String(personName) : undefined,
      category,
      expiresInSeconds: 300, // 5 minutes
    });

    return NextResponse.json(
      {
        success: true,
        data: uploadData,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error generating signed upload URL:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate signed upload URL",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
