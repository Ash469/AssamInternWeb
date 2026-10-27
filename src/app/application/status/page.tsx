'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import NavBar from '../../components/nav_bar';
import Footer from '@/app/components/footer';
import { 
  FaFileAlt, 
  FaPlus, 
  FaSearch, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaClock, 
  FaTimesCircle, 
  FaPrint, 
  FaExternalLinkAlt, 
  FaTimes, 
  FaShieldAlt, 
  FaSyncAlt 
} from 'react-icons/fa';

interface ApplicationItem {
  _id: string;
  id?: string;
  fullName: string;
  age?: number;
  contactNumber?: string;
  gender?: string;
  district: string;
  revenueCircle?: string;
  villageWard?: string;
  specificLocation?: string;
  category: string;
  problemTitle?: string;
  description?: string;
  remarks?: string;
  documentUrl?: string;
  status: string;
  createdBy?: string;
  adminRemarks?: string;
  actionTaken?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export default function ApplicationStatusPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Resolved' | 'Rejected'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);
  
  // Load user session and fetch applications
  const loadData = async () => {
    setLoading(true);
    setError('');

    const profileStr = localStorage.getItem('userProfile');
    const storedUserId = localStorage.getItem('userId');

    let userObj: { id?: string; userId?: string; fullName?: string; email?: string; contactNumber?: string } = {};

    if (profileStr) {
      try {
        const parsed = JSON.parse(profileStr);
        userObj = {
          id: parsed._id || parsed.id || storedUserId || '',
          userId: parsed.userId || storedUserId || '',
          fullName: parsed.fullName || (parsed.firstName ? `${parsed.firstName} ${parsed.lastName || ''}`.trim() : ''),
          email: parsed.email || '',
          contactNumber: parsed.contactNumber || parsed.phone || parsed.phoneNumber || '',
        };
      } catch (e) {
        console.error('Error parsing userProfile', e);
      }
    } else if (storedUserId) {
      userObj.id = storedUserId;
    }

    try {
      // Build query string with all available user identifiers
      const params = new URLSearchParams();
      if (userObj.id) params.append('userId', userObj.id);
      if (userObj.email) params.append('email', userObj.email);
      if (userObj.contactNumber) params.append('contact', userObj.contactNumber);
      if (userObj.fullName) params.append('name', userObj.fullName);

      // If no token or identifiers, fall back to fetching all or prompt login
      const url = params.toString() ? `/api/applications?${params.toString()}` : '/api/applications';
      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`Failed to load applications (status: ${res.status})`);
      }

      const json = await res.json();
      const list: ApplicationItem[] = json.data || [];
      
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setApplications(list);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Unable to retrieve grievance applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      // Status filter
      if (statusFilter === 'Pending') {
        const s = (app.status || '').toLowerCase();
        if (s.includes('resolved') || s.includes('approved') || s.includes('rejected')) {
          return false;
        }
      } else if (statusFilter === 'Resolved') {
        const s = (app.status || '').toLowerCase();
        if (!s.includes('resolved') && !s.includes('approved')) {
          return false;
        }
      } else if (statusFilter === 'Rejected') {
        const s = (app.status || '').toLowerCase();
        if (!s.includes('rejected')) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = (app.problemTitle || app.remarks || '').toLowerCase();
        const cat = (app.category || '').toLowerCase();
        const dist = (app.district || '').toLowerCase();
        const loc = (app.specificLocation || app.villageWard || '').toLowerCase();
        return title.includes(q) || cat.includes(q) || dist.includes(q) || loc.includes(q);
      }

      return true;
    });
  }, [applications, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = applications.length;
    let pending = 0;
    let resolved = 0;
    let rejected = 0;

    applications.forEach((app) => {
      const s = (app.status || '').toLowerCase();
      if (s.includes('resolved') || s.includes('approved')) {
        resolved++;
      } else if (s.includes('rejected')) {
        rejected++;
      } else {
        pending++;
      }
    });

    return { total, pending, resolved, rejected };
  }, [applications]);

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('resolved') || s.includes('approved')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <FaCheckCircle className="text-[10px]" />
          Resolved
        </span>
      );
    }
    if (s.includes('rejected')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
          <FaTimesCircle className="text-[10px]" />
          Rejected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <FaClock className="text-[10px]" />
        In Review
      </span>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <NavBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Breadcrumb & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/" className="hover:text-slate-900 transition-colors">Portal Home</Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Grievances & Status</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              My Submitted Grievances
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Track real-time administrative review, official district actions, and resolution history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors shadow-xs"
              title="Refresh applications"
            >
              <FaSyncAlt className={`text-xs ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/application/new"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <FaPlus className="text-[10px]" />
              <span>Submit New Grievance</span>
            </Link>
          </div>
        </div>

        {/* Metric Quick Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 my-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-medium text-slate-500">Total Applications</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-medium text-amber-600">Under Review</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-medium text-emerald-600">Action Taken / Resolved</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.resolved}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <p className="text-xs font-medium text-rose-600">Rejected</p>
            <p className="text-2xl font-bold text-rose-700 mt-1">{stats.rejected}</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {(['All', 'Pending', 'Resolved', 'Rejected'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab === 'All' ? 'All Grievances' : tab === 'Pending' ? 'In Review' : tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Search category, location, or problem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
            />
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs text-slate-500 font-medium">Loading your grievance records...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center text-rose-700">
            <FaTimesCircle className="text-2xl mx-auto mb-2 text-rose-500" />
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={loadData}
              className="mt-3 px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FaFileAlt className="text-xl" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Grievances Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'All'
                ? 'No submitted applications match your selected filter or search keyword.'
                : "You have not submitted any civic grievance applications yet."}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {searchQuery || statusFilter !== 'All' ? (
                <button
                  onClick={() => {
                    setStatusFilter('All');
                    setSearchQuery('');
                  }}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  href="/application/new"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
                >
                  <FaPlus className="text-[10px]" />
                  <span>Submit Your First Grievance</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredApps.map((app) => {
              const displayTitle = app.problemTitle || app.remarks || 'Civic Infrastructure Grievance';
              const appIdShort = app._id ? app._id.substring(app._id.length - 6).toUpperCase() : 'APP';

              return (
                <div
                  key={app._id}
                  onClick={() => setSelectedApp(app)}
                  className="group bg-white rounded-xl border border-slate-200 hover:border-slate-400 hover:shadow-md transition-all p-5 flex flex-col justify-between cursor-pointer relative"
                >
                  <div>
                    {/* Top Row: Category and Status */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md truncate max-w-[170px]">
                        {app.category}
                      </span>
                      {getStatusBadge(app.status)}
                    </div>

                    {/* Problem Title */}
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {displayTitle}
                    </h3>

                    {/* Description preview */}
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {app.description || app.remarks || 'No detailed description specified.'}
                    </p>
                  </div>

                  {/* Metadata and Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5 truncate">
                        <FaMapMarkerAlt className="text-slate-400 text-xs shrink-0" />
                        <span className="truncate">{app.district} {app.revenueCircle ? `• ${app.revenueCircle}` : ''}</span>
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-slate-400">
                        REF: #{appIdShort}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1.5">
                        <FaCalendarAlt className="text-slate-400 text-xs" />
                        {new Date(app.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>

                      <span className="text-xs font-semibold text-slate-900 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Complete Application Detail Dossier Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div 
            className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-300">
                  <FaFileAlt className="text-sm" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm sm:text-base font-bold text-white">Application Dossier</h2>
                    <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                      #{selectedApp._id ? selectedApp._id.substring(selectedApp._id.length - 6).toUpperCase() : 'APP'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Jan Sambad Civic Grievance Management
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Print Application"
                >
                  <FaPrint className="text-xs" />
                </button>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-rose-500 text-slate-300 hover:text-white transition-colors cursor-pointer"
                  title="Close"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 flex-1">
              {/* Problem Title & Status Banner */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded">
                    {selectedApp.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">
                    {selectedApp.problemTitle || selectedApp.remarks || 'Civic Infrastructure Grievance'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Submitted on: {new Date(selectedApp.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </p>
                </div>
                <div>
                  {getStatusBadge(selectedApp.status)}
                </div>
              </div>

              {/* Administrative Review & Action Taken Status */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wide mb-2">
                  <FaShieldAlt className="text-blue-700" />
                  <span>District Administration Official Response</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Administrative Remarks:</span>
                    <p className="text-slate-800 font-medium mt-0.5 bg-white/80 p-2.5 rounded-lg border border-blue-100">
                      {selectedApp.adminRemarks || 'Your application has been logged into the district queue and is awaiting field officer review.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Action Taken:</span>
                    <p className="text-slate-800 font-medium mt-0.5 bg-white/80 p-2.5 rounded-lg border border-blue-100">
                      {selectedApp.actionTaken || 'Preliminary assessment initiated. Assigned to respective circle jurisdiction.'}
                    </p>
                  </div>
                </div>

                {selectedApp.resolvedAt && (
                  <p className="text-[11px] text-blue-700 font-medium mt-2">
                    Resolved Date: {new Date(selectedApp.resolvedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                )}
              </div>

              {/* Grievance Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Full Grievance Description
                </h4>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {selectedApp.description || selectedApp.remarks || 'No detailed description provided by the citizen.'}
                </div>
              </div>

              {/* Location & Jurisdiction Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Location & Jurisdiction
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-medium block">District</span>
                    <span className="text-xs font-semibold text-slate-900 mt-0.5 block">{selectedApp.district || 'Assam'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-medium block">Revenue Circle</span>
                    <span className="text-xs font-semibold text-slate-900 mt-0.5 block">{selectedApp.revenueCircle || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-medium block">Village / Ward</span>
                    <span className="text-xs font-semibold text-slate-900 mt-0.5 block">{selectedApp.villageWard || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-medium block">Landmark / Spot</span>
                    <span className="text-xs font-semibold text-slate-900 mt-0.5 block truncate" title={selectedApp.specificLocation || 'N/A'}>
                      {selectedApp.specificLocation || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Citizen Information & Evidence */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Citizen Info */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Applicant Information
                  </h4>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Applicant:</span>
                      <span className="font-semibold text-slate-900">{selectedApp.fullName}</span>
                    </div>
                    {selectedApp.contactNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Contact Number:</span>
                        <span className="font-semibold text-slate-900">{selectedApp.contactNumber}</span>
                      </div>
                    )}
                    {selectedApp.gender && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Gender & Age:</span>
                        <span className="font-semibold text-slate-900">{selectedApp.gender} {selectedApp.age ? `• ${selectedApp.age} yrs` : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Uploaded Document / Evidence */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Attached Evidence / Document
                  </h4>
                  {selectedApp.documentUrl ? (
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      {selectedApp.documentUrl.match(/\.(jpeg|jpg|png|webp|gif|heic|heif)(\?|$)/i) ? (
                        <div>
                          <div className="relative h-28 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-100 mb-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={selectedApp.documentUrl}
                              alt="Attached grievance evidence"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <a
                            href={selectedApp.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            <FaExternalLinkAlt className="text-[10px]" />
                            <span>View Full Resolution Photo</span>
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-700 flex items-center gap-2">
                            <FaFileAlt className="text-slate-400" />
                            Official File Document Attached
                          </span>
                          <a
                            href={selectedApp.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            Download / Open
                          </a>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center text-xs text-slate-400">
                      No photo or document was attached with this grievance.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-[11px] text-slate-400 font-mono">
                Assam Civic Redressal • Jan Sambad
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <FaPrint className="text-xs" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}