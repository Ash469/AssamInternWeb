"use client"
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaUserShield, FaUser, FaSignInAlt, FaStream, FaGlobeAmericas } from "react-icons/fa";
import Footer from "./components/footer";

const Home = () => {
  const [selectedRole, setSelectedRole] = useState<'none' | 'admin' | 'user'>('none');
  const [isAnimating, setIsAnimating] = useState(false);

  const handleRoleSelect = (role: 'admin' | 'user') => {
    setIsAnimating(true);
    setSelectedRole(role);
  };

  const handleBack = () => {
    setIsAnimating(false);
    setTimeout(() => setSelectedRole('none'), 300);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-teal-800 py-6 px-8 shadow-lg">
        <h1 className="text-5xl font-bold text-white text-center tracking-wide">
          Office Management System
        </h1>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="relative min-h-[70vh] rounded-xl overflow-hidden shadow-2xl">
          {/* Initial View */}
          <div 
            className={`absolute inset-0 flex transition-transform duration-500 ease-in-out ${
              isAnimating ? 'translate-x-full' : 'translate-x-0'
            }`}
          >
            {/* Left side - Image and Features */}
            <div className="w-1/2 relative bg-teal-700 flex flex-col items-center p-8">
              <div className="relative w-64 h-64 mb-8">
                <Image
                  src="/assam.jpg"
                  alt="Office Dashboard"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                  priority
                />
              </div>
              <h2 className="text-3xl font-bold text-white text-center mb-4">
                Streamline Your Workflow
              </h2>
              <p className="text-white text-center mb-8">
                Manage your office operations efficiently with our comprehensive system
              </p>
              <div className="grid grid-cols-3 gap-6 w-full">
                <Feature icon={<FaSignInAlt />} text="Secure Access" />
                <Feature icon={<FaStream />} text="Seamless Flow" />
                <Feature icon={<FaGlobeAmericas />} text="Anywhere Access" />
              </div>
            </div>

            {/* Right side - Role Selection */}
            <div className="w-1/2 flex items-center justify-center bg-white">
              <div className="space-y-8 p-12 w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-teal-700 mb-12">
                  Select Your Role
                </h2>
                <div className="space-y-6">
                  <button
                    onClick={() => handleRoleSelect('admin')}
                    className="w-full flex items-center p-6 border-2 border-teal-600 rounded-lg hover:bg-teal-50 cursor-pointer transition-all hover:shadow-md"
                  >
                    <FaUserShield className="text-teal-600 text-4xl mr-4" />
                    <div>
                      <h3 className="text-xl font-semibold text-teal-700">Admin</h3>
                      <p className="text-gray-600">Login as administrator</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleRoleSelect('user')}
                    className="w-full flex items-center p-6 border-2 border-teal-600 rounded-lg hover:bg-teal-50 cursor-pointer transition-all hover:shadow-md"
                  >
                    <FaUser className="text-teal-600 text-4xl mr-4" />
                    <div>
                      <h3 className="text-xl font-semibold text-teal-700">User</h3>
                      <p className="text-gray-600">Access as regular user</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Role-specific View */}
          <div 
            className={`absolute inset-0 flex transition-transform duration-500 ease-in-out ${
              isAnimating ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            {/* Left side - Options */}
            <div className="w-1/2 flex items-center justify-center bg-white">
              <div className="max-w-md w-full p-8">
                <div className="flex items-center mb-8">
                  <button 
                    onClick={handleBack}
                    className="text-teal-600 hover:text-teal-800 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                  <h2 className="text-3xl font-bold text-center text-teal-700 flex-1">
                    {selectedRole === 'admin' ? 'Admin Access' : 'User Access'}
                  </h2>
                </div>

                {selectedRole === 'admin' ? (
                  // Admin Login Button
                  <Link href="/admin/adminlogin">
                    <div className="flex items-center justify-center p-6 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer">
                      <FaSignInAlt className="text-2xl mr-2" />
                      <span className="text-xl font-semibold">Login to Admin Dashboard</span>
                    </div>
                  </Link>
                ) : (
                  // User Options
                  <div className="space-y-8">
                    <Link href="/userlogin">
                      <div className="flex items-center p-4 mb-4 border-2 border-teal-600 rounded-lg hover:bg-teal-50 cursor-pointer transition-all hover:shadow-md">
                        <FaSignInAlt className="text-teal-600 text-3xl mr-4" />
                        <div>
                          <h3 className="text-lg font-semibold text-teal-700">Login</h3>
                          <p className="text-gray-600">Access your account</p>
                        </div>
                      </div>
                    </Link>
                    
                    <Link href="/usersignup">
                      <div className="flex items-center p-4 border-2 border-teal-600 rounded-lg hover:bg-teal-50 cursor-pointer transition-all hover:shadow-md">
                        <FaUser className="text-teal-600 text-3xl mr-4" />
                        <div>
                          <h3 className="text-lg font-semibold text-teal-700">Sign Up</h3>
                          <p className="text-gray-600">Create new account</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Right side - Image and Features */}
            <div className="w-1/2 relative bg-teal-700 flex flex-col items-center p-8">
              {/* Same content as initial view's left side */}
              <div className="relative w-64 h-64 mb-8">
                <Image
                  src="/assam.jpg"
                  alt="Office Dashboard"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                  priority
                />
              </div>
              <h2 className="text-3xl font-bold text-white text-center mb-4">
                Streamline Your Workflow
              </h2>
              <p className="text-white text-center mb-8">
                Manage your office operations efficiently with our comprehensive system
              </p>
              <div className="grid grid-cols-3 gap-6 w-full">
                <Feature icon={<FaSignInAlt />} text="Secure Access" />
                <Feature icon={<FaStream />} text="Seamless Flow" />
                <Feature icon={<FaGlobeAmericas />} text="Anywhere Access" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Feature component for icons and text
const Feature = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex flex-col items-center text-white">
    <div className="text-3xl mb-2">{icon}</div>
    <span className="text-sm text-center">{text}</span>
  </div>
);

export default Home;
