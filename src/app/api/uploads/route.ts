import { NextRequest, NextResponse } from "next/server";
import { uploadBufferDirect } from "@/lib/supabase-admin";
import { generateStoragePath, validateUploadFile } from "@/lib/storage";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const userId = (formData.get("userId") as string) || "guest";
    const district = (formData.get("district") as string) || "";
    const fullName =
      (formData.get("fullName") as string) ||
      (formData.get("name") as string) ||
      "";
    const category = (formData.get("category") as string) || "General";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided in form data" },
        { status: 400, headers: corsHeaders }
      );
    }

    const validation = validateUploadFile(file.type, file.size, file.name);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400, headers: corsHeaders }
      );
    }

    const storagePath = generateStoragePath({
      fileName: file.name,
      district,
      fullName,
      userId,
      folder: "applications",
    });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadBufferDirect(
      storagePath,
      buffer,
      validation.resolvedType
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Direct server upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to upload file to storage",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
