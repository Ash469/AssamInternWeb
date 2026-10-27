import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import SuperAdmin from "@/models/superAdmin";
import Admin from "@/models/admin";

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET() {
  return NextResponse.json({ 
    status: "Admin auth server is running",
    timestamp: new Date().toISOString()
  }, { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username/Email and password are required" },
        { status: 400 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret_assam_portal_2025";
    const cleanUsername = username.trim().toLowerCase();

    await connectDB();

    // 1. Check SuperAdmin table
    const superAdmin = await SuperAdmin.findOne({ email: cleanUsername });
    if (superAdmin) {
      if (!superAdmin.isActive) {
        return NextResponse.json(
          { error: "This Super Admin account is deactivated." },
          { status: 403 }
        );
      }

      const isMatch = await bcrypt.compare(password, superAdmin.password);
      if (isMatch) {
        // Update last login
        await SuperAdmin.findByIdAndUpdate(superAdmin._id, { lastLogin: new Date() });

        const payload = {
          id: superAdmin._id,
          role: "super_admin",
          email: superAdmin.email,
          name: superAdmin.name,
          scope: "all",
        };

        const token = jwt.sign(payload, jwtSecret, { expiresIn: "7d" });

        return NextResponse.json(
          {
            message: "Super Admin login successful",
            token,
            admin: {
              id: superAdmin._id,
              name: superAdmin.name,
              email: superAdmin.email,
              role: "super_admin",
              assignedDistrict: null,
            },
          },
          { status: 200 }
        );
      }
    }

    // 2. Check District Admin table
    const districtAdmin = await Admin.findOne({ email: cleanUsername });
    if (districtAdmin) {
      if (!districtAdmin.isActive) {
        return NextResponse.json(
          { error: "This District Admin account has been deactivated." },
          { status: 403 }
        );
      }

      const isMatch = await bcrypt.compare(password, districtAdmin.password);
      if (isMatch) {
        // Update last login
        await Admin.findByIdAndUpdate(districtAdmin._id, { lastLogin: new Date() });

        const payload = {
          id: districtAdmin._id,
          role: "district_admin",
          email: districtAdmin.email,
          name: districtAdmin.name,
          assignedDistrict: districtAdmin.assignedDistrict,
          zone: districtAdmin.zone,
        };

        const token = jwt.sign(payload, jwtSecret, { expiresIn: "7d" });

        return NextResponse.json(
          {
            message: "District Admin login successful",
            token,
            admin: {
              id: districtAdmin._id,
              name: districtAdmin.name,
              email: districtAdmin.email,
              role: "district_admin",
              assignedDistrict: districtAdmin.assignedDistrict,
              zone: districtAdmin.zone,
            },
          },
          { status: 200 }
        );
      }
    }

    // 3. Fallback: Environment variable admin (legacy support)
    const envAdminUser = process.env.ADMIN_USERNAME;
    const envAdminPass = process.env.ADMIN_PASSWORD;

    if (envAdminUser && envAdminPass && username === envAdminUser && password === envAdminPass) {
      const token = jwt.sign({ role: "super_admin", username: envAdminUser }, jwtSecret, {
        expiresIn: "7d",
      });

      return NextResponse.json(
        {
          message: "Login successful (Env Admin)",
          token,
          admin: {
            name: "Master Admin",
            email: envAdminUser,
            role: "super_admin",
            assignedDistrict: null,
          },
        },
        { status: 200 }
      );
    }

    // Invalid credentials
    return NextResponse.json(
      { error: "Invalid email/username or password" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
