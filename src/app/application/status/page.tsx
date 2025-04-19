'use client'
import { useState, useEffect } from 'react';
import Link from 'next/link';
import NavBar from '../../components/nav_bar';
import { FaFilter, FaDownload, FaEye, FaChevronLeft } from 'react-icons/fa';

interface Application {
  id: string;
  fullName: string;
  category: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  createdAt: string;
  documentUrl?: string;
  age?: number;
  gender?: string;
  contactNumber?: string;
  district?: string;
  revenueCircle?: string;
  villageWard?: string;
}

export default function ApplicationStatus() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApps, setFilteredApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  //const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

  // Fetch Applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await fetch('/api/applications');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setApplications(data.data || []);
        setFilteredApps(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Handle filters
  useEffect(() => {
    let result = [...applications];
    
    if (statusFilter) {
      result = result.filter(app => app.status === statusFilter);
    }
    
    if (categoryFilter) {
      result = result.filter(app => app.category === categoryFilter);
    }
    
    setFilteredApps(result);
  }, [statusFilter, categoryFilter, applications]);

  const resetFilters = () => {
    setStatusFilter(null);
    setCategoryFilter(null);
    setFilteredApps(applications);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-500 text-white';
      case 'Pending': return 'bg-amber-500 text-white';
      case 'Rejected': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const toggleFilters = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <NavBar />

      {/* Hero Section */}
      <section className="bg-teal-800 text-white py-8 px-6 md:px-16 relative">
        {/* Back Button */}
        <Link href="/userdashboard" className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center text-white bg-teal-700 hover:bg-teal-600 transition-colors px-3 py-2 rounded-lg border border-teal-500 shadow-md">
          <FaChevronLeft className="mr-1" />
          <span className="font-medium">Back</span>
        </Link>
        
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold">Application Status</h1>
          <p className="mt-2 text-teal-100">Track and manage your application progress</p>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-white border-b py-4 px-6 md:px-16 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-lg font-medium text-teal-800">
            {filteredApps.length} {filteredApps.length === 1 ? 'Application' : 'Applications'}
          </div>
          
          <div className="relative">
            <button 
              onClick={toggleFilters}
              className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              <FaFilter />
              <span>Filter</span>
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg p-4 z-20 border border-gray-200">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    value={statusFilter || ''}
                    onChange={(e) => setStatusFilter(e.target.value || null)}
                  >
                    <option value="">All Statuses</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    value={categoryFilter || ''}
                    onChange={(e) => setCategoryFilter(e.target.value || null)}
                  >
                    <option value="">All Categories</option>
                    <option value="Business">Business</option>
                    <option value="Education">Education</option>
                    <option value="Health">Health</option>
                    <option value="Administration">Administration</option>
                    <option value="Employment">Employment</option>
                    <option value="Disaster Relief">Disaster Relief</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={resetFilters}
                    className="px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 mr-2"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="px-3 py-1 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-gray-100 py-8 px-6 md:px-16 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600"></div>
            </div>
          ) : error ? (
            <div className="rounded-md bg-red-50 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-600">No applications found matching your criteria.</p>
              {(statusFilter || categoryFilter) && (
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((application) => (
                <div key={application.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white mr-3">
                        <span className="font-medium">
                          {application.fullName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{application.fullName}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status}
                    </span>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Category</p>
                        <p className="text-sm font-medium">{application.category}</p>
                      </div>
                      {application.district && (
                        <div>
                          <p className="text-xs text-gray-500">District</p>
                          <p className="text-sm font-medium">{application.district}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Card Actions */}
                    <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => setSelectedApp(application)}
                        className="flex items-center text-sm text-teal-600 hover:text-teal-800"
                      >
                        <FaEye className="mr-1" /> View Details
                      </button>
                      {application.documentUrl && (
                        <a
                          href={application.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-teal-600 hover:text-teal-800"
                        >
                          <FaDownload className="mr-1" /> Download
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* View Details Modal */}
      {selectedApp && (
        <div className="fixed z-20 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setSelectedApp(null)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              {/* Modal Header */}
              <div className="bg-teal-800 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-white">Application Details</h3>
                  <button 
                    onClick={() => setSelectedApp(null)}
                    className="text-teal-100 hover:text-white"
                  >
                    &times;
                  </button>
                </div>
              </div>
              
              {/* Modal Body */}
              <div className="bg-white px-6 pt-5 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 rounded-full bg-teal-600 flex items-center justify-center text-white mr-4 shadow-md">
                      <span className="text-2xl font-medium">
                        {selectedApp.fullName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xl font-medium text-gray-900">{selectedApp.fullName}</h4>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
                        Application ID: {selectedApp.id ? selectedApp.id.substring(0, 8) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getStatusColor(selectedApp.status)} shadow-sm`}>
                    {selectedApp.status}
                  </span>
                </div>
                
                {/* Grid of detail sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Fixed key warning by separating the conditional rendering from the list */}
                  {/* Personal Details Section */}
                  <div key="personal-details-section" className="bg-gray-50 rounded-lg p-5 shadow-sm">
                    <h5 className="font-medium text-teal-800 border-b border-gray-200 pb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Personal Details
                    </h5>
                    
                    <div className="space-y-3 mt-4">
                      {/* Create an array of valid details first, then map through it */}
                      {(() => {
                        const details = [];
                        if (selectedApp.age !== undefined) {
                          details.push({
                            key: "age",
                            label: "Age:",
                            value: `${selectedApp.age} years`
                          });
                        }
                        if (selectedApp.gender) {
                          details.push({
                            key: "gender",
                            label: "Gender:",
                            value: selectedApp.gender
                          });
                        }
                        if (selectedApp.contactNumber) {
                          details.push({
                            key: "contact",
                            label: "Contact:",
                            value: selectedApp.contactNumber
                          });
                        }
                        return details;
                      })().map(detail => (
                        <div key={detail.key} className="flex">
                          <span className="text-sm text-gray-500 w-1/3">{detail.label}</span>
                          <span className="text-base font-medium">{detail.value}</span>
                        </div>
                      ))}
                      
                      {/* Show message if no personal details available */}
                      {!selectedApp.age && !selectedApp.gender && !selectedApp.contactNumber && (
                        <p className="text-gray-500 italic">No personal details available</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Application Details Section */}
                  <div key="application-details-section" className="bg-gray-50 rounded-lg p-5 shadow-sm">
                    <h5 className="font-medium text-teal-800 border-b border-gray-200 pb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Application Details
                    </h5>
                    
                    <div className="space-y-3 mt-4">
                      <div key="category-detail" className="flex">
                        <span className="text-sm text-gray-500 w-1/3">Category:</span>
                        <span className="text-base font-medium">{selectedApp.category}</span>
                      </div>
                      
                      <div key="date-detail" className="flex">
                        <span className="text-sm text-gray-500 w-1/3">Submitted:</span>
                        <span className="text-base font-medium">{new Date(selectedApp.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Location Details Section */}
                  {(selectedApp.district || selectedApp.revenueCircle || selectedApp.villageWard) && (
                    <div key="location-details-section" className="bg-gray-50 rounded-lg p-5 shadow-sm md:col-span-2">
                      <h5 className="font-medium text-teal-800 border-b border-gray-200 pb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Location Details
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {(() => {
                          const locations = [];
                          if (selectedApp.district) {
                            locations.push({
                              key: "district",
                              label: "District",
                              value: selectedApp.district
                            });
                          }
                          if (selectedApp.revenueCircle) {
                            locations.push({
                              key: "revenue-circle",
                              label: "Revenue Circle",
                              value: selectedApp.revenueCircle
                            });
                          }
                          if (selectedApp.villageWard) {
                            locations.push({
                              key: "village-ward",
                              label: "Village/Ward",
                              value: selectedApp.villageWard
                            });
                          }
                          return locations;
                        })().map(location => (
                          <div key={location.key} className="flex flex-col">
                            <span className="text-sm text-gray-500">{location.label}</span>
                            <span className="text-base font-medium">{location.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Document Preview Section */}
                  {selectedApp.documentUrl && (
                    <div key="document-preview-section" className="md:col-span-2 bg-gray-50 rounded-lg p-5 shadow-sm">
                      <h5 className="font-medium text-teal-800 border-b border-gray-200 pb-2 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Document Preview
                      </h5>
                      
                      <div className="mt-4 flex flex-col items-center">
                        <div className="w-full h-48 bg-gray-200 rounded-lg overflow-hidden">
                          {selectedApp.documentUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={selectedApp.documentUrl} 
                              alt="Document Preview" 
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <a
                          href={selectedApp.documentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                        >
                          <FaDownload className="mr-2" /> Download Document
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}