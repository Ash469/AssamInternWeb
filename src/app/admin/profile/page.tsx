'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaUserShield,
  FaSignOutAlt,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaShieldAlt,
} from 'react-icons/fa';
import Footer from '@/app/components/footer';
import AdminNavbar from '@/app/components/AdminNavbar';
import AdminRouteProtection from '@/app/components/AdminRouteProtection';

export default function AdminProfilePage() {
  const router = useRouter();
  const [adminData, setAdminData] = useState<{
    name: string;
    email: string;
    role: string;
    phone: string;
    assignedDistrict: string | null;
  }>({
    name: 'Administrator',
    email: '',
    role: 'district_admin',
    phone: '',
    assignedDistrict: null,
  });

  useEffect(() => {
    const userDataStr = localStorage.getItem('userData');
    if (userDataStr) {
      try {
        const u = JSON.parse(userDataStr);
        setAdminData({
          name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Administrator',
          email: u.email || u.username || '',
          role: u.role || 'district_admin',
          phone: u.phone || u.contactNumber || 'Not specified',
          assignedDistrict: u.assignedDistrict || null,
        });
      } catch (e) {
        console.error('Error parsing admin data:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('adminToken');
    router.push('/admin/adminlogin');
  };

  return (
    <AdminRouteProtection>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
        <AdminNavbar />

        <main className="container mx-auto px-4 sm:px-8 py-10 flex-grow flex items-center justify-center">
          <div className="max-w-xl w-full bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header info */}
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl font-bold shadow-sm">
                <FaUserShield />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                    {adminData.name}
                  </h1>
                  <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
                    Official
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">
                  Role: {adminData.role === 'super_admin' ? 'Central Super Administrator' : 'District Administrator'}
                </p>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="p-6 sm:p-8 space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Assigned Credentials & Scope
              </h2>

              <div className="grid grid-cols-1 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-xs">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Jurisdiction Scope</span>
                    <span className="font-semibold text-slate-900 text-xs">
                      {adminData.assignedDistrict ? `${adminData.assignedDistrict} District` : 'Statewide (All Districts)'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-xs">
                    <FaEnvelope />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Official Email</span>
                    <span className="font-semibold text-slate-900 text-xs">
                      {adminData.email || 'Not specified'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-xs">
                    <FaPhone />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Contact Information</span>
                    <span className="font-semibold text-slate-900 text-xs">
                      {adminData.phone}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-xs">
                    <FaShieldAlt />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Access Control Level</span>
                    <span className="font-semibold text-slate-900 text-xs">
                      District Grievance Resolution & Citizen Verification
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FaSignOutAlt className="text-xs" />
                  <span>Terminate Session & Logout</span>
                </button>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </AdminRouteProtection>
  );
}
