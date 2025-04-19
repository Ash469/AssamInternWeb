'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaEye, FaCheck, FaTimes, FaSync, FaFilter } from 'react-icons/fa';
import Image from 'next/image';

// First update the interface to match the backend response fields
interface Application {
  id: string;
  fullName: string;
  age: number;
  contactNumber: string; // Will map from phoneNo
  gender: string;
  occupation: string; // Add this field
  district: string;
  revenueCircle: string;
  category: string;
  villageWard: string;
  remarks: string;
  documentUrl: string;
  status: string;
  date: string; // Will map from createdAt
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

   //const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:10000/api';
  //  const apiUrl = 'http://localhost:10000';

  useEffect(() => {
    fetchApplications();
  }, []);

  // Then update the fetchApplications function
  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/applications');
      
      // Map backend fields to our interface fields
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedData = res.data.data.map((item: any) => ({
        id: item._id,
        fullName: item.fullName || '',
        age: item.age || 0,
        contactNumber: item.phoneNo || '', // Map phoneNo to contactNumber
        gender: item.gender || '',
        occupation: item.occupation || '',
        district: item.district || '',
        revenueCircle: item.revenueCircle || '',
        category: item.category || '',
        villageWard: item.villageWard || '',
        remarks: item.remarks || '',
        documentUrl: item.documentUrl || '',
        status: item.status || 'Pending',
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '', // Format the date
      }));
      
      setApplications(mappedData);
      setError(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: unknown) {
      setError('Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    console.log('Updating status with:', { id, status }); // For debugging
    
    if (!id) {
      alert('Invalid application ID');
      return;
    }

    try {
      // Note: The URL is different - no ID in the path
      const response = await axios.put('/api/applications', {
        applicationId: id,
        status: status
      });
      
      if (response.status === 200) {
        alert(`Application status updated to ${status}`);
        await fetchApplications();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error('Error updating status:', err.response?.data || err.message);
        alert(`Error updating status: ${err.response?.data?.error || 'Please try again'}`);
      } else {
        console.error('Error updating status:', err);
        alert('An unexpected error occurred');
      }
    }
  };

  // Filter applications based on selected filters
  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter;
    return matchesStatus && matchesCategory;
  });

  // Get unique categories from applications
  const categories = ['all', ...new Set(applications.map(app => app.category))];
  const statuses = ['all', 'Pending', 'Approved', 'Rejected'];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <header 
        className="relative min-h-[300px] sm:h-[400px] bg-cover bg-center" 
        style={{ 
          background: "linear-gradient(rgba(13, 148, 136, 0.9), rgba(13, 148, 136, 0.8))"
        }}
      >
            <div className="container mx-auto px-4 sm:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center py-6"></div>
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-4 border-white shadow-2xl overflow-hidden">
                <Image 
                  src="/logo.jpg" 
                  alt="Logo"
                  fill
                  sizes="(max-width: 640px) 96px, 128px"
                  style={{ objectFit: 'cover' }}
                  priority
                />
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-4">
              <div className="mt-4 sm:mt-0 sm:ml-4">
                <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-wide">
                  Application Management
                </h1>
                <p className="text-xl sm:text-2xl text-teal-100 mt-2">
                  Admin Dashboard
                </p>
              </div>
            </div>
            
            <button 
              onClick={fetchApplications}
              className="mt-6 sm:mt-0 bg-white/10 hover:bg-white/20 text-white px-6 sm:px-8 py-3 rounded-lg flex items-center gap-3 backdrop-blur-sm transition-all border-2 border-white/20 shadow-lg w-full sm:w-auto justify-center"
            >
              <FaSync className="text-xl sm:text-2xl" />
              <span className="text-base sm:text-lg font-semibold">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative -mt-20 sm:-mt-32 z-10 container mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
              Applications List
            </h2>
            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <FaFilter className="text-teal-600 min-w-[1rem]" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-white w-full sm:w-auto"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <FaFilter className="text-teal-600 min-w-[1rem]" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm bg-white w-full sm:w-auto"
                >
                  {statuses.map(status => (
                    <option key={status} value={status}>
                      {status === 'all' ? 'All Statuses' : status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Loading and Error States */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
              {error}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No applications found.
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {filteredApplications.map((app, index) => (
                <div 
                  key={app.id} 
                  className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        #{index + 1}
                      </span>
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                        app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                    
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {app.fullName}
                      </h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          Category: <span className="font-medium">{app.category}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          Date: {app.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 sm:gap-2 pt-3 border-t"> {/* Reduced gap on mobile */}
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs sm:text-sm"
                      >
                        <FaEye className="mr-1 sm:mr-2" />
                        View
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, 'Approved')}
                        className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs sm:text-sm"
                      >
                        <FaCheck className="mr-1 sm:mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => updateStatus(app.id, 'Rejected')}
                        className="flex-1 flex items-center justify-center px-2 sm:px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs sm:text-sm"
                      >
                        <FaTimes className="mr-1 sm:mr-2" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal with improved responsive design */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-teal-800">
                Application Details
              </h2>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <FaTimes />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem label="ID" value={selectedApp.id} />
                <DetailItem label="Full Name" value={selectedApp.fullName} />
                <DetailItem label="Age" value={selectedApp.age.toString()} />
                <DetailItem label="Gender" value={selectedApp.gender} />
                <DetailItem label="Occupation" value={selectedApp.occupation} />
                <DetailItem label="Contact" value={selectedApp.contactNumber} />
                <DetailItem label="District" value={selectedApp.district} />
                <DetailItem label="Revenue Circle" value={selectedApp.revenueCircle} />
                <DetailItem label="Village/Ward" value={selectedApp.villageWard} />
                <DetailItem label="Category" value={selectedApp.category} />
                <DetailItem label="Status" value={selectedApp.status} />
                <DetailItem label="Date" value={selectedApp.date} />
                <DetailItem label="Remarks" value={selectedApp.remarks || 'None'} />
              </div>
              
              {selectedApp.documentUrl && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">Documents</h3>
                  <a
                    href={selectedApp.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-600 hover:text-teal-800 underline"
                  >
                    View Document
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for detail items
const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value}</dd>
  </div>
);
