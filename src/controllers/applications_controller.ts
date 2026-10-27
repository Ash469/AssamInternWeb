import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Application from "@/models/application_model";
import User from "@/models/user";
import { createSignedDownloadUrl, extractStoragePath } from "@/lib/supabase-admin";

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// Handle CORS Preflight Requests
const handleOptionsRequest = () =>
  new NextResponse(null, { status: 204, headers: corsHeaders });

// Create Application
export const createApplication = async (req: NextRequest): Promise<NextResponse> => {
  if (req.method === "OPTIONS") return handleOptionsRequest();

  try {
    await connectDB();

    const body = await req.json();
    console.log("Received application payload:", JSON.stringify(body));

    // Validate required fields
    const {
      fullName,
      age,
      contactNumber,
      gender,
      district,
      revenueCircle,
      category,
      villageWard,
      specificLocation,
      problemTitle,
      description,
      remarks,
      documentUrl,
      storagePath,
      createdBy, // Added field for tracking who created the application
    } = body;

    // Log the extracted createdBy field
    console.log("Extracted createdBy:", createdBy);

    // Check each required field individually and log if missing
    const missingFields = [];
    if (!fullName) missingFields.push('fullName');
    if (!age) missingFields.push('age');
    if (!contactNumber) missingFields.push('contactNumber');
    if (!gender) missingFields.push('gender');
    if (!district) missingFields.push('district');
    if (!revenueCircle) missingFields.push('revenueCircle');
    if (!category) missingFields.push('category');
    if (!villageWard) missingFields.push('villageWard');
    if (!createdBy) missingFields.push('createdBy');

    if (missingFields.length > 0) {
      console.log("Missing required fields:", missingFields);
      return NextResponse.json(
        { 
          error: "Missing required fields", 
          missingFields: missingFields 
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if citizen user exists and is verified by District Admin
    const userConditions: any[] = [
      { userId: String(createdBy) },
      { contactNumber: String(contactNumber) },
    ];
    if (mongoose.Types.ObjectId.isValid(String(createdBy))) {
      userConditions.push({ _id: new mongoose.Types.ObjectId(String(createdBy)) });
    }

    const citizenUser = await User.findOne({ $or: userConditions });
    if (citizenUser && !citizenUser.verified) {
      return NextResponse.json(
        {
          error: `Account not verified. Your account is currently pending verification by the ${citizenUser.district || district} District Admin. You will be able to submit applications once verified.`,
          verificationStatus: citizenUser.verificationStatus || "pending",
        },
        { status: 403, headers: corsHeaders }
      );
    }

    // Clean relative path to store in MongoDB (never store temporary signed URLs or public URLs)
    const cleanRelativePath = storagePath
      ? extractStoragePath(storagePath)
      : (documentUrl ? extractStoragePath(documentUrl) : "");

    // Create application
    const newApplication = await Application.create({
      fullName,
      age,
      contactNumber,
      gender,
      district,
      revenueCircle,
      category,
      villageWard,
      specificLocation,
      problemTitle: problemTitle || (remarks ? remarks.substring(0, 60) : `${category} Request`),
      description: description || remarks,
      remarks,
      documentUrl: cleanRelativePath, // Relative path stored
      storagePath: cleanRelativePath, // Relative path stored
      createdBy: createdBy.toString(), // Ensure createdBy is stored as string
      userId: citizenUser?._id,
    });

    return NextResponse.json(
      { message: "Application submitted successfully", data: newApplication },
      { status: 201, headers: corsHeaders }
    );
  } catch (error) {
    console.error("Application creation error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
};

/**
 * Generates an ephemeral 10-minute presigned download URL for private files
 * before sending to user or admin, keeping MongoDB storagePath permanent and private.
 */
const enrichWithSignedDownloadUrl = async (appDoc: any) => {
  const app = appDoc.toObject ? appDoc.toObject() : { ...appDoc };
  const rawPath = app.storagePath || app.documentUrl;

  if (rawPath && typeof rawPath === "string" && rawPath.trim()) {
    const cleanPath = extractStoragePath(rawPath);
    if (cleanPath) {
      try {
        // Generate 10-minute presigned download URL (60 * 10 seconds)
        const signedUrl = await createSignedDownloadUrl(cleanPath, 60 * 10);
        app.documentUrl = signedUrl;
      } catch (err) {
        console.warn(`Failed to generate signed download URL for "${cleanPath}":`, err);
        app.documentUrl = `/api/uploads/view?path=${encodeURIComponent(cleanPath)}`;
      }
    }
  }
  return app;
};

// Get All Applications
export const getApplications = async (req: NextRequest): Promise<NextResponse> => {
  if (req.method === "OPTIONS") return handleOptionsRequest();

  try {
    await connectDB();

    const url = new URL(req.url);
    const district = url.searchParams.get('district');
    const filter = district ? { district } : {};

    const applications = await Application.find(filter).sort({ createdAt: -1 });
    const enrichedApplications = await Promise.all(applications.map(enrichWithSignedDownloadUrl));

    return NextResponse.json(
      { data: enrichedApplications },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
};

// Get Applications by UserId
export const getApplicationsByUserId = async (req: NextRequest): Promise<NextResponse> => {
  if (req.method === "OPTIONS") return handleOptionsRequest();

  try {
    await connectDB();

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const email = url.searchParams.get('email');
    const contact = url.searchParams.get('contact');
    const name = url.searchParams.get('name');

    const orConditions: any[] = [];

    if (userId && userId !== 'undefined' && userId !== 'null') {
      orConditions.push({ createdBy: userId });
      orConditions.push({ createdBy: userId.toString() });
      if (mongoose.Types.ObjectId.isValid(userId)) {
        orConditions.push({ userId: new mongoose.Types.ObjectId(userId) });
      }
    }

    if (email && email !== 'undefined' && email !== 'null') {
      orConditions.push({ createdBy: email });
      orConditions.push({ createdBy: email.toLowerCase() });
    }

    if (contact && contact !== 'undefined' && contact !== 'null') {
      orConditions.push({ contactNumber: contact });
      orConditions.push({ createdBy: contact });
    }

    if (name && name !== 'undefined' && name !== 'null') {
      orConditions.push({ fullName: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    }

    if (orConditions.length === 0) {
      return NextResponse.json(
        { error: "User identifier (userId, email, contact, or name) is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    const applications = await Application.find({ $or: orConditions }).sort({ createdAt: -1 });
    const enrichedApplications = await Promise.all(applications.map(enrichWithSignedDownloadUrl));

    return NextResponse.json(
      { data: enrichedApplications },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
};

// Update Application Status
export const updateApplicationStatus = async (req: NextRequest): Promise<NextResponse> => {
  if (req.method === "OPTIONS") return handleOptionsRequest();

  try {
    await connectDB();

    const body = await req.json();
    const applicationId = body.applicationId || body.id;
    const status = body.status;

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: "Application ID and status are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Update status
    const updateData: any = { status };
    if (body.adminRemarks) updateData.adminRemarks = body.adminRemarks;
    if (body.actionTaken) updateData.actionTaken = body.actionTaken;
    if (status === "Resolved" || status === "Approved") {
      updateData.resolvedAt = new Date();
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      updateData,
      { new: true }
    );

    if (!updatedApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { message: "Status updated successfully", data: updatedApplication },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
};

// Get Single Application By ID
export const getApplicationById = async (
  req: NextRequest,
  id: string
): Promise<NextResponse> => {
  if (req.method === "OPTIONS") return handleOptionsRequest();

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID format" },
        { status: 400, headers: corsHeaders }
      );
    }

    await connectDB();
    const application = await Application.findById(id);

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const enrichedApplication = await enrichWithSignedDownloadUrl(application);

    return NextResponse.json(
      { success: true, data: enrichedApplication },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
};

// Update Application By ID
export const updateApplicationById = async (
  req: NextRequest,
  id: string
): Promise<NextResponse> => {
  if (req.method === "OPTIONS") return handleOptionsRequest();

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID format" },
        { status: 400, headers: corsHeaders }
      );
    }

    await connectDB();
    const body = await req.json();

    const allowedUpdates = [
      "status",
      "adminRemarks",
      "actionTaken",
      "documentUrl",
      "remarks",
      "category",
      "district",
      "revenueCircle",
      "villageWard",
      "specificLocation",
      "reviewedBy",
      "reviewedByModel",
    ];

    const updatePayload: Record<string, any> = {};
    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updatePayload[key] = body[key];
      }
    }

    if (body.status === "Resolved" || body.status === "Approved") {
      updatePayload.resolvedAt = new Date();
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      updatePayload,
      { new: true }
    );

    if (!updatedApplication) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Application updated successfully", data: updatedApplication },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
};

// Delete Application By ID
export const deleteApplicationById = async (
  req: NextRequest,
  id: string
): Promise<NextResponse> => {
  if (req.method === "OPTIONS") return handleOptionsRequest();

  try {
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid application ID format" },
        { status: 400, headers: corsHeaders }
      );
    }

    await connectDB();
    const deleted = await Application.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Application deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
};

