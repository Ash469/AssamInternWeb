'use client';

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  FaCheck,
  FaTimes,
  FaSync,
  FaFilter,
  FaSearch,
  FaFileAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaCalendarAlt,
  FaExternalLinkAlt,
} from 'react-icons/fa';
import Footer from '@/app/components/footer';
import AdminNavbar from '@/app/components/AdminNavbar';
import AdminRouteProtection from '@/app/components/AdminRouteProtection';

interface Application {
  id: string;
  fullName: string;
  age: number;
  contactNumber: string;
  gender: string;
  district: string;
  revenueCircle: string;
  category: string;
  villageWard: string;
  specificLocation?: string;
  problemTitle?: string;
  description?: string;
  remarks: string;
  adminRemarks?: string;
  documentUrl: string;
  status: string;
  date: string;
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{ id: string; status: string } | null>(null);
  const [actionResult, setActionResult] = useState<{ message: string; isError: boolean } | null>(null);

  const [adminRole, setAdminRole] = useState<string>('district_admin');
  const [assignedDistrict, setAssignedDistrict] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userDataStr = localStorage.getItem('userData');
      let districtParam = '';
      if (userDataStr) {
        try {
          const u = JSON.parse(userDataStr);
          if (u.role === 'district_admin' && u.assignedDistrict) {
            districtParam = `?district=${encodeURIComponent(u.assignedDistrict)}`;
          }
        } catch (e) {
          console.error('Error reading userData for district param', e);
        }
      }

      const res = await axios.get(`/api/applications${districtParam}`);

      // Handle all possible response shapes: { data: [...] } or { applications: [...] } or [...]
      let rawList: any[] = [];
      if (Array.isArray(res.data)) {
        rawList = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        rawList = res.data.data;
      } else if (res.data && Array.isArray(res.data.applications)) {
        rawList = res.data.applications;
      }

      const mapped: Application[] = rawList.map((app: any) => ({
        id: app._id || app.id || String(Math.random()),
        fullName: app.fullName || 'Anonymous Citizen',
        age: app.age || 0,
        contactNumber: app.contactNumber || '',
        gender: app.gender || '',
        district: app.district || '',
        revenueCircle: app.revenueCircle || '',
        category: app.category || 'General',
        villageWard: app.villageWard || '',
        specificLocation: app.specificLocation || '',
        problemTitle: app.problemTitle || '',
        description: app.description || '',
        remarks: app.remarks || app.description || '',
        adminRemarks: app.adminRemarks || '',
        documentUrl: app.documentUrl || '',
        status: app.status || 'Pending',
        date: app.createdAt || app.date || new Date().toISOString(),
      }));

      setApplications(mapped);
    } catch (err: unknown) {
      console.error('Error fetching applications:', err);
      const msg =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : 'Failed to load applications';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const u = JSON.parse(userDataStr);
        setAdminRole(u.role || 'district_admin');
        setAssignedDistrict(u.assignedDistrict || null);
      } catch (e) {
        console.error('Error reading userData', e);
      }
    }
    fetchApplications();
  }, [fetchApplications]);

  const handleStatusUpdate = (id: string, status: string) => {
    setConfirmationData({ id, status });
    setShowConfirmation(true);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      setShowConfirmation(false);
      const res = await axios.put('/api/applications', {
        id,
        applicationId: id,
        status: newStatus,
      });

      if (res.status === 200) {
        setApplications((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: newStatus } : app))
        );
        if (selectedApp && selectedApp.id === id) {
          setSelectedApp((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        setActionResult({
          message: `Application marked as "${newStatus}" successfully`,
          isError: false,
        });
      }
    } catch (err: unknown) {
      console.error('Error updating application status:', err);
      const msg =
        axios.isAxiosError(err) && (err.response?.data?.error || err.response?.data?.message)
          ? err.response.data.error || err.response.data.message
          : 'Failed to update application status';
      setActionResult({ message: msg, isError: true });
    }
  };

  // Helper status checkers
  const isApprovedStatus = (s: string) =>
    ['approved', 'resolved', 'action taken'].includes((s || '').toLowerCase());
  const isPendingStatus = (s: string) =>
    ['pending', 'in review', 'in progress'].includes((s || '').toLowerCase());
  const isRejectedStatus = (s: string) =>
    (s || '').toLowerCase() === 'rejected';

  // Filter logic
  const filteredApplications = applications.filter((app) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (app.fullName && app.fullName.toLowerCase().includes(q)) ||
      (app.contactNumber && app.contactNumber.includes(q)) ||
      (app.id && app.id.toLowerCase().includes(q)) ||
      (app.problemTitle && app.problemTitle.toLowerCase().includes(q)) ||
      (app.villageWard && app.villageWard.toLowerCase().includes(q)) ||
      (app.district && app.district.toLowerCase().includes(q));

    const matchesCategory =
      categoryFilter === 'all' ||
      (app.category && app.category.toLowerCase() === categoryFilter.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = isPendingStatus(app.status);
    } else if (statusFilter === 'approved') {
      matchesStatus = isApprovedStatus(app.status);
    } else if (statusFilter === 'rejected') {
      matchesStatus = isRejectedStatus(app.status);
    } else if (statusFilter !== 'all') {
      matchesStatus = app.status.toLowerCase() === statusFilter.toLowerCase();
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const categories = ['all', ...Array.from(new Set(applications.map((app) => app.category).filter(Boolean)))];

  const pendingCount = applications.filter((a) => isPendingStatus(a.status)).length;
  const approvedCount = applications.filter((a) => isApprovedStatus(a.status)).length;
  const rejectedCount = applications.filter((a) => isRejectedStatus(a.status)).length;

  return (
    <AdminRouteProtection>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
        <AdminNavbar currentTab="application" />

        <main className="container mx-auto px-4 sm:px-8 py-8 flex-grow">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Grievance Applications
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {adminRole === 'super_admin'
                  ? 'Review and manage statewide grievance records across all Assam districts'
                  : `Review and process applications submitted in ${assignedDistrict || 'your district'}`}
              </p>
            </div>

            <button
              onClick={fetchApplications}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Records <span className="ml-1 opacity-75">({applications.length})</span>
            </button>

            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Pending & Review <span className="ml-1">({pendingCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Approved & Resolved <span className="ml-1">({approvedCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              Rejected <span className="ml-1">({rejectedCount})</span>
            </button>
          </div>

          {/* Search and Category Filter Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-96">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                <input
                  type="text"
                  placeholder="Search by title, citizen name, phone, village..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <FaFilter className="text-slate-400 text-xs hidden sm:block" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filter applications by category"
                  className="w-full sm:w-auto bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Applications Content */}
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-16 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-3"></div>
              <p className="text-xs text-slate-500">Loading grievance applications...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-xs">
              {error}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FaFileAlt className="text-lg" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No applications matched</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {applications.length === 0
                  ? 'No grievance applications have been submitted in this district yet.'
                  : 'Try adjusting your search terms or filter settings.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Grievance & Applicant</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Submitted</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApplications.map((app) => {
                      const isPending = isPendingStatus(app.status);
                      const isApproved = isApprovedStatus(app.status);
                      const isRejected = isRejectedStatus(app.status);

                      return (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200 flex-shrink-0 mt-0.5">
                                {app.fullName ? app.fullName.charAt(0).toUpperCase() : 'A'}
                              </div>
                              <div>
                                {app.problemTitle && (
                                  <div className="font-bold text-slate-900 line-clamp-1 mb-0.5">
                                    {app.problemTitle}
                                  </div>
                                )}
                                <div className="font-medium text-slate-700 text-[11px]">
                                  {app.fullName}
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <FaPhoneAlt className="text-[9px]" />
                                  <span>{app.contactNumber || 'No phone'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-900 font-medium">{app.district || 'District N/A'}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <FaMapMarkerAlt className="text-[9px] text-slate-400" />
                              <span className="truncate max-w-[150px]">
                                {app.specificLocation || app.villageWard || app.revenueCircle || 'Assam'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="inline-block bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium">
                              {app.category || 'General'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                isApproved
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : isRejected
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isApproved
                                    ? 'bg-emerald-500'
                                    : isRejected
                                    ? 'bg-rose-500'
                                    : 'bg-amber-500'
                                }`}
                              ></span>
                              {app.status || 'Pending'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-500">
                            <div className="flex items-center gap-1 text-[11px]">
                              <FaCalendarAlt className="text-[10px] text-slate-400" />
                              <span>{app.date ? new Date(app.date).toLocaleDateString() : 'Recent'}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Review
                              </button>

                              {!isApproved && (
                                <button
                                  onClick={() => handleStatusUpdate(app.id, 'Approved')}
                                  title="Approve Grievance"
                                  className="p-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                                >
                                  <FaCheck className="text-xs" />
                                </button>
                              )}

                              {!isRejected && (
                                <button
                                  onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                                  title="Reject Grievance"
                                  className="p-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                                >
                                  <FaTimes className="text-xs" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        <Footer />

        {/* Modal: View & Review Application */}
        {selectedApp && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Application Review</h2>
                  <p className="text-xs text-slate-500">
                    {selectedApp.district} Jurisdiction • Submitted {new Date(selectedApp.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Status bar */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-600 font-medium">Current Status:</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      isApprovedStatus(selectedApp.status)
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : isRejectedStatus(selectedApp.status)
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {selectedApp.status || 'Pending'}
                  </span>
                </div>

                {/* Problem Title & Description */}
                {selectedApp.problemTitle && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Grievance Subject
                    </h3>
                    <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-900 text-sm">
                      {selectedApp.problemTitle}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Problem Description & Citizen Remarks
                  </h3>
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                    {selectedApp.description || selectedApp.remarks || 'No detailed description provided.'}
                  </div>
                </div>

                {/* Details Grid */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Applicant Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Full Name</span>
                      <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                        {selectedApp.fullName}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Contact Phone</span>
                      <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                        {selectedApp.contactNumber}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Age & Gender</span>
                      <span className="font-medium text-slate-800 mt-0.5 block">
                        {selectedApp.age || 'N/A'} yrs • {selectedApp.gender || 'Not specified'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Category</span>
                      <span className="font-medium text-slate-800 mt-0.5 block">
                        {selectedApp.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Jurisdiction & Location
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">District</span>
                      <span className="font-medium text-slate-800 mt-0.5 block">
                        {selectedApp.district}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Revenue Circle</span>
                      <span className="font-medium text-slate-800 mt-0.5 block">
                        {selectedApp.revenueCircle || 'N/A'}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <span className="text-slate-500 block text-[11px]">Village / Ward</span>
                      <span className="font-medium text-slate-800 mt-0.5 block">
                        {selectedApp.specificLocation || selectedApp.villageWard || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Document attachment if available */}
                {selectedApp.documentUrl && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Attached Document / Evidence
                    </h3>
                    {selectedApp.documentUrl.match(/\.(jpeg|jpg|png|webp|gif|heic|heif)(\?|$)/i) && (
                      <div className="mb-2 max-h-48 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={selectedApp.documentUrl}
                          alt="Grievance evidence"
                          className="w-full h-44 object-cover"
                        />
                      </div>
                    )}
                    <a
                      href={selectedApp.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                    >
                      <FaExternalLinkAlt className="text-[10px]" />
                      <span>Open Full Evidence File (Secure Presigned Link)</span>
                    </a>
                  </div>
                )}

                {/* Status action buttons */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-end">
                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id, 'Approved')}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FaCheck className="text-xs" />
                    <span>Approve Grievance</span>
                  </button>

                  <button
                    onClick={() => handleStatusUpdate(selectedApp.id, 'Rejected')}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <FaTimes className="text-xs" />
                    <span>Reject Grievance</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && confirmationData && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
              <div className="p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Confirm Status Update</h3>
                <p className="text-xs text-slate-600">
                  Are you sure you want to change the status of this application to{' '}
                  <strong className="text-slate-900">{confirmationData.status}</strong>?
                </p>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateStatus(confirmationData.id, confirmationData.status)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer ${
                      confirmationData.status === 'Approved'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    Confirm Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action result toast */}
        {actionResult && (
          <div className="fixed bottom-5 right-5 max-w-xs w-full z-50">
            <div
              className={`rounded-xl p-3.5 shadow-lg border text-xs flex items-center justify-between gap-2 ${
                actionResult.isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <span>{actionResult.message}</span>
              <button
                onClick={() => setActionResult(null)}
                className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminRouteProtection>
  );
}
