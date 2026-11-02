'use client';

import { FaUser, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import jwt_decode from 'jwt-decode';
import AuthShowcase from '../components/AuthShowcase';

interface UserProfile {
  _id?: string;
  userId?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  contactNumber?: string;
  gender?: string;
  age?: number;
  createdAt?: string;
  verified?: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  //const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000/api';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleLoginMethod = () => {
    setLoginMethod(prev => prev === 'email' ? 'phone' : 'email');
    setFormData({ ...formData, identifier: '' });
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => {
            // Check specifically for 403 status
            if (res.status === 403) {
              throw new Error('Your account is pending verification. Please wait for admin approval.');
            }
            throw new Error(data.error || 'Something went wrong');
          });
        }
        return res.json();
      })
      .then(data => {
        console.log("Login successful:", data);
        localStorage.setItem('token', data.token);
        
        // Extract userId from JWT token exactly like profile page does
        let userId = null;
        try {
          const decoded = jwt_decode(data.token) as { 
            id?: string; 
            userId?: string; 
            _id?: string; 
            sub?: string 
          };
          userId = decoded.id || decoded.userId || decoded._id || decoded.sub;
          console.log("Extracted userId from token:", userId);
        } catch (decodeErr) {
          console.error('Error decoding token:', decodeErr);
        }
        
        // Use the same fetch approach as profile page
        return fetch('/api/getnewsignup')
          .then(response => {
            if (!response.ok) {
              throw new Error('Failed to fetch user profile');
            }
            return response.json();
          })
          .then(userData => {
            if (userData.users && userData.users.length > 0) {
              let userProfile = null;
              
              // Use exact same logic as profile page
              if (userId) {
                const loggedInUser = userData.users.find((user: UserProfile) => 
                  user._id === userId || user.userId === userId
                );
                
                if (loggedInUser) {
                  userProfile = loggedInUser;
                  console.log("Found logged in user:", loggedInUser);
                } else {
                  userProfile = userData.users[0];
                  console.warn('Logged in user not found in user list, showing first user');
                }
              } else {
                userProfile = userData.users[0];
              }
              
              // Store the exact same user profile that will be displayed in profile page
              if (userProfile) {
                localStorage.setItem('userProfile', JSON.stringify(userProfile));
                localStorage.setItem('userId', userProfile.userId || userProfile._id || '');
              }
            } else {
              throw new Error('No user data found');
            }
            
            // Add a small delay before navigation to ensure localStorage is updated
            setTimeout(() => {
              console.log("Navigating to home portal...");
              router.push('/');
            }, 100);
            
            // Force a hard navigation if the router.push doesn't work
            setTimeout(() => {
              console.log("Fallback navigation");
              window.location.href = '/';
            }, 500);
          });
      })
      .catch(err => {
        console.error("Login error:", err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="auth-shell text-slate-800 flex flex-col font-sans">
      <div className="flex-grow flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-[1fr_1fr] gap-8 lg:gap-16 items-center">
          <AuthShowcase eyebrow="The citizen portal" title="A better Assam begins with being heard." description="Bring local issues to the right district team and follow every step toward resolution." />
          <div className="w-full max-w-md mx-auto">
          <div className="mb-4">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
              ← Return to Home
            </Link>
          </div>
          <div className="text-center mb-6 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-white border border-[#dce5df] text-[#17745c] flex items-center justify-center text-xl mx-auto mb-4 shadow-lg">
              <FaUser />
            </div>
            <h1 className="text-3xl font-heading font-extrabold text-[#12221f] tracking-tight">
              Citizen Portal Login
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Sign in to report civic problems and track redressal in your district
            </p>
          </div>

          <div className="auth-card bg-white/95 p-6 sm:p-8">
              <div className="flex justify-center gap-2 mb-6 p-1 bg-[#edf5f1] rounded-xl">
              <button
                type="button"
                onClick={toggleLoginMethod}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  loginMethod === 'email'
                    ? 'bg-white text-[#12221f] shadow-sm'
                    : 'text-slate-500 hover:text-[#12221f]'
                }`}
              >
                Sign in with Email
              </button>
              <button
                type="button"
                onClick={toggleLoginMethod}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  loginMethod === 'phone'
                    ? 'bg-white text-[#12221f] shadow-sm'
                    : 'text-slate-500 hover:text-[#12221f]'
                }`}
              >
                Sign in with Phone
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {loginMethod === 'email' ? 'Registered Email Address' : '10-Digit Mobile Number'}
                </label>
                <input
                  type={loginMethod === 'email' ? 'email' : 'tel'}
                  id="identifier"
                  name="identifier"
                  value={formData.identifier}
                  onChange={handleChange}
                   className="w-full px-3.5 py-2.5 border border-[#dce5df] rounded-xl bg-[#f7f8f5] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#17745c]/20 focus:border-[#17745c] transition-colors"
                  placeholder={loginMethod === 'email' ? 'yourname@example.com' : '9876543210'}
                  pattern={loginMethod === 'phone' ? '[0-9]{10}' : undefined}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Account Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                     className="w-full px-3.5 py-2.5 pr-10 border border-[#dce5df] rounded-xl bg-[#f7f8f5] text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#17745c]/20 focus:border-[#17745c] transition-colors"
                    placeholder="••••••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                 className="w-full mt-2 flex items-center justify-center gap-2 py-3 bg-[#17745c] hover:bg-[#125c49] text-white text-sm font-semibold rounded-full shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <FaSignInAlt className="text-sm" />
                <span>{loading ? 'Signing in...' : 'Sign In to Dashboard'}</span>
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
              <Link 
                href="/usersignup"
                 className="text-[#17745c] hover:text-[#125c49] font-medium"
              >
                Don&apos;t have an account? Register here
              </Link>
              <Link 
                href="/"
                className="hover:text-slate-800 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
