import { Schema, model, models, Document, Types } from "mongoose";
import { ASSAM_DISTRICTS, AssamDistrict } from "@/config/districts";

export interface IAdmin extends Document {
  name: string;
  email: string;
  contactNumber: string;
  password: string; // Hashed password
  role: "district_admin";
  assignedDistrict: AssamDistrict;
  zone?: string; 
  createdBy?: Types.ObjectId; 
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    contactNumber: { 
      type: String, 
      required: true, 
      trim: true,
      match: [/^\d{10}$/, "Contact number must be exactly 10 digits"]
    },
    password: { type: String, required: true },
    role: { type: String, default: "district_admin", immutable: true },
    assignedDistrict: { 
      type: String, 
      required: true, 
      enum: ASSAM_DISTRICTS,
      index: true 
    },
    zone: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "SuperAdmin" },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

// Compound index for querying district admins efficiently
adminSchema.index({ assignedDistrict: 1, isActive: 1 });

const Admin = models.Admin || model<IAdmin>("Admin", adminSchema);

export default Admin;
