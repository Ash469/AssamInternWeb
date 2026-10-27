"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import {
  FaUserShield,
  FaUsers,
  FaClipboardList,
  FaBuilding,
  FaPlus,
  FaCheckCircle,
  FaTimesCircle,
  FaToggleOn,
  FaToggleOff,
  FaSync,
  FaFilter,
  FaSignOutAlt,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaSearch,
  FaCheck,
  FaTimes,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { ASSAM_DISTRICTS, AssamDistrict } from "@/config/districts";

interface DistrictAdmin {
  _id: string;
  name: string;
  email: string;
  contactNumber: string;
  assignedDistrict: string;
  zone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface Application {
  _id: string;
  fullName: string;
  contactNumber: string;
  district: string;
  category: string;
  problemTitle?: string;
  description?: string;
  status: string;
  adminRemarks?: string;
  actionTaken?: string;
  createdAt: string;
}

interface CitizenUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  userId: string;
  district: string;
  verified: boolean;
  verificationStatus: string;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "admins" | "grievances" | "citizens">("overview");

  // Auth state
  const [superAdminData, setSuperAdminData] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Data states
  const [districtAdmins, setDistrictAdmins] = useState<DistrictAdmin[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [citizens, setCitizens] = useState<CitizenUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isError: boolean } | null>(null);

  // Filters
  const [selectedDistrictFilter, setSelectedDistrictFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Create Admin Modal State
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    name: "",
    email: "",
    contactNumber: "",
    password: "",
    assignedDistrict: ASSAM_DISTRICTS[0] as string,
    zone: "",
  });
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Application Resolution Modal State
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [newAppStatus, setNewAppStatus] = useState("In Progress");
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingApp, setUpdatingApp] = useState(false);

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = () => {
    const userDataStr = localStorage.getItem("userData");
    if (!userDataStr) {
      router.push("/");
      return;
    }

    try {
      const parsed = JSON.parse(userDataStr);
      if (parsed.role !== "super_admin") {
        alert("Access Denied: Only Central Super Administrators are authorized here.");
        router.push("/admin/dashboard");
        return;
      }

      setSuperAdminData(parsed);
      setIsAuthorized(true);
      fetchAllSuperAdminData();
    } catch {
      router.push("/");
    }
  };

  const fetchAllSuperAdminData = async () => {
    setLoading(true);
    try {
      const [adminsRes, appsRes, citizensRes] = await Promise.all([
        axios.get("/api/superadmin/admins"),
        axios.get("/api/applications"),
        axios.get("/api/getnewsignup"),
      ]);

      setDistrictAdmins(adminsRes.data.admins || []);
      setApplications(appsRes.data.data || []);
      setCitizens(citizensRes.data.users || []);
    } catch (err) {
      console.error("Failed to fetch superadmin data:", err);
      showFeedback("Failed to load command center data", true);
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (text: string, isError = false) => {
    setFeedbackMsg({ text, isError });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("adminToken");
    router.push("/");
  };

  // Toggle District Admin Active Status
  const handleToggleAdminStatus = async (adminId: string, currentStatus: boolean) => {
    try {
      const res = await axios.patch("/api/superadmin/admins", {
        adminId,
        isActive: !currentStatus,
      });

      showFeedback(res.data.message || "Admin status updated");
      setDistrictAdmins((prev) =>
        prev.map((a) => (a._id === adminId ? { ...a, isActive: !currentStatus } : a))
      );
    } catch (err: any) {
      showFeedback(err.response?.data?.error || "Failed to update status", true);
    }
  };

  // Create New District Admin
  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAdmin(true);
    try {
      const res = await axios.post("/api/superadmin/admins", {
        ...newAdminForm,
        createdBy: superAdminData?.id,
      });

      showFeedback(res.data.message || "District Admin created successfully!");
      setShowCreateAdminModal(false);
      setNewAdminForm({
        name: "",
        email: "",
        contactNumber: "",
        password: "",
        assignedDistrict: ASSAM_DISTRICTS[0],
        zone: "",
      });
      fetchAllSuperAdminData();
    } catch (err: any) {
      showFeedback(err.response?.data?.error || "Failed to create district admin", true);
    } finally {
      setCreatingAdmin(false);
    }
  };

  // Super Admin Override: Approve Citizen User
  const handleApproveCitizen = async (citizenId: string) => {
    try {
      const res = await axios.patch("/api/approve", { _id: citizenId });
      showFeedback("Citizen approved successfully by Super Admin!");
      setCitizens((prev) =>
        prev.map((c) => (c._id === citizenId ? { ...c, verified: true, verificationStatus: "approved" } : c))
      );
    } catch {
      showFeedback("Failed to approve citizen", true);
    }
  };

  // Super Admin Override: Update Application Status
  const handleUpdateApplicationStatus = async () => {
    if (!selectedApp) return;
    setUpdatingApp(true);
    try {
      await axios.put("/api/applications", {
        applicationId: selectedApp._id,
        status: newAppStatus,
      });

      showFeedback(`Grievance status updated to "${newAppStatus}"`);
      setSelectedApp(null);
      fetchAllSuperAdminData();
    } catch {
      showFeedback("Failed to update grievance", true);
    } finally {
      setUpdatingApp(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-teal-400">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Filtered lists
  const filteredApplications = applications.filter((app) => {
    const matchesDistrict = selectedDistrictFilter === "all" || app.district === selectedDistrictFilter;
    const matchesSearch =
      !searchTerm ||
      app.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.problemTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  const filteredCitizens = citizens.filter((citizen) => {
    const matchesDistrict = selectedDistrictFilter === "all" || citizen.district === selectedDistrictFilter;
    const matchesSearch =
      !searchTerm ||
      citizen.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      citizen.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      citizen.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDistrict && matchesSearch;
  });

  // Calculate Metrics
  const totalVerifiedCitizens = citizens.filter((c) => c.verified).length;
  const totalPendingCitizens = citizens.filter((c) => !c.verified).length;
  const totalResolvedGrievances = applications.filter((a) => a.status === "Resolved" || a.status === "Approved").length;
  const totalPendingGrievances = applications.filter((a) => a.status === "Pending").length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Clean Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-40">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              ★
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                  Super Admin
                </span>
                <span className="text-slate-500 text-xs">All Assam Scope</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Central Administrator Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800">{superAdminData?.name || "Central Administrator"}</p>
              <p className="text-xs text-slate-500 font-mono">{superAdminData?.username}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <FaSignOutAlt />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Notification Toast */}
      {feedbackMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-3 border ${
            feedbackMsg.isError
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {feedbackMsg.isError ? <FaTimesCircle /> : <FaCheckCircle />}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Main Body */}
      <div className="container mx-auto px-4 sm:px-6 py-8 flex-grow">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FaShieldAlt />
            <span>Statewide Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("admins")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
              activeTab === "admins"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FaUserShield />
            <span>District Admins ({districtAdmins.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("grievances")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
              activeTab === "grievances"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FaClipboardList />
            <span>Grievances / Applications ({applications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("citizens")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer ${
              activeTab === "citizens"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FaUsers />
            <span>Citizens / Users ({citizens.length})</span>
          </button>

          <button
            onClick={fetchAllSuperAdminData}
            className="ml-auto flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs px-3 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            <FaSync className={loading ? "animate-spin" : ""} />
            <span>Refresh All</span>
          </button>
        </div>

        {/* TAB 1: STATEWIDE OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    District In-charges
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-base">
                    <FaUserShield />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">{districtAdmins.length}</div>
                <p className="text-xs text-slate-500 mt-2">
                  Assigned across {new Set(districtAdmins.map((d) => d.assignedDistrict)).size} Assam Districts
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Citizens
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-base">
                    <FaUsers />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">{citizens.length}</div>
                <div className="flex items-center gap-2 text-xs mt-2">
                  <span className="text-emerald-700 font-medium">{totalVerifiedCitizens} Verified</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-amber-700 font-medium">{totalPendingCitizens} Pending</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Public Grievances
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-base">
                    <FaClipboardList />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">{applications.length}</div>
                <p className="text-xs text-slate-500 mt-2">
                  {totalResolvedGrievances} Resolved • {totalPendingGrievances} Pending Review
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Districts Status
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-base">
                    <FaMapMarkerAlt />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">35 Districts</div>
                <p className="text-xs text-slate-500 mt-2">
                  Full statewide coverage supported
                </p>
              </div>
            </div>

            {/* Quick Actions & District Admin Roster Banner (Clean Minimalist White Card, No Gradient) */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FaUserShield className="text-slate-700" />
                  Appoint & Manage District Officials
                </h3>
                <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
                  You have full authority to create new District In-charges for any of the 35 Assam districts,
                  assign zones, and activate or revoke their regional administrative powers instantly.
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveTab("admins");
                  setShowCreateAdminModal(true);
                }}
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center gap-2 flex-shrink-0 text-sm cursor-pointer"
              >
                <FaPlus className="text-xs" /> Appoint District Admin
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE DISTRICT ADMINS (CORE FEATURE) */}
        {activeTab === "admins" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FaBuilding className="text-slate-700" />
                  Assam District Administrators Roster
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Admins have jurisdiction strictly over their assigned district. You can create new admins or toggle active status anytime.
                </p>
              </div>
              <button
                onClick={() => setShowCreateAdminModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2 text-sm cursor-pointer"
              >
                <FaPlus className="text-xs" /> Create District Admin
              </button>
            </div>

            {/* District Admins Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">District / Area</th>
                      <th className="py-3 px-4">Admin Name</th>
                      <th className="py-3 px-4">Official Email</th>
                      <th className="py-3 px-4">Phone Number</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {districtAdmins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          <div>{admin.assignedDistrict}</div>
                          {admin.zone && <span className="text-[11px] text-slate-500 font-normal">Zone: {admin.zone}</span>}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800">{admin.name}</td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{admin.email}</td>
                        <td className="py-3.5 px-4 text-slate-600">{admin.contactNumber}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              admin.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                            {admin.isActive ? "Active" : "Deactivated"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleAdminStatus(admin._id, admin.isActive)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                              admin.isActive
                                ? "bg-white hover:bg-rose-50 text-rose-700 border-slate-200"
                                : "bg-white hover:bg-emerald-50 text-emerald-700 border-slate-200"
                            }`}
                          >
                            {admin.isActive ? <FaToggleOn className="text-base text-rose-600" /> : <FaToggleOff className="text-base text-slate-400" />}
                            <span>{admin.isActive ? "Deactivate" : "Activate"}</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STATEWIDE GRIEVANCES & APPLICATIONS */}
        {activeTab === "grievances" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FaClipboardList className="text-slate-700" />
                  Statewide Grievances & Problem Redressal
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Super Admin can inspect complaints from any district, override resolution status, and add Central directives.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={selectedDistrictFilter}
                  onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-sm"
                >
                  <option value="all">All Assam Districts (35)</option>
                  {ASSAM_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <FaSearch className="absolute left-3 top-2.5 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search problem or applicant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-800 rounded-lg pl-8 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Applications Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">District</th>
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Problem Summary</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Central Override</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {app.district}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800">
                          <div>{app.fullName}</div>
                          <span className="text-xs text-slate-500 font-mono">{app.contactNumber}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs text-slate-700">
                            {app.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                          {app.problemTitle || app.description || "Grievance details"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              app.status === "Resolved" || app.status === "Approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : app.status === "In Progress" || app.status === "In Review"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedApp(app);
                              setNewAppStatus(app.status || "In Progress");
                            }}
                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <FaEye className="text-xs" /> Inspect / Update
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CITIZENS & VERIFICATION OVERVIEW */}
        {activeTab === "citizens" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FaUsers className="text-slate-700" />
                  Statewide Citizen Registrations
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Citizens registered across all Assam districts. Super Admin can override verification anytime.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={selectedDistrictFilter}
                  onChange={(e) => setSelectedDistrictFilter(e.target.value)}
                  className="bg-white border border-slate-300 text-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-sm"
                >
                  <option value="all">All Assam Districts (35)</option>
                  {ASSAM_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <div className="relative">
                  <FaSearch className="absolute left-3 top-2.5 text-slate-400 text-xs" />
                  <input
                    type="text"
                    placeholder="Search citizens..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border border-slate-300 text-slate-800 rounded-lg pl-8 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Citizens Table */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                      <th className="py-3 px-4">District</th>
                      <th className="py-3 px-4">Citizen Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCitizens.map((citizen) => (
                      <tr key={citizen._id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {citizen.district || "Assam"}
                        </td>
                        <td className="py-3.5 px-4 text-slate-800 font-medium">
                          {citizen.firstName} {citizen.lastName}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-600">{citizen.email}</td>
                        <td className="py-3.5 px-4 text-slate-600">{citizen.contactNumber}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              citizen.verified
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                          >
                            {citizen.verified ? "Verified" : "Pending Verification"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {!citizen.verified ? (
                            <button
                              onClick={() => handleApproveCitizen(citizen._id)}
                              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <FaCheck className="text-xs" /> Super Approve
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400 font-mono">Approved</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: CREATE DISTRICT ADMIN */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-xl relative text-slate-800">
            <button
              onClick={() => setShowCreateAdminModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
            >
              <FaTimes />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center text-xl">
                <FaUserShield />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Appoint New District Admin</h3>
                <p className="text-xs text-slate-500">Regional official credentials will be generated</p>
              </div>
            </div>

            <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign District *
                </label>
                <select
                  required
                  value={newAdminForm.assignedDistrict}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, assignedDistrict: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  {ASSAM_DISTRICTS.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Admin Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tarun Gogoi"
                  value={newAdminForm.name}
                  onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin.district@party.org"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone (10 digits) *
                  </label>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    placeholder="9876543210"
                    value={newAdminForm.contactNumber}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, contactNumber: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Login Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewAdminPassword ? "text" : "password"}
                      required
                      placeholder="Password@123"
                      value={newAdminForm.password}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 pr-9 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
                      aria-label={showNewAdminPassword ? "Hide password" : "Show password"}
                    >
                      {showNewAdminPassword ? <FaEyeSlash className="text-xs" /> : <FaEye className="text-xs" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Zone / Constituency (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Guwahati East"
                    value={newAdminForm.zone}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, zone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateAdminModal(false)}
                  className="w-1/2 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="w-1/2 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {creatingAdmin ? "Creating..." : "Save & Appoint"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSPECT / UPDATE GRIEVANCE */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-xl relative text-slate-800">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
            >
              <FaTimes />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Inspect Grievance</h3>
            <p className="text-xs text-slate-500 font-mono mb-4">District: {selectedApp.district}</p>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2 mb-4 text-xs text-slate-700">
              <div>
                <span className="text-slate-500">Applicant: </span>
                <strong className="text-slate-900">{selectedApp.fullName}</strong> ({selectedApp.contactNumber})
              </div>
              <div>
                <span className="text-slate-500">Category: </span>
                <span className="font-semibold text-slate-800">{selectedApp.category}</span>
              </div>
              <div>
                <span className="text-slate-500">Title: </span>
                <span className="text-slate-900 font-medium">{selectedApp.problemTitle}</span>
              </div>
              {selectedApp.description && (
                <div className="pt-2 border-t border-slate-200 text-slate-600">
                  {selectedApp.description}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Change Status (Super Admin Override)
                </label>
                <select
                  value={newAppStatus}
                  onChange={(e) => setNewAppStatus(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Review">In Review</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Action Taken">Action Taken</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="w-1/2 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={updatingApp}
                  onClick={handleUpdateApplicationStatus}
                  className="w-1/2 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {updatingApp ? "Updating..." : "Save Override"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
