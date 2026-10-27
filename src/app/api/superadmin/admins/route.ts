import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/models/admin";
import SuperAdmin from "@/models/superAdmin";

// GET: Fetch all District Admins
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const admins = await Admin.find()
      .select("-password")
      .sort({ assignedDistrict: 1, createdAt: -1 });

    return NextResponse.json({ success: true, admins }, { status: 200 });
  } catch (error) {
    console.error("Error fetching district admins:", error);
    return NextResponse.json(
      { error: "Failed to fetch district admins", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST: Create a new District Admin
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { name, email, contactNumber, password, assignedDistrict, zone, createdBy } = body;

    // Validate inputs
    if (!name || !email || !contactNumber || !password || !assignedDistrict) {
      return NextResponse.json(
        { error: "Name, email, contact number, password, and assigned district are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists in Admin or SuperAdmin
    const existingAdmin = await Admin.findOne({ email: cleanEmail });
    const existingSuper = await SuperAdmin.findOne({ email: cleanEmail });

    if (existingAdmin || existingSuper) {
      return NextResponse.json(
        { error: "An admin account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      name: name.trim(),
      email: cleanEmail,
      contactNumber: contactNumber.trim(),
      password: hashedPassword,
      role: "district_admin",
      assignedDistrict,
      zone: zone?.trim() || "",
      createdBy: createdBy || null,
      isActive: true,
    });

    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    return NextResponse.json(
      {
        success: true,
        message: `District Admin created successfully for ${assignedDistrict}`,
        admin: adminResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating district admin:", error);
    return NextResponse.json(
      { error: "Failed to create district admin", details: (error as Error).message },
      { status: 500 }
    );
  }
}

// PATCH: Toggle active status or update admin
export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { adminId, isActive, zone } = body;

    if (!adminId) {
      return NextResponse.json({ error: "Admin ID is required" }, { status: 400 });
    }

    const updateFields: Record<string, any> = {};
    if (typeof isActive === "boolean") updateFields.isActive = isActive;
    if (zone !== undefined) updateFields.zone = zone;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      adminId,
      { $set: updateFields },
      { new: true }
    ).select("-password");

    if (!updatedAdmin) {
      return NextResponse.json({ error: "District Admin not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        message: `Admin ${updatedAdmin.name} ${updatedAdmin.isActive ? "activated" : "deactivated"} successfully.`,
        admin: updatedAdmin,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating district admin:", error);
    return NextResponse.json(
      { error: "Failed to update district admin", details: (error as Error).message },
      { status: 500 }
    );
  }
}
