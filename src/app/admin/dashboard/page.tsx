"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Footer from "@/app/components/footer";
import { FaClock, FaUsers, FaFileAlt, FaCheckCircle } from "react-icons/fa";
import AdminRouteProtection from "@/app/components/AdminRouteProtection";
import AdminNavbar from "@/app/components/AdminNavbar";

export default function AdminHome() {
  const [adminName, setAdminName] = useState("Admin");
  const [totalUsers, setTotalUsers] = useState(0);
  const [verifiedUsers, setVerifiedUsers] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [approvedApplications, setApprovedApplications] = useState(0);
  const [rejectedApplications, setRejectedApplications] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);
  const [categoryDistribution, setCategoryDistribution] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [adminRole, setAdminRole] = useState("district_admin");
  const [assignedDistrict, setAssignedDistrict] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
    fetchDashboardData();
  }, []);

  const loadAdminData = () => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        setAdminName(userData.name || userData.firstName || "Admin");
        setAdminRole(userData.role || "district_admin");
        setAssignedDistrict(userData.assignedDistrict || null);
      } catch (e) {
        console.error("Error reading userData", e);
      }
    }
  };

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const userDataString = localStorage.getItem("userData");
      let districtParam = "";
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData.role === "district_admin" && userData.assignedDistrict) {
          districtParam = `?district=${encodeURIComponent(userData.assignedDistrict)}`;
        }
      }

      const [usersRes, applicationsRes] = await Promise.all([
        axios.get(`/api/getnewsignup${districtParam}`),
        axios.get(`/api/applications${districtParam}`),
      ]);

      const users = usersRes.data.users || [];
      const applications = applicationsRes.data.data || [];

      const verified = users.filter((user: { verified: boolean }) => user.verified).length;
      const pending = users.filter((user: { verified: boolean }) => !user.verified).length;
      setTotalUsers(users.length);
      setVerifiedUsers(verified);
      setPendingUsers(pending);

      const isApprovedStatus = (s: string) => ['approved', 'resolved', 'action taken'].includes((s || '').toLowerCase());
      const isPendingStatus = (s: string) => ['pending', 'in review', 'in progress'].includes((s || '').toLowerCase());
      const isRejectedStatus = (s: string) => (s || '').toLowerCase() === 'rejected';

      const approved = applications.filter((app: { status: string }) => isApprovedStatus(app.status)).length;
      const rejected = applications.filter((app: { status: string }) => isRejectedStatus(app.status)).length;
      const pendingApps = applications.filter((app: { status: string }) => isPendingStatus(app.status)).length;
      setTotalApplications(applications.length);
      setApprovedApplications(approved);
      setRejectedApplications(rejected);
      setPendingApplications(pendingApps);

      const catDist: Record<string, number> = {};
      applications.forEach((app: { category: string }) => {
        const category = app.category || 'General';
        catDist[category] = (catDist[category] || 0) + 1;
      });
      setCategoryDistribution(catDist);

      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
      setIsLoading(false);
    }
  };

  return (
    <AdminRouteProtection>
      <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
        <AdminNavbar currentTab="dashboard" />

        {isLoading ? (
          <div className="flex-grow flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-slate-900"></div>
          </div>
        ) : error ? (
          <div className="flex-grow flex items-center justify-center py-16">
            <div className="text-rose-600 text-center">
              <p className="text-sm">{error}</p>
              <button
                onClick={fetchDashboardData}
                className="mt-4 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800 cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <main className="container mx-auto px-4 sm:px-8 py-8 flex-grow space-y-6">
            {/* Header / Overview Title */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  District Operations Overview
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {assignedDistrict ? `Assigned to: ${assignedDistrict} District` : "Statewide Operations Scope"} • Logged in as <strong className="text-slate-700">{adminName}</strong>
                </p>
              </div>
            </div>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Grievances
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold">
                    <FaFileAlt />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">{totalApplications}</div>
                <div className="flex items-center gap-2 text-xs mt-2 text-slate-500">
                  <span className="text-emerald-700 font-semibold">{approvedApplications} Resolved</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-amber-700 font-semibold">{pendingApplications} Pending</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Registered Citizens
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold">
                    <FaUsers />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">{totalUsers}</div>
                <div className="flex items-center gap-2 text-xs mt-2 text-slate-500">
                  <span className="text-emerald-700 font-semibold">{verifiedUsers} Verified</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-amber-700 font-semibold">{pendingUsers} Pending</span>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Resolution Rate
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold">
                    <FaCheckCircle />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">
                  {totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0}%
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  {approvedApplications} of {totalApplications} complaints addressed
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Pending Verification
                  </span>
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold">
                    <FaClock />
                  </div>
                </div>
                <div className="text-3xl font-bold text-slate-900">{pendingUsers}</div>
                <p className="text-xs text-slate-500 mt-2">
                  Citizens waiting for district ID verification
                </p>
              </div>
            </div>



            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Citizen Verification Breakdown */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Citizen Verification Ratio</h3>
                  <span className="text-xs text-slate-500 font-mono">{verifiedUsers} / {totalUsers} Verified</span>
                </div>

                <div className="flex justify-center items-center py-4">
                  <div className="relative w-36 h-36">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#F1F5F9"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#0F172A"
                        strokeWidth="3.5"
                        strokeDasharray={`${totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0}, 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                      <p className="text-2xl font-bold text-slate-900">
                        {totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0}%
                      </p>
                      <p className="text-[10px] uppercase font-semibold text-slate-400">Verified</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-900"></span> Verified Residents
                    </span>
                    <span className="font-semibold text-slate-900">{verifiedUsers}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span> Pending Review
                    </span>
                    <span className="font-semibold text-amber-700">{pendingUsers}</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Grievance Categories Distribution */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900">Grievance Distribution by Category</h3>
                  <span className="text-xs text-slate-500 font-mono">{totalApplications} Total</span>
                </div>

                {Object.keys(categoryDistribution).length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-xs text-slate-400">
                    No grievances recorded in this district yet.
                  </div>
                ) : (
                  <div className="space-y-3 py-2">
                    {Object.entries(categoryDistribution).map(([category, count]) => {
                      const pct = totalApplications > 0 ? Math.round((count / totalApplications) * 100) : 0;
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-xs text-slate-700">
                            <span className="font-medium">{category}</span>
                            <span className="text-slate-500 font-mono">{count} ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-slate-900 h-2 rounded-full"
                              style={{ width: `${pct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </main>
        )}
        <Footer />
      </div>
    </AdminRouteProtection>
  );
}
