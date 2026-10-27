"use client";

import React, { useState } from "react";
import Image from 'next/image'
import { useRouter } from "next/navigation";
import { FaShieldAlt, FaLock, FaUserSecret, FaKey, FaBuilding, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";

interface Props {
  secretPath: string;
}

export default function SuperAdminLoginPortal({ secretPath }: Props) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/adminlogin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Authentication failed.");
      }

      // Ensure that only Super Admin accounts are authorized through this gateway
      if (data.admin?.role !== "super_admin") {
        throw new Error(
          "Access Denied: Only Central Super Administrators can access through this dynamic gateway."
        );
      }

      const userData = {
        isAuthenticated: true,
        name: data.admin?.name || "Super Admin",
        username: data.admin?.email || formData.username,
        role: "super_admin",
        assignedDistrict: null,
        token: data.token,
      };

      localStorage.setItem("userData", JSON.stringify(userData));
      localStorage.setItem("adminToken", data.token);

      // Redirect to dedicated Super Admin master dashboard
      router.push("/superadmin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-center items-center p-4">
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
            Central Command HQ
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Super Administrator Gateway • All Assam Scope
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Super Admin Email
              </label>
              <input
                type="email"
                name="username"
                required
                placeholder="superadmin@party.org"
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-white border border-slate-300 focus:border-slate-900 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Secret Access Key / Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-300 focus:border-slate-900 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors"
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
              className="w-full mt-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Enter Command Center</span>
                  <FaArrowRight className="text-xs" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            ← Return to Public Citizen Portal
          </a>
        </div>
      </div>
    </div>
  );
}
