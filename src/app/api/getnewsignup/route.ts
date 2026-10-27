import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/user";

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET users or specific user profile
export async function GET(req: Request) {
  await connectDB(); 

  try {
    const url = new URL(req.url);
    const district = url.searchParams.get("district");
    const userId = url.searchParams.get("userId");
    const email = url.searchParams.get("email");

    const filter: any = {};
    if (district) filter.district = district;
    
    if (userId && userId !== "undefined") {
      if (mongoose.Types.ObjectId.isValid(userId)) {
        filter.$or = [{ _id: new mongoose.Types.ObjectId(userId) }, { userId: userId }];
      } else {
        filter.userId = userId;
      }
    }

    if (email && email !== "undefined") {
      filter.email = email.toLowerCase();
    }

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 }); 

    return NextResponse.json({ users }, { 
      status: 200,
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { 
      status: 500,
      headers: corsHeaders
    });
  }
}

// PUT: Update citizen profile details
export async function PUT(req: Request) {
  await connectDB();

  try {
    const body = await req.json();
    const { userId, contactNumber, district, revenueCircle, villageWard, address, age, gender } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required for profile update" }, {
        status: 400,
        headers: corsHeaders
      });
    }

    const query: any = {};
    if (mongoose.Types.ObjectId.isValid(userId)) {
      query.$or = [{ _id: new mongoose.Types.ObjectId(userId) }, { userId: userId }];
    } else {
      query.userId = userId;
    }

    const updateFields: any = {};
    if (contactNumber) updateFields.contactNumber = contactNumber;
    if (district) updateFields.district = district;
    if (revenueCircle !== undefined) updateFields.revenueCircle = revenueCircle;
    if (villageWard !== undefined) updateFields.villageWard = villageWard;
    if (address !== undefined) updateFields.address = address;
    if (age !== undefined) updateFields.age = parseInt(age, 10);
    if (gender !== undefined) updateFields.gender = gender;

    const updatedUser = await User.findOneAndUpdate(
      query,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, {
        status: 400,
        headers: corsHeaders
      });
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: updatedUser
    }, {
      status: 200,
      headers: corsHeaders
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, {
      status: 500,
      headers: corsHeaders
    });
  }
}
