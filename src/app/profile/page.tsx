"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import NavBar from "../components/nav_bar";
import Footer from "../components/footer";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaClock,
  FaClipboardList,
  FaSignOutAlt,
  FaEdit,
  FaShieldAlt,
  FaCalendarAlt,
  FaTimes,
  FaSave,
  FaExclamationCircle,
} from "react-icons/fa";
import { ASSAM_DISTRICTS } from "@/config/districts";

interface UserProfile {
  _id?: string;
  userId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  contactNumber?: string;
  district?: string;
  revenueCircle?: string;
  villageWard?: string;
  address?: string;
  gender?: string;
  age?: number;
  createdAt?: string;
  verified?: boolean;
  verificationStatus?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appStats, setAppStats] = useState({ total: 0, pending: 0, resolved: 0 });

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    contactNumber: "",
    district: "",
    revenueCircle: "",
    villageWard: "",
    address: "",
    gender: "Male",
    age: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  const router = useRouter();

  // Load citizen profile and statistics
  const loadProfile = async () => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/userlogin");
      return;
    }

    const storedProfile = localStorage.getItem("userProfile");
    const storedUserId = localStorage.getItem("userId");

    let initialProfile: UserProfile | null = null;
    if (storedProfile) {
      try {
        initialProfile = JSON.parse(storedProfile);
        setProfile(initialProfile);
      } catch (e) {
        console.error("Error reading stored profile", e);
      }
    }

    try {
      // Query profile from database
      const queryParam = initialProfile?.email
        ? `email=${encodeURIComponent(initialProfile.email)}`
        : storedUserId
        ? `userId=${encodeURIComponent(storedUserId)}`
        : "";

      const res = await fetch(`/api/getnewsignup?${queryParam}`);
      if (res.ok) {
        const data = await res.json();
        const users = data.users || [];
        if (users.length > 0) {
          const matchedUser = initialProfile
            ? users.find(
                (u: UserProfile) =>
                  u.email?.toLowerCase() === initialProfile?.email?.toLowerCase() ||
                  u._id === initialProfile?._id ||
                  u.userId === initialProfile?.userId
              ) || users[0]
            : users[0];

          setProfile(matchedUser);
          localStorage.setItem("userProfile", JSON.stringify(matchedUser));

          // Set form values for edit
          setEditForm({
            contactNumber: matchedUser.contactNumber || "",
            district: matchedUser.district || "",
            revenueCircle: matchedUser.revenueCircle || "",
            villageWard: matchedUser.villageWard || "",
            address: matchedUser.address || "",
            gender: matchedUser.gender || "Male",
            age: matchedUser.age ? matchedUser.age.toString() : "",
          });

          // Fetch grievance stats for this citizen
          const appRes = await fetch(
            `/api/applications?userId=${matchedUser.userId || matchedUser._id}&email=${encodeURIComponent(
              matchedUser.email || ""
            )}&contact=${encodeURIComponent(matchedUser.contactNumber || "")}`
          );
          if (appRes.ok) {
            const appData = await appRes.json();
            const apps = appData.data || [];
            let pending = 0;
            let resolved = 0;
            apps.forEach((a: any) => {
              const s = (a.status || "").toLowerCase();
              if (s.includes("resolved") || s.includes("approved")) resolved++;
              else pending++;
            });
            setAppStats({ total: apps.length, pending, resolved });
          }
        }
      }
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      if (!initialProfile) {
        setError(err.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/");
  };

  const handleEditOpen = () => {
    if (profile) {
      setEditForm({
        contactNumber: profile.contactNumber || "",
        district: profile.district || "",
        revenueCircle: profile.revenueCircle || "",
        villageWard: profile.villageWard || "",
        address: profile.address || "",
        gender: profile.gender || "Male",
        age: profile.age ? profile.age.toString() : "",
      });
      setSaveError("");
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    if (editForm.contactNumber && editForm.contactNumber.length !== 10) {
      setSaveError("Contact number must be exactly 10 digits");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/getnewsignup", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profile?.userId || profile?._id,
          ...editForm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      const updated = data.user;
      setProfile(updated);
      localStorage.setItem("userProfile", JSON.stringify(updated));
      setSaveSuccess(true);

      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
      }, 1500);
    } catch (err: any) {
      console.error("Update error:", err);
      setSaveError(err.message || "Failed to update profile details");
    } finally {
      setSaving(false);
    }
  };

  const getDisplayName = (u: UserProfile | null) => {
    if (!u) return "Citizen";
    if (u.fullName) return u.fullName;
    const parts = [u.firstName, u.middleName, u.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(" ") : "Citizen";
  };

  const isVerified = profile?.verified === true || profile?.verificationStatus === "approved";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <NavBar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-slate-900 transition-colors">Portal Home</Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Citizen Profile</span>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading citizen profile...</p>
          </div>
        ) : error && !profile ? (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center text-rose-700">
            <FaExclamationCircle className="text-2xl mx-auto mb-2 text-rose-500" />
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={loadProfile}
              className="mt-3 px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Card: Citizen Identity & Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4 sm:gap-6">
                {/* Avatar Initial Circle */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-xs flex-shrink-0">
                  {getDisplayName(profile).charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {getDisplayName(profile)}
                    </h1>
                    {isVerified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <FaCheckCircle className="text-[10px]" />
                        Verified Citizen
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <FaClock className="text-[10px]" />
                        Verification Pending
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FaEnvelope className="text-slate-400 text-xs" />
                      {profile?.email || "Not specified"}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-slate-400 text-xs" />
                      {profile?.district || "Assam District"}
                    </span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  onClick={handleEditOpen}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                >
                  <FaEdit className="text-xs text-slate-500" />
                  <span>Edit Profile</span>
                </button>

                <Link
                  href="/application/status"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <FaClipboardList className="text-xs" />
                  <span>My Applications</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <FaSignOutAlt className="text-xs" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics & Grievance Activity */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Grievances Filed</span>
                  <FaClipboardList className="text-slate-400 text-sm" />
                </div>
                <p className="text-2xl font-bold text-slate-900 mt-2">{appStats.total}</p>
                <Link
                  href="/application/status"
                  className="text-[11px] text-blue-600 hover:text-blue-800 font-medium mt-1 inline-block"
                >
                  View Grievances Tracking →
                </Link>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-600">Under District Review</span>
                  <FaClock className="text-amber-500 text-sm" />
                </div>
                <p className="text-2xl font-bold text-amber-700 mt-2">{appStats.pending}</p>
                <p className="text-[11px] text-slate-400 mt-1">Under official processing</p>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600">Action Taken & Resolved</span>
                  <FaCheckCircle className="text-emerald-500 text-sm" />
                </div>
                <p className="text-2xl font-bold text-emerald-700 mt-2">{appStats.resolved}</p>
                <p className="text-[11px] text-slate-400 mt-1">Civic issues addressed</p>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Section 1: Personal Details */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Personal Details</h2>
                    <p className="text-[11px] text-slate-500">Citizen identification and communication records</p>
                  </div>
                  <FaUser className="text-slate-400 text-xs" />
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Full Name</span>
                    <span className="font-semibold text-slate-900">{getDisplayName(profile)}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Email Address</span>
                    <span className="font-semibold text-slate-900">{profile?.email || "Not specified"}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Contact Mobile</span>
                    <span className="font-semibold text-slate-900">{profile?.contactNumber || "Not specified"}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Gender</span>
                    <span className="font-semibold text-slate-900">{profile?.gender || "Not specified"}</span>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 font-medium">Age</span>
                    <span className="font-semibold text-slate-900">{profile?.age ? `${profile.age} years` : "Not specified"}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Administrative Jurisdiction & Address */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Jurisdiction & Residence</h2>
                    <p className="text-[11px] text-slate-500">Local administrative circle for complaint routing</p>
                  </div>
                  <FaMapMarkerAlt className="text-slate-400 text-xs" />
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Assam District</span>
                    <span className="font-semibold text-slate-900">{profile?.district || "Not specified"}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Revenue Circle</span>
                    <span className="font-semibold text-slate-900">{profile?.revenueCircle || "Not assigned"}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Village / Ward</span>
                    <span className="font-semibold text-slate-900">{profile?.villageWard || "Not specified"}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-50">
                    <span className="text-slate-500 font-medium">Registered Address</span>
                    <span className="font-semibold text-slate-900 text-right max-w-[220px] truncate" title={profile?.address || "N/A"}>
                      {profile?.address || "Not specified"}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 font-medium">State</span>
                    <span className="font-semibold text-slate-900">Assam, India</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Account Verification & Security Status */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Account Status & System Security</h2>
                  <p className="text-[11px] text-slate-500">Portal membership and district verification metadata</p>
                </div>
                <FaShieldAlt className="text-slate-400 text-xs" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Verification Status</span>
                  <span className="font-semibold text-slate-900 mt-1 block">
                    {isVerified ? "Verified Citizen Record" : "Awaiting District Verification"}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Member Since</span>
                  <span className="font-semibold text-slate-900 mt-1 block">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Active Member"}
                  </span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Reviewing Authority</span>
                  <span className="font-semibold text-slate-900 mt-1 block">
                    {profile?.district ? `${profile.district} District Admin` : "Government of Assam"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div
            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FaEdit className="text-slate-300 text-sm" />
                <h3 className="text-sm font-bold text-white">Edit Citizen Profile</h3>
              </div>
              <button
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <FaTimes size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              {saveError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <FaExclamationCircle className="shrink-0" />
                  <span>{saveError}</span>
                </div>
              )}

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center gap-2">
                  <FaCheckCircle className="shrink-0" />
                  <span>Profile updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Mobile Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={editForm.contactNumber}
                    onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    placeholder="10-digit mobile"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assam District
                  </label>
                  <select
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    required
                  >
                    <option value="">Select district</option>
                    {ASSAM_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Revenue Circle
                  </label>
                  <input
                    type="text"
                    value={editForm.revenueCircle}
                    onChange={(e) => setEditForm({ ...editForm, revenueCircle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    placeholder="e.g. Dispur / Dibrugarh West"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Village / Ward
                  </label>
                  <input
                    type="text"
                    value={editForm.villageWard}
                    onChange={(e) => setEditForm({ ...editForm, villageWard: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    placeholder="e.g. Ward No. 12"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min={18}
                    max={120}
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                    placeholder="e.g. 34"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Residential Address
                </label>
                <textarea
                  rows={2}
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 resize-none"
                  placeholder="House number, street, landmark..."
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <FaSave className="text-xs" />
                  <span>{saving ? "Saving Changes..." : "Save Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
