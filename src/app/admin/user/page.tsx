'use client';

import React, { useEffect, useState } from 'react';
import {
  FaSync,
  FaSearch,
  FaCheck,
  FaTimes,
  FaUsers,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from 'react-icons/fa';
import Footer from '@/app/components/footer';
import AdminNavbar from '@/app/components/AdminNavbar';
import AdminRouteProtection from '@/app/components/AdminRouteProtection';

interface User {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  userId: string;
  email: string;
  contactNumber: string;
  age: number;
  gender: string;
  district?: string;
  revenueCircle?: string;
  villageWard?: string;
  verified: boolean;
  createdAt: string;
}

const AdminUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Verified' | 'Unverified'>('All');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState<{ message: string; isError: boolean } | null>(null);

  const [adminRole, setAdminRole] = useState<string>('district_admin');
  const [assignedDistrict, setAssignedDistrict] = useState<string | null>(null);

  useEffect(() => {
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const uData = JSON.parse(userDataStr);
        setAdminRole(uData.role || 'district_admin');
        setAssignedDistrict(uData.assignedDistrict || null);
      } catch (e) {
        console.error('Error parsing userData', e);
      }
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const userDataStr = localStorage.getItem('userData');
      let districtParam = '';
      if (userDataStr) {
        const uData = JSON.parse(userDataStr);
        if (uData.role === 'district_admin' && uData.assignedDistrict) {
          districtParam = `?district=${encodeURIComponent(uData.assignedDistrict)}`;
        }
      }

      const res = await fetch(`/api/getnewsignup${districtParam}`);
      if (!res.ok) throw new Error('Failed to fetch citizen registrations');
      const data = await res.json();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped = (data.users || []).map((u: any) => ({
        id: u._id,
        firstName: u.firstName || '',
        middleName: u.middleName || '',
        lastName: u.lastName || '',
        userId: u.userId || '',
        email: u.email || '',
        contactNumber: u.contactNumber || '',
        age: u.age || 0,
        gender: u.gender || '',
        district: u.district || 'Assam',
        revenueCircle: u.revenueCircle || '',
        villageWard: u.villageWard || '',
        verified: !!u.verified,
        createdAt: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Recent',
      })).reverse();

      setUsers(mapped);
    } catch (err: unknown) {
      console.error('Error fetching users:', err);
      setError('Failed to load registered citizens.');
    } finally {
      setLoading(false);
    }
  };

  const verifyUser = async (id: string) => {
    try {
      const res = await fetch('/api/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: id }),
      });

      if (!res.ok) throw new Error('Verification failed.');

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, verified: true } : u))
      );
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser((prev) => (prev ? { ...prev, verified: true } : null));
      }

      setToastMessage({ message: 'Citizen profile verified successfully.', isError: false });
    } catch (err: unknown) {
      console.error('Verification error:', err);
      setToastMessage({ message: 'Failed to verify citizen profile.', isError: true });
    }
  };

  const filteredUsers = users.filter((u) => {
    const fullName = `${u.firstName} ${u.middleName} ${u.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      u.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.contactNumber.includes(searchQuery);

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Verified' && u.verified) ||
      (statusFilter === 'Unverified' && !u.verified);

    return matchesSearch && matchesStatus;
  });

  const verifiedCount = users.filter((u) => u.verified).length;
  const unverifiedCount = users.filter((u) => !u.verified).length;

  return (
    <AdminRouteProtection>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
        <AdminNavbar currentTab="user" />

        <main className="container mx-auto px-4 sm:px-8 py-8 flex-grow">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Registered Citizens
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {adminRole === 'super_admin'
                  ? 'Statewide citizen directory and identity verification roster'
                  : `Citizens registered under ${assignedDistrict || 'district jurisdiction'}`}
              </p>
            </div>

            <button
              onClick={fetchUsers}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <FaSync className={`text-xs ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Roster</span>
            </button>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button
              onClick={() => setStatusFilter('All')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Citizens <span className="ml-1 opacity-75">({users.length})</span>
            </button>

            <button
              onClick={() => setStatusFilter('Verified')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Verified'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Verified <span className="ml-1">({verifiedCount})</span>
            </button>

            <button
              onClick={() => setStatusFilter('Unverified')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'Unverified'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Unverified / Pending <span className="ml-1">({unverifiedCount})</span>
            </button>
          </div>

          {/* Search bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 mb-6">
            <div className="relative w-full max-w-md">
              <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search by citizen name, user ID, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-16 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-3"></div>
              <p className="text-xs text-slate-500">Loading citizen directory...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-xs">
              {error}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <FaUsers className="text-lg" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No citizens found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                No citizen profiles matched your filter criteria.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Citizen Profile</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">District / Area</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4">Registered</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((u) => {
                      const fullName = `${u.firstName} ${u.lastName}`.trim() || 'Citizen';
                      const initials = `${u.firstName?.[0] || ''}${u.lastName?.[0] || ''}`.toUpperCase() || 'C';

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-200">
                                {initials}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">{fullName}</div>
                                <div className="text-[11px] text-slate-400">
                                  {u.district} Resident
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-900 flex items-center gap-1.5">
                              <FaPhoneAlt className="text-[10px] text-slate-400" />
                              <span>{u.contactNumber || 'No phone'}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                              <FaEnvelope className="text-[10px] text-slate-400" />
                              <span className="truncate max-w-[180px]">{u.email || 'No email'}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-slate-900 font-medium">{u.district || 'Assam'}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <FaMapMarkerAlt className="text-[9px] text-slate-400" />
                              <span>{u.villageWard || u.revenueCircle || 'District jurisdiction'}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                                u.verified
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  u.verified ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                              ></span>
                              {u.verified ? 'Verified' : 'Pending Verification'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-500">
                            <div className="flex items-center gap-1 text-[11px]">
                              <FaCalendarAlt className="text-[10px] text-slate-400" />
                              <span>{u.createdAt}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedUser(u)}
                                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Details
                              </button>

                              {!u.verified && (
                                <button
                                  onClick={() => verifyUser(u.id)}
                                  className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <FaCheck className="text-[10px]" />
                                  <span>Verify</span>
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

        {/* User Details Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-y-auto border border-slate-200">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Citizen Profile Details</h2>
                  <p className="text-xs text-slate-500">
                    {selectedUser.district} Jurisdiction • Resident Profile
                  </p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-xs text-slate-600 font-medium">Verification Status:</span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedUser.verified
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {selectedUser.verified ? 'Verified Citizen' : 'Pending Verification'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Full Name</span>
                    <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                      {`${selectedUser.firstName} ${selectedUser.middleName} ${selectedUser.lastName}`.trim() || 'N/A'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Contact Phone</span>
                    <span className="font-semibold text-slate-900 text-sm mt-0.5 block">
                      {selectedUser.contactNumber || 'N/A'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Email Address</span>
                    <span className="font-medium text-slate-800 mt-0.5 block break-all">
                      {selectedUser.email || 'N/A'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Age & Gender</span>
                    <span className="font-medium text-slate-800 mt-0.5 block">
                      {selectedUser.age || 'N/A'} yrs • {selectedUser.gender || 'Not specified'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">District</span>
                    <span className="font-medium text-slate-800 mt-0.5 block">
                      {selectedUser.district || 'Assam'}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-slate-500 block text-[11px]">Village / Ward</span>
                    <span className="font-medium text-slate-800 mt-0.5 block">
                      {selectedUser.villageWard || selectedUser.revenueCircle || 'N/A'}
                    </span>
                  </div>
                </div>

                {!selectedUser.verified && (
                  <div className="pt-4 border-t border-slate-200 flex justify-end">
                    <button
                      onClick={() => verifyUser(selectedUser.id)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <FaCheck className="text-xs" />
                      <span>Verify Citizen Profile</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 max-w-xs w-full z-50">
            <div
              className={`rounded-xl p-3.5 shadow-lg border text-xs flex items-center justify-between gap-2 ${
                toastMessage.isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <span>{toastMessage.message}</span>
              <button
                onClick={() => setToastMessage(null)}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminRouteProtection>
  );
};

export default AdminUser;
