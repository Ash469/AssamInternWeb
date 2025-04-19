import { createApplication, getApplications, updateApplicationStatus } from "@/controllers/applications_controller";
import { NextRequest, NextResponse } from "next/server";

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true',
};

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: corsHeaders,
  });
}

// POST request
export const POST = async (req: NextRequest) => {
  return await createApplication(req);
};

// GET request
export const GET = async (req: NextRequest) => {
  return await getApplications(req);
};

// PUT request for status update
export const PUT = async (req: NextRequest) => {
  return await updateApplicationStatus(req);
};
