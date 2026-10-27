'use client'

import { FaUserShield, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Check if user is already logged in
  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      // User is already logged in, redirect to dashboard
      router.push('/admin/dashboard');
    }
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/adminlogin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Save authentication state in localStorage
      const userData = {
        isAuthenticated: true,
        name: data.admin?.name || 'Admin',
        username: data.admin?.email || formData.username,
        email: data.admin?.email || formData.username,
        role: data.admin?.role || 'district_admin',
        assignedDistrict: data.admin?.assignedDistrict || null,
        zone: data.admin?.zone || null,
        token: data.token,
      };

      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('adminToken', data.token);

      // Redirect to dashboard after successful login
      router.push('/admin/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
           <div className="w-20 h-20 rounded-xl mx-auto mb-3 flex items-center justify-center text-2xl shadow-sm">
                      <Image
                        src="/logo.png"
                        width={500}
                        height={500}
                        alt="Picture of the author"
                      />
                    </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              District Admin Portal
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Authorized regional access for Assam district in-charges
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Official Email / Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
                  placeholder="admin.kamrup@party.org"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 pr-10 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 transition-colors"
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
                disabled={isLoading}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                <FaSignInAlt className="text-sm" />
                <span>{isLoading ? 'Authenticating...' : 'Sign In to District Dashboard'}</span>
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <Link 
                href="/"
                className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                ← Return to Public Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}