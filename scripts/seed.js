// scripts/seed.js
// Standalone database seed script - runs purely in terminal, isolated from the web app.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables from .env and .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://Ayush:8002189162@app.7lk3p.mongodb.net/AssamAppIntern";

const DEFAULT_PASSWORD = "Password@123";

async function runSeed() {
  console.log("=================================================");
  console.log("  STARTING LOCAL DATABASE SEED SCRIPT (TERMINAL) ");
  console.log("=================================================");

  const maskedUri = MONGO_URI.replace(/:([^:@]+)@/, ":****@");
  console.log(`Connecting to MongoDB: ${maskedUri}`);

  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB successfully.\n");

  const db = mongoose.connection.db;
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // 1. Clean previous seed data (only removes test seed emails to keep db clean)
  const testAdminEmails = [
    "superadmin@party.org",
    "admin.kamrup@party.org",
    "admin.dibrugarh@party.org",
    "admin.cachar@party.org",
    "admin.nagaon@party.org",
    "admin.jorhat@party.org",
  ];

  const testUserEmails = [
    "rahul.barman@gmail.com",
    "mitali.dutta@gmail.com",
    "deepjyoti.nath@gmail.com",
    "abhijit.paul@gmail.com",
    "hemanta.kalita@gmail.com",
  ];

  await db.collection("superadmins").deleteMany({ email: { $in: testAdminEmails } });
  await db.collection("admins").deleteMany({ email: { $in: testAdminEmails } });
  await db.collection("users").deleteMany({ email: { $in: testUserEmails } });
  await db.collection("applications").deleteMany({ createdBy: { $in: testUserEmails } });

  console.log("Cleaned existing test records.");

  // 2. Super Admin (Central Party High Command)
  const superAdminDoc = await db.collection("superadmins").insertOne({
    name: "Assam Central Committee",
    email: "superadmin@party.org",
    password: hashedPassword,
    contactNumber: "9900112233",
    role: "super_admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const superAdminId = superAdminDoc.insertedId;
  console.log("✓ Created Super Admin: superadmin@party.org");

  // 3. District Admins (5 Districts)
  const districtAdminsData = [
    {
      name: "Bikash Sarma",
      email: "admin.kamrup@party.org",
      contactNumber: "9864012345",
      password: hashedPassword,
      role: "district_admin",
      assignedDistrict: "Kamrup Metropolitan",
      zone: "Guwahati Central",
      createdBy: superAdminId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Pranab Gogoi",
      email: "admin.dibrugarh@party.org",
      contactNumber: "9864023456",
      password: hashedPassword,
      role: "district_admin",
      assignedDistrict: "Dibrugarh",
      zone: "Dibrugarh Town",
      createdBy: superAdminId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Sujit Das",
      email: "admin.cachar@party.org",
      contactNumber: "9864034567",
      password: hashedPassword,
      role: "district_admin",
      assignedDistrict: "Cachar",
      zone: "Silchar",
      createdBy: superAdminId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Rupjyoti Saikia",
      email: "admin.nagaon@party.org",
      contactNumber: "9864045678",
      password: hashedPassword,
      role: "district_admin",
      assignedDistrict: "Nagaon",
      zone: "Nagaon Sadar",
      createdBy: superAdminId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      name: "Ananya Borah",
      email: "admin.jorhat@party.org",
      contactNumber: "9864056789",
      password: hashedPassword,
      role: "district_admin",
      assignedDistrict: "Jorhat",
      zone: "Jorhat West",
      createdBy: superAdminId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const adminInsertRes = await db.collection("admins").insertMany(districtAdminsData);
  const kamrupAdminId = adminInsertRes.insertedIds[0];
  const dibrugarhAdminId = adminInsertRes.insertedIds[1];
  console.log("✓ Created 5 District Admins (Kamrup Metro, Dibrugarh, Cachar, Nagaon, Jorhat)");

  // 4. Citizens / Users (2 Verified, 3 Unverified)
  const usersData = [
    // Verified citizen - Kamrup Metropolitan
    {
      firstName: "Rahul",
      lastName: "Barman",
      contactNumber: "9876543210",
      email: "rahul.barman@gmail.com",
      userId: "rahul_barman",
      password: hashedPassword,
      age: 29,
      gender: "Male",
      district: "Kamrup Metropolitan",
      revenueCircle: "Dispur",
      villageWard: "Ward 32",
      address: "RGB Road, Zoo Tiniali, Guwahati",
      verified: true,
      verificationStatus: "approved",
      verifiedBy: kamrupAdminId,
      verifiedByModel: "Admin",
      verifiedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Verified citizen - Dibrugarh
    {
      firstName: "Mitali",
      lastName: "Dutta",
      contactNumber: "9876543211",
      email: "mitali.dutta@gmail.com",
      userId: "mitali_dutta",
      password: hashedPassword,
      age: 34,
      gender: "Female",
      district: "Dibrugarh",
      revenueCircle: "Dibrugarh West",
      villageWard: "Ward 12",
      address: "Graham Bazar, Dibrugarh",
      verified: true,
      verificationStatus: "approved",
      verifiedBy: dibrugarhAdminId,
      verifiedByModel: "Admin",
      verifiedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Unverified citizen 1 - Kamrup Metropolitan (Pending approval by Kamrup Admin)
    {
      firstName: "Deepjyoti",
      lastName: "Nath",
      contactNumber: "9876543212",
      email: "deepjyoti.nath@gmail.com",
      userId: "deepjyoti_nath",
      password: hashedPassword,
      age: 26,
      gender: "Male",
      district: "Kamrup Metropolitan",
      revenueCircle: "Guwahati",
      villageWard: "Ward 15",
      address: "Chandmari Colony, Guwahati",
      verified: false,
      verificationStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Unverified citizen 2 - Cachar (Pending approval by Cachar Admin)
    {
      firstName: "Abhijit",
      lastName: "Paul",
      contactNumber: "9876543213",
      email: "abhijit.paul@gmail.com",
      userId: "abhijit_paul",
      password: hashedPassword,
      age: 41,
      gender: "Male",
      district: "Cachar",
      revenueCircle: "Silchar",
      villageWard: "Ward 08",
      address: "Tarapur Railway Gate, Silchar",
      verified: false,
      verificationStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    // Unverified citizen 3 - Nagaon (Pending approval by Nagaon Admin)
    {
      firstName: "Hemanta",
      lastName: "Kalita",
      contactNumber: "9876543214",
      email: "hemanta.kalita@gmail.com",
      userId: "hemanta_kalita",
      password: hashedPassword,
      age: 31,
      gender: "Male",
      district: "Nagaon",
      revenueCircle: "Samaguri",
      villageWard: "Village",
      address: "Bhalukmari Gaon, Samaguri",
      verified: false,
      verificationStatus: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const userInsertRes = await db.collection("users").insertMany(usersData);
  const rahulId = userInsertRes.insertedIds[0];
  const mitaliId = userInsertRes.insertedIds[1];
  console.log("✓ Created 5 Citizens (2 Verified, 3 Pending verification)");

  // 5. Grievance / Problem Applications across districts
  const applicationsData = [
    // 1. Kamrup Metro - In Progress
    {
      fullName: "Rahul Barman",
      contactNumber: "9876543210",
      gender: "Male",
      age: 29,
      district: "Kamrup Metropolitan",
      revenueCircle: "Dispur",
      villageWard: "Ward 32",
      specificLocation: "Near Zoo Road Tiniali Flyover",
      category: "Sanitation & Drainage",
      problemTitle: "Severe waterlogging and blocked drain overflow during monsoon",
      description: "The main drain near Zoo Road Tiniali is choked with plastic waste, causing water to flood commercial shops and road during rain.",
      status: "In Progress",
      createdBy: "rahul.barman@gmail.com",
      userId: rahulId,
      adminRemarks: "Inspection completed by Kamrup District municipal squad. Desilting scheduled for Friday.",
      actionTaken: "Pumps deployed to clear stagnant water.",
      reviewedBy: kamrupAdminId,
      reviewedByModel: "Admin",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    // 2. Kamrup Metro - Pending
    {
      fullName: "Rahul Barman",
      contactNumber: "9876543210",
      gender: "Male",
      age: 29,
      district: "Kamrup Metropolitan",
      revenueCircle: "Dispur",
      villageWard: "Ward 28",
      specificLocation: "Bhangagarh Sub-lane 4",
      category: "Roads & Infrastructure",
      problemTitle: "Deep potholes causing daily two-wheeler accidents",
      description: "Road has craters after utility digging 3 weeks ago. Immediate patch repair required.",
      status: "Pending",
      createdBy: "rahul.barman@gmail.com",
      userId: rahulId,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    // 3. Dibrugarh - In Review
    {
      fullName: "Mitali Dutta",
      contactNumber: "9876543211",
      gender: "Female",
      age: 34,
      district: "Dibrugarh",
      revenueCircle: "Dibrugarh West",
      villageWard: "Ward 12",
      specificLocation: "Maijan Riverside Ghat",
      category: "Flood & Disaster Relief",
      problemTitle: "Riverbank erosion threatening 15 residential households",
      description: "Brahmaputra bank erosion has intensified near Maijan. Geo-bags protection needed urgently before upcoming rain spell.",
      status: "In Review",
      createdBy: "mitali.dutta@gmail.com",
      userId: mitaliId,
      reviewedBy: dibrugarhAdminId,
      reviewedByModel: "Admin",
      adminRemarks: "Forwarded to District Disaster Management Authority (DDMA) for spot inspection.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    // 4. Dibrugarh - Resolved
    {
      fullName: "Mitali Dutta",
      contactNumber: "9876543211",
      gender: "Female",
      age: 34,
      district: "Dibrugarh",
      revenueCircle: "Dibrugarh West",
      villageWard: "Ward 05",
      specificLocation: "Chowkidinghee Junction",
      category: "Electricity & Power",
      problemTitle: "Frequent transformer tripping and low voltage issue",
      description: "Low voltage causing damage to appliances across 40 houses in Chowkidinghee area.",
      status: "Resolved",
      createdBy: "mitali.dutta@gmail.com",
      userId: mitaliId,
      reviewedBy: dibrugarhAdminId,
      reviewedByModel: "Admin",
      adminRemarks: "APDCL linesman team replaced the blown 250kVA transformer.",
      actionTaken: "Voltage restored to 230V normal output.",
      resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    // 5. Cachar - Pending
    {
      fullName: "Abhijit Paul",
      contactNumber: "9876543213",
      gender: "Male",
      age: 41,
      district: "Cachar",
      revenueCircle: "Silchar",
      villageWard: "Ward 08",
      specificLocation: "Tarapur Railway Road",
      category: "Drinking Water Supply",
      problemTitle: "Municipal pipeline ruptured, dirty water entering residential taps",
      description: "Water has heavy mud contamination for past 4 days. Drinking water supply disrupted.",
      status: "Pending",
      createdBy: "abhijit.paul@gmail.com",
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    // 6. Nagaon - Action Taken
    {
      fullName: "Hemanta Kalita",
      contactNumber: "9876543214",
      gender: "Male",
      age: 31,
      district: "Nagaon",
      revenueCircle: "Samaguri",
      villageWard: "Village",
      specificLocation: "Bhalukmari Primary Health Center road",
      category: "Healthcare & Hospitals",
      problemTitle: "Ambulance unable to reach PHC due to muddy unpaved track",
      description: "Patients facing serious hardship during emergency transit to the Samaguri PHC.",
      status: "Action Taken",
      createdBy: "hemanta.kalita@gmail.com",
      adminRemarks: "Temporary gravel laying ordered and begun yesterday.",
      actionTaken: "PWD road department assigned work order #NGN-2024-89.",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
    // 7. Jorhat - Pending
    {
      fullName: "Ananya Borah (on behalf of School)",
      contactNumber: "9864056789",
      gender: "Female",
      district: "Jorhat",
      revenueCircle: "Titabar",
      villageWard: "Village",
      specificLocation: "Titabar Block Govt Middle School",
      category: "Education & Schools",
      problemTitle: "Classroom roof leaking and window panes shattered",
      description: "Classes cannot be held during rain in Rooms 3 and 4. Needs urgent renovation fund.",
      status: "Pending",
      createdBy: "titabar.school@gmail.com",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    },
  ];

  await db.collection("applications").insertMany(applicationsData);
  console.log("✓ Created 7 Grievances across districts (Kamrup, Dibrugarh, Cachar, Nagaon, Jorhat)");

  console.log("\n=================================================");
  console.log("       DATABASE SEEDING COMPLETED SUCCESSFULLY   ");
  console.log("=================================================");
  console.log("DEFAULT PASSWORD FOR ALL ACCOUNTS: Password@123\n");
  console.log("👑 SUPER ADMIN:");
  console.log("   • superadmin@party.org (All Assam Scope)\n");
  console.log("🏢 DISTRICT ADMINS:");
  console.log("   • admin.kamrup@party.org     -> Kamrup Metropolitan");
  console.log("   • admin.dibrugarh@party.org  -> Dibrugarh");
  console.log("   • admin.cachar@party.org     -> Cachar");
  console.log("   • admin.nagaon@party.org     -> Nagaon");
  console.log("   • admin.jorhat@party.org     -> Jorhat\n");
  console.log("👥 CITIZENS / USERS:");
  console.log("   • rahul.barman@gmail.com     -> Verified (Kamrup Metro)");
  console.log("   • mitali.dutta@gmail.com     -> Verified (Dibrugarh)");
  console.log("   • deepjyoti.nath@gmail.com   -> Unverified (Kamrup Metro)");
  console.log("   • abhijit.paul@gmail.com     -> Unverified (Cachar)");
  console.log("   • hemanta.kalita@gmail.com   -> Unverified (Nagaon)");
  console.log("=================================================\n");

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB.");
}

runSeed().catch((err) => {
  console.error("Seeding failed with error:", err);
  process.exit(1);
});
