'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NavBar from '../../components/nav_bar';
import Footer from '@/app/components/footer';
import { FaCloudUploadAlt, FaChevronLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import jwt_decode from 'jwt-decode';

export default function NewApplicationPage() {
  const [form, setForm] = useState({
    fullName: '',
    age: '',
    contactNumber: '',
    gender: 'Male',
    district: '',
    revenueCircle: '',
    category: '',
    villageWard: 'Ward',
    specificLocation: '',
    problemTitle: '',
    description: '',
    remarks: '',
    documentUrl: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userId, setUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const router = useRouter();

  // Load user profile & session
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/userlogin');
      return;
    }

    try {
      const storedUserId = localStorage.getItem('userId');
      const profileStr = localStorage.getItem('userProfile');

      let extractedId = storedUserId;

      if (!extractedId) {
        try {
          const decoded = jwt_decode(token) as { id?: string; userId?: string; _id?: string; sub?: string };
          extractedId = decoded.id || decoded.userId || decoded._id || decoded.sub || null;
        } catch (e) {
          console.error('Error decoding token', e);
        }
      }

      if (extractedId) {
        setUserId(extractedId);
        localStorage.setItem('userId', extractedId);
      }

      // Prefill user information if present in userProfile
      if (profileStr) {
        try {
          const u = JSON.parse(profileStr);
          setForm((prev) => ({
            ...prev,
            fullName: prev.fullName || u.fullName || (u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : ''),
            contactNumber: prev.contactNumber || u.contactNumber || u.phone || u.phoneNumber || '',
            district: prev.district || u.district || '',
            age: prev.age || (u.age ? u.age.toString() : ''),
            gender: prev.gender || u.gender || 'Male',
          }));
        } catch (e) {
          console.error('Error parsing profile', e);
        }
      }
    } catch (err) {
      console.error('Session retrieval error', err);
    }
  }, [router]);

  const districts = [
    'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar', 'Charaideo',
    'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh', 'Dima Hasao',
    'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat', 'Kamrup',
    'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar',
    'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar',
    'Sonitpur', 'South Salmara-Mankachar', 'Tinsukia', 'Udalguri', 'West Karbi Anglong'
  ];

  const categories = [
    'Roads & Infrastructure',
    'Drinking Water Supply',
    'Electricity & Power',
    'Flood & Disaster Relief',
    'Healthcare & Hospitals',
    'Education & Schools',
    'Sanitation & Drainage',
    'Public Safety & Police',
    'Welfare Schemes & Pension',
    'Administration & Revenue',
    'Agriculture & Irrigation',
    'Others'
  ];

  const villageWards = ['Village', 'Ward', 'Panchayat', 'Municipal Block', 'Township'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const uploadEvidenceFile = async (
    file: File
  ): Promise<{ storagePath: string } | null> => {
    setIsUploading(true);
    setUploadStatus('Preparing upload...');

    try {
      const effectiveUserId = userId || localStorage.getItem('userId') || form.contactNumber;

      // Method 1: Signed Upload URL direct to storage
      try {
        setUploadStatus('Authorizing storage upload...');
        const signRes = await fetch('/api/uploads/sign', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size,
            userId: effectiveUserId,
            district: form.district,
            fullName: form.fullName,
            category: form.category,
          }),
        });

        const signData = await signRes.json();
        if (signRes.ok && signData.success && signData.data?.signedUrl) {
          const { signedUrl, storagePath, headers } = signData.data;

          setUploadStatus('Uploading file directly to private storage...');
          const uploadRes = await fetch(signedUrl, {
            method: 'PUT',
            headers: headers || {
              'Content-Type': file.type || 'application/octet-stream',
            },
            body: file,
          });

          if (uploadRes.ok) {
            setUploadStatus('Attached file uploaded successfully!');
            return { storagePath };
          }
          console.warn('Direct signed upload PUT returned status:', uploadRes.status, 'falling back to server upload...');
        } else {
          console.warn('Signed upload URL request failed:', signData?.error, 'falling back to server upload...');
        }
      } catch (signErr) {
        console.warn('Signed upload URL flow error:', signErr, 'trying server upload fallback...');
      }

      // Method 2: Resilient server-side upload fallback
      setUploadStatus('Uploading file through server tunnel...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', effectiveUserId);
      formData.append('district', form.district);
      formData.append('fullName', form.fullName);
      formData.append('category', form.category);

      const serverRes = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const serverData = await serverRes.json();
      if (serverRes.ok && serverData.success && serverData.data?.storagePath) {
        setUploadStatus('Attached file uploaded successfully!');
        return { storagePath: serverData.data.storagePath };
      }

      throw new Error(serverData?.error || 'All upload methods failed');
    } catch (error: any) {
      console.error('File upload failed:', error);
      setUploadStatus(`Upload error: ${error.message || 'Failed to upload'}`);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setSubmitSuccess(false);

    if (form.contactNumber.length !== 10) {
      setMessage('Contact number must be exactly 10 digits');
      setLoading(false);
      return;
    }

    try {
      let documentUrl = form.documentUrl;
      let storagePath = '';
      if (selectedFile) {
        const uploadResult = await uploadEvidenceFile(selectedFile);
        if (!uploadResult || !uploadResult.storagePath) {
          setMessage('Unable to upload your attached image/document. Grievance was not submitted. Please try again.');
          setLoading(false);
          return;
        }
        // Store the relative object path in MongoDB
        documentUrl = uploadResult.storagePath;
        storagePath = uploadResult.storagePath;
      }

      // Consolidate title and remarks
      const problemTitle = form.problemTitle.trim() || form.remarks.trim().substring(0, 60) || `${form.category} Grievance`;
      const description = form.description.trim() || form.remarks.trim();
      const remarks = form.remarks.trim() || description;

      const effectiveUserId = userId || localStorage.getItem('userId') || form.contactNumber;

      const payload = {
        ...form,
        problemTitle,
        description,
        remarks,
        documentUrl,
        storagePath,
        age: parseInt(form.age, 10) || 30,
        createdBy: effectiveUserId,
      };

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Application submitted successfully!');
        setSubmitSuccess(true);
        setShowSuccessPopup(true);

        setTimeout(() => {
          router.push('/application/status');
        }, 2000);
      } else {
        throw new Error(data.error || 'Failed to submit grievance');
      }
    } catch (error: any) {
      console.error('Submission error:', error);
      setMessage(error.message || 'An error occurred while submitting your grievance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <NavBar />

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Grievance Registered Successfully</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Your application has been logged into the district administration redressal queue.
            </p>
            <p className="text-[11px] text-slate-400 mt-4">
              Redirecting to your application tracking page...
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <Link href="/" className="hover:text-slate-900">Portal Home</Link>
              <span>/</span>
              <Link href="/application/status" className="hover:text-slate-900">My Applications</Link>
              <span>/</span>
              <span className="text-slate-800 font-semibold">New Grievance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Register Civic Grievance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Submit details directly to your district administration authorities.
            </p>
          </div>

          <Link
            href="/application/status"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs self-start sm:self-auto"
          >
            <FaChevronLeft className="text-[10px]" />
            <span>Back to Applications</span>
          </Link>
        </div>

        {/* Error message */}
        {message && !submitSuccess && (
          <div className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5">
            <FaExclamationCircle className="text-sm shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Section 1: Grievance Summary & Category */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">1. Grievance Classification</h2>
              <p className="text-xs text-slate-500 mt-0.5">Specify category and summarize the problem.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                >
                  <option value="">Select grievance category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Problem Headline / Subject <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="problemTitle"
                  placeholder="e.g. Broken drainage culvert causing waterlogging"
                  value={form.problemTitle}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Detailed Description of the Issue <span className="text-rose-500">*</span>
              </label>
              <textarea
                name="description"
                rows={4}
                placeholder="Provide specific details about the issue, affected residents, duration, and urgency..."
                value={form.description}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 resize-y"
              />
            </div>
          </div>

          {/* Section 2: Location & Jurisdiction */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">2. Geographic Location in Assam</h2>
              <p className="text-xs text-slate-500 mt-0.5">District authorities route grievances based on administrative revenue circles.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  District <span className="text-rose-500">*</span>
                </label>
                <select
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                >
                  <option value="">Select district</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Revenue Circle <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="revenueCircle"
                  placeholder="e.g. Dibrugarh West / Dispur Circle"
                  value={form.revenueCircle}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Area Classification <span className="text-rose-500">*</span>
                </label>
                <select
                  name="villageWard"
                  value={form.villageWard}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                >
                  {villageWards.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Specific Landmark / Ward / Spot
                </label>
                <input
                  type="text"
                  name="specificLocation"
                  placeholder="e.g. Near LP School Ghat, Ward 4"
                  value={form.specificLocation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Applicant Details */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">3. Citizen Identification</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pre-filled from your registered citizen profile.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Your full name"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Mobile <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="contactNumber"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={form.contactNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Age</label>
                  <input
                    type="text"
                    name="age"
                    placeholder="e.g. 35"
                    maxLength={2}
                    value={form.age}
                    onChange={handleChange}
                    className="w-full px-2 py-2 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Photo or Evidence Attachment */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900">4. Attach Supporting Evidence (Optional)</h2>
              <p className="text-xs text-slate-500 mt-0.5">Upload a clear photo of the site, damage, or relevant notice.</p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="hidden"
            />

            <div
              onClick={triggerFileInput}
              className="border-2 border-dashed border-slate-300 hover:border-slate-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-slate-50"
            >
              <FaCloudUploadAlt className="text-3xl text-slate-400 mx-auto mb-2" />
              {selectedFile ? (
                <div>
                  <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Click to change file
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-semibold text-slate-700">Click to upload photo or document</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or PDF up to 10MB</p>
                </div>
              )}
            </div>

            {uploadStatus && (
              <p className="text-xs text-slate-600 font-medium">{uploadStatus}</p>
            )}
          </div>

          {/* Submission Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/application/status"
              className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={loading || isUploading}
              className="px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Submitting Grievance...</span>
                </>
              ) : (
                <span>Submit Official Grievance</span>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
