import { NextRequest, NextResponse } from "next/server";
import {
  getApplicationById,
  updateApplicationById,
  deleteApplicationById,
} from "@/controllers/applications_controller";

// CORS Headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET /api/applications/[id]
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    return await getApplicationById(req, id);
  } catch (error) {
    console.error("Error in GET /api/applications/[id]:", error);
    return NextResponse.json(
      { error: "API route error", details: (error as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT /api/applications/[id]
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    return await updateApplicationById(req, id);
  } catch (error) {
    console.error("Error in PUT /api/applications/[id]:", error);
    return NextResponse.json(
      { error: "API route error", details: (error as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// PATCH /api/applications/[id]
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    return await updateApplicationById(req, id);
  } catch (error) {
    console.error("Error in PATCH /api/applications/[id]:", error);
    return NextResponse.json(
      { error: "API route error", details: (error as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE /api/applications/[id]
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const { id } = params;
    return await deleteApplicationById(req, id);
  } catch (error) {
    console.error("Error in DELETE /api/applications/[id]:", error);
    return NextResponse.json(
      { error: "API route error", details: (error as Error).message },
      { status: 500, headers: corsHeaders }
    );
  }
}
