import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { AssamDistrict } from "@/config/districts";

// Categories for Grievances & Applications
export const APPLICATION_CATEGORIES = [
  "Roads & Infrastructure",
  "Drinking Water Supply",
  "Electricity & Power",
  "Flood & Disaster Relief",
  "Healthcare & Hospitals",
  "Education & Schools",
  "Sanitation & Drainage",
  "Public Safety & Police",
  "Welfare Schemes & Pension",
  "Administration & Revenue",
  "Agriculture & Irrigation",
  "Administration",
  "Legal",
  "Business",
  "Disaster Relief",
  "Finance",
  "Education",
  "Others",
] as const;

export const APPLICATION_STATUSES = [
  "Pending",
  "In Review",
  "In Progress",
  "Action Taken",
  "Approved",
  "Resolved",
  "Rejected",
] as const;

export type ApplicationCategory = (typeof APPLICATION_CATEGORIES)[number];
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type AreaType = "Village" | "Ward" | string;
export type GenderType = "Male" | "Female" | "Other";

export interface IApplication extends Document {
  // Citizen Information
  fullName: string;
  age?: number;
  contactNumber: string;
  gender?: GenderType;
  
  // Scoped Location
  district: AssamDistrict | string;
  revenueCircle?: string;
  villageWard?: AreaType;
  specificLocation?: string;

  // Grievance / Problem Details
  category: ApplicationCategory | string;
  problemTitle?: string;
  description?: string;
  remarks?: string;
  documentUrl?: string; // Photos / PDF of the problem
  storagePath?: string; // Internal storage path in Supabase / R2
  
  // Status & Tracking
  status: ApplicationStatus;
  createdBy: string; // User ID / Email of citizen (Must be verified)
  userId?: Types.ObjectId; // Reference to User model

  // Resolution Tracking by District Admin or Super Admin
  reviewedBy?: Types.ObjectId; // Reference to Admin / SuperAdmin
  reviewedByModel?: "Admin" | "SuperAdmin";
  adminRemarks?: string;
  actionTaken?: string;
  resolvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

// Mongoose Schema
const ApplicationSchema = new Schema<IApplication>(
  {
    fullName: { type: String, required: true, trim: true },
    age: { type: Number },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{10}$/, "Invalid contact number format (must be 10 digits)"],
    },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    
    // District is mandatory for district admin scoping
    district: { 
      type: String, 
      required: true, 
      index: true,
      trim: true 
    },
    revenueCircle: { type: String, trim: true },
    villageWard: { type: String, trim: true },
    specificLocation: { type: String, trim: true },

    category: { type: String, required: true, trim: true },
    problemTitle: { type: String, trim: true },
    description: { type: String, trim: true },
    remarks: { type: String, trim: true },
    documentUrl: { type: String, default: "" },
    storagePath: { type: String, default: "" },

    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: "Pending",
      index: true,
    },
    createdBy: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },

    reviewedBy: { type: Schema.Types.ObjectId, refPath: "reviewedByModel" },
    reviewedByModel: { type: String, enum: ["Admin", "SuperAdmin"] },
    adminRemarks: { type: String, trim: true },
    actionTaken: { type: String, trim: true },
    resolvedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound Index: District Admins query applications by their district & status
ApplicationSchema.index({ district: 1, status: 1 });
ApplicationSchema.index({ createdBy: 1, createdAt: -1 });

const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>("Application", ApplicationSchema);

export default Application;
