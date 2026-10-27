import { Schema, model, models, Document } from "mongoose";

export interface ISuperAdmin extends Document {
  name: string;
  email: string;
  password: string; // Hashed password
  contactNumber?: string;
  role: "super_admin";
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const superAdminSchema = new Schema<ISuperAdmin>(
  {
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true 
    },
    password: { type: String, required: true },
    contactNumber: { type: String, trim: true },
    role: { type: String, default: "super_admin", immutable: true },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

const SuperAdmin = models.SuperAdmin || model<ISuperAdmin>("SuperAdmin", superAdminSchema);

export default SuperAdmin;
