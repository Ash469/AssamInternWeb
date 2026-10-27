import { NextRequest, NextResponse } from "next/server";
import { verifyAndResolveFile } from "@/lib/storage";
import { connectDB } from "@/lib/db";
import Application from "@/models/application_model";
import mongoose from "mongoose";

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
    const { storagePath, applicationId } = body;

    if (!storagePath) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: storagePath" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Verify file existence in storage
    const verification = await verifyAndResolveFile(storagePath);

    // If an applicationId is provided, associate this file with the MongoDB Application
    let updatedApplication = null;
    if (applicationId && mongoose.Types.ObjectId.isValid(applicationId)) {
      await connectDB();
      updatedApplication = await Application.findByIdAndUpdate(
        applicationId,
        {
          documentUrl: storagePath,
          storagePath: storagePath,
        },
        { new: true }
      );
    }

    return NextResponse.json(
      {
        success: true,
        verified: verification.exists,
        storagePath,
        application: updatedApplication,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Error in upload complete verification:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to complete and verify upload",
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
