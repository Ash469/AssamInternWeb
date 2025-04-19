'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import NavBar from '../../components/nav_bar';
import { FaFileAlt, FaCloudUploadAlt, FaChevronLeft } from 'react-icons/fa';

const NewApplicationPage = () => {
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    contactNumber: '',
    gender: '',
    district: '',
    revenueCircle: '',
    category: '',
    villageWard: '',
    remarks: '',
    documentUrl: '',
  });

  // Add file upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false); // Track successful submissions

  //const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

  // Districts in Assam
  const districts = [
    'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo',
    'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao',
    'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup',
    'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar',
    'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar',
    'Sonitpur', 'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'
  ];

  // Categories
  const categories = [
    'Administration', 'Legal', 'Business', 'Disaster Relief', 'Finance', 'Education', 'Other'
  ];

  // Village/Ward types
  const villageWards = ['Village', 'Ward'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        setUploadStatus('Error: Please select an image file only (JPG, PNG, etc.)');
        return;
      }
      
      setSelectedFile(file);
      setUploadStatus(`Selected: ${file.name}`);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Upload file to Cloudinary
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setUploadStatus('Uploading document to cloud...');

    try {
      const cloudName = 'dwdjnzla2'; // Your Cloudinary cloud name
      const uploadPreset = 'assamoffice'; // Your upload preset

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload document');
      }

      const data = await response.json();
      setUploadStatus('Document uploaded successfully!');
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      setUploadStatus('Error uploading document');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSubmitSuccess(false); // Reset success state

    try {
      let documentUrl = form.documentUrl;

      // Upload file if selected
      if (selectedFile) {
        documentUrl = await uploadToCloudinary(selectedFile) || '';
        
        if (!documentUrl) {
          throw new Error('Failed to upload document');
        }
      } else {
        throw new Error('Please select a document to upload');
      }

      // Create payload with the document URL from Cloudinary
      const payload = {
        ...form,
        documentUrl,
        age: parseInt(form.age, 10) || 0
      };

      // Log the payload for debugging
      console.log('Sending payload:', payload);

      // Changed the API endpoint to match the Flutter app
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', res.status);
      
      let data;
      const contentType = res.headers.get('content-type');
      
      // Check if response is JSON
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
        console.log('Response data:', data);
      } else {
        // Handle non-JSON responses
        const text = await res.text();
        console.error('Non-JSON response:', text);
        throw new Error('Server returned an invalid response. Please try again later.');
      }

      // Check for success status code (201 Created - same as Flutter)
      if (res.status === 201) {
        setMessage('Application submitted successfully!');
        setSubmitSuccess(true); // Set success state to true
        // Reset form
        setForm({
          fullName: '',
          age: '',
          contactNumber: '',
          gender: '',
          district: '',
          revenueCircle: '',
          category: '',
          villageWard: '',
          remarks: '',
          documentUrl: '',
        });
        setSelectedFile(null);
        setUploadStatus('');
      } else {
        throw new Error(data?.error || `Request failed with status ${res.status}`);
      }
    } catch (error: unknown) {
      console.error('Submission error:', error);
      setMessage(`❌ ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
      setSubmitSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <NavBar />

      {/* Hero Section */}
      <section className="bg-teal-800 text-white py-10 px-6 md:px-16 flex flex-col md:flex-row items-center justify-between relative">
        {/* Back Button */}
        <Link href="/userdashboard" className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center text-white bg-teal-700 hover:bg-teal-600 transition-colors px-3 py-2 rounded-lg border border-teal-500 shadow-md">
          <FaChevronLeft className="mr-1" />
          <span className="font-medium">Back</span>
        </Link>
        
        {/* Text content */}
        <div className="w-full md:w-1/2 text-center md:text-left mt-8 md:mt-0">
          <h2 className="text-3xl font-bold mb-4">New Application</h2>
          <p className="text-sm text-white/90">
            Submit your application details in the form below. All fields marked with an asterisk (*) are required.
          </p>
        </div>

        {/* Placeholder image */}
        <div className="w-full md:w-1/2 flex justify-center mt-6 md:mt-0">
          <div className="w-64 h-40 bg-white/20 rounded-lg border border-white/50 flex items-center justify-center">
            <FaFileAlt className="text-4xl text-white/80" />
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-10 px-6 md:px-16">
        <div className="max-w-5xl mx-auto">
          {message && !submitSuccess && (
            <div className="mb-8 p-4 rounded bg-red-100 text-red-700 text-center">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-teal-800 mb-6 border-b border-teal-200 pb-2">Personal Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="form-group">
                  <label htmlFor="fullName" className="block text-gray-700 mb-1 font-medium">Full Name <span className="text-red-500">*</span></label>
                  <input 
                    id="fullName"
                    type="text" 
                    name="fullName" 
                    placeholder="Enter your full name" 
                    value={form.fullName} 
                    onChange={handleChange} 
                    className="w-full py-2 border-b-2 border-teal-500 bg-transparent focus:outline-none focus:border-teal-700 transition-colors" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="age" className="block text-gray-700 mb-1 font-medium">Age <span className="text-red-500">*</span></label>
                  <input 
                    id="age"
                    type="number" 
                    name="age" 
                    placeholder="Enter your age" 
                    value={form.age} 
                    onChange={handleChange} 
                    className="w-full py-2 border-b-2 border-teal-500 bg-transparent focus:outline-none focus:border-teal-700 transition-colors" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="contactNumber" className="block text-gray-700 mb-1 font-medium">Contact Number <span className="text-red-500">*</span></label>
                  <input 
                    id="contactNumber"
                    type="text" 
                    name="contactNumber" 
                    placeholder="Enter your contact number" 
                    value={form.contactNumber} 
                    onChange={handleChange} 
                    className="w-full py-2 border-b-2 border-teal-500 bg-transparent focus:outline-none focus:border-teal-700 transition-colors" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="gender" className="block text-gray-700 mb-1 font-medium">Gender <span className="text-red-500">*</span></label>
                  <select 
                    id="gender"
                    name="gender" 
                    value={form.gender} 
                    onChange={handleChange} 
                    className="w-full py-2 border-b-2 border-teal-500 bg-transparent focus:outline-none focus:border-teal-700 transition-colors" 
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Address Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-teal-800 mb-6 border-b border-teal-200 pb-2">Address Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="form-group">
                  <label htmlFor="district" className="block text-gray-700 mb-1 font-medium">District <span className="text-red-500">*</span></label>
                  <select 
                    id="district"
                    name="district" 
                    value={form.district} 
                    onChange={handleChange} 
                    className="w-full py-2 border-b-2 border-teal-500 bg-transparent focus:outline-none focus:border-teal-700 transition-colors" 
                    required
                  >
                    <option value="">Select district</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="revenueCircle" className="block text-gray-700 mb-1 font-medium">Revenue Circle <span className="text-red-500">*</span></label>
                  <input 
                    id="revenueCircle"
                    type="text" 
                    name="revenueCircle" 
                    placeholder="Enter your revenue circle" 
                    value={form.revenueCircle} 
                    onChange={handleChange} 
                    className="w-full py-2 border-b-2 border-teal-500 bg-transparent focus:outline-none focus:border-teal-700 transition-colors" 
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="villageWard" className="block text-gray-700 mb-1 font-medium">Village/Ward <span className="text-red-500">*</span></label>
                  <select 
                    id="villageWard"
                    name="villageWard" 
                    value={form.villageWard} 
                    onChange={handleChange} 
                    className="w-full py-2 border-b-2 border-teal-500 bg-transparent focus:outline-none focus:border-teal-700 transition-colors" 
                    required
                  >
                    <option value="">Select type</option>
                    {villageWards.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="category" className="block text-gray-700 mb-1 font-medium">Category <span className="text-red-500">*</span></label>
                  <select 
                    id="category"
                    name="category" 
                    value={form.category} 
                    onChange={handleChange} 
                    className="w-full py-2 border-b-2 border-teal-500 bg-transparent focus:outline-none focus:border-teal-700 transition-colors" 
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Additional Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-medium text-teal-800 mb-6 border-b border-teal-200 pb-2">Additional Information</h3>
              
              <div className="space-y-6">
                <div className="form-group">
                  <label htmlFor="remarks" className="block text-gray-700 mb-1 font-medium">Remarks</label>
                  <textarea 
                    id="remarks"
                    name="remarks" 
                    placeholder="Add any additional remarks or notes" 
                    value={form.remarks} 
                    onChange={handleChange} 
                    className="w-full py-2 border-b-2 border-teal-500 bg-transparent focus:outline-none focus:border-teal-700 transition-colors min-h-[80px]" 
                  />
                </div>
                
                <div className="form-group">
                  <label className="block text-gray-700 mb-1 font-medium">Image Upload <span className="text-red-500">*</span></label>
                  <div 
                    onClick={triggerFileInput}
                    className="w-full cursor-pointer flex items-center border-b-2 border-teal-500 bg-transparent focus:outline-none focus:border-teal-700 transition-colors"
                  >
                    <div className="flex items-center mt-2 mb-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                        <FaCloudUploadAlt className="text-2xl text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm ${selectedFile ? 'text-teal-600 font-medium' : 'text-gray-500'}`}>
                          {selectedFile ? selectedFile.name : 'Click to select an image (JPG, PNG, GIF)'}
                        </p>
                        {uploadStatus && (
                          <p className={`text-xs mt-1 ${uploadStatus.includes('Error') ? 'text-red-500' : 'text-gray-500'}`}>
                            {uploadStatus}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="hidden" 
                    required
                  />
                </div>
              </div>
            </div>

            {/* Success Message - displays above submit button */}
            {submitSuccess && (
              <div className="bg-green-100 p-4 rounded-lg border border-green-300 text-center">
                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="text-green-700 font-medium">Application submitted successfully!</span>
                </div>
                <p className="text-green-600 text-sm mt-1">Your application has been received and is being processed.</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={loading || isUploading}
                className="px-12 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                <span className="text-lg font-semibold flex items-center">
                  {(loading || isUploading) ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isUploading ? 'Uploading...' : 'Submitting...'}
                    </>
                  ) : 'Submit Application'}
                </span>
              </button>
            </div>

            <div className="text-center text-xs text-gray-500">
              <p>* Required fields</p>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default NewApplicationPage;
