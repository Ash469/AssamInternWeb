import { Schema, model, models, Document, Types } from "mongoose";
import { ASSAM_DISTRICTS, AssamDistrict } from "@/config/districts";

export type VerificationStatus = "pending" | "approved" | "rejected";

// TypeScript Interface for Citizen / User
export interface IUser extends Document {
  firstName: string;
  middleName?: string;
  lastName: string;
  contactNumber: string;
  email: string;
  userId: string;
  age?: number;
  gender?: "Male" | "Female" | "Other";
  password: string;
  district: AssamDistrict;
  revenueCircle?: string;
  villageWard?: "Village" | "Ward" | string;
  address?: string;
  verified: boolean;
  verificationStatus: VerificationStatus;
  verifiedBy?: Types.ObjectId; 
  verifiedByModel?: "Admin" | "SuperAdmin";
  verifiedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema Definition
const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, required: true, trim: true },
    contactNumber: { 
      type: String, 
      required: true,
      unique: true, 
      trim: true,
      match: [/^\d{10}$/, "Contact number must be exactly 10 digits"]
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    userId: { type: String, required: true, unique: true, trim: true },
    age: { type: Number, min: 18, max: 120 },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    password: { type: String, required: true },
    district: { 
      type: String, 
      required: true, 
      enum: ASSAM_DISTRICTS, 
      index: true 
    },
    revenueCircle: { type: String, trim: true },
    villageWard: { type: String, trim: true },
    address: { type: String, trim: true },
    verified: { type: Boolean, default: false, index: true },
    verificationStatus: { 
      type: String, 
      enum: ["pending", "approved", "rejected"], 
      default: "pending", 
      index: true 
    },
    verifiedBy: { type: Schema.Types.ObjectId, refPath: "verifiedByModel" },
    verifiedByModel: { type: String, enum: ["Admin", "SuperAdmin"] },
    verifiedAt: { type: Date },
    rejectionReason: { type: String, trim: true },
  },
  { timestamps: true }
);
userSchema.index({ district: 1, verificationStatus: 1 });

const User = models.User || model<IUser>("User", userSchema);

export default User;
