"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  FaChartPie,
  FaClipboardList,
  FaUsers,
  FaBullhorn,
  FaSignOutAlt,
} from "react-icons/fa";

interface AdminNavbarProps {
  currentTab?: "dashboard" | "application" | "user" | "notification";
}

export default function AdminNavbar({ currentTab }: AdminNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState<string>("Admin");
  const [assignedDistrict, setAssignedDistrict] = useState<string | null>(null);

  useEffect(() => {
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      try {
        const u = JSON.parse(userDataStr);
        setAdminName(u.name || u.firstName || "District Official");
        setAssignedDistrict(u.assignedDistrict || null);
      } catch (e) {
        console.error("Error reading userData", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("adminToken");
    router.push("/admin/adminlogin");
  };

  const navLinks = [
    {
      label: "Overview",
      href: "/admin/dashboard",
      key: "dashboard",
      icon: FaChartPie,
    },
    {
      label: "Grievances",
      href: "/admin/application",
      key: "application",
      icon: FaClipboardList,
    },
    {
      label: "Citizens",
      href: "/admin/user",
      key: "user",
      icon: FaUsers,
    },
    {
      label: "Broadcasts",
      href: "/admin/notification",
      key: "notification",
      icon: FaBullhorn,
    },
  ];

  const activeKey =
    currentTab ||
    (pathname.includes("/admin/application")
      ? "application"
      : pathname.includes("/admin/user")
      ? "user"
      : pathname.includes("/admin/notification")
      ? "notification"
      : "dashboard");

  return (
    <header className="bg-[#f7f8f5]/90 backdrop-blur-xl border-b border-[#dce5df] sticky top-0 z-40 shadow-xs">


      {/* Main navigation header */}
      <div className="container mx-auto px-4 sm:px-8 py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#234a36] text-[#e8edce] flex items-center justify-center font-bold text-lg shadow-sm">
            <MessagesSquare size={24} strokeWidth={1.8} aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-2">
               <h2 className="text-lg font-heading font-extrabold text-[#12221f] tracking-tight leading-none">
                {assignedDistrict ? `${assignedDistrict} In-Charge` : "District Administration"}
              </h2>
                 <span className="bg-[#e6f2f2] text-[#1c6680] border border-[#cde4e3] text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full">
                Official
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Assigned to: <strong className="text-slate-700">{adminName}</strong>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
         <nav className="flex max-w-full items-center gap-1.5 overflow-x-auto p-1 bg-[#eaf2ee] rounded-2xl border border-[#dce5df]">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeKey === tab.key;
            return (
              <Link
                key={tab.key}
                href={tab.href}
                 className={`flex shrink-0 items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                     ? "bg-white text-[#12221f] shadow-sm border border-[#dce5df] font-semibold"
                     : "text-[#71817d] hover:text-[#12221f] hover:bg-white/70"
                }`}
              >
                 <Icon className={`text-xs ${isActive ? "text-[#d95f31]" : "text-[#9aaca5]"}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right action / user control */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/profile"
             className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#dce5df] hover:bg-[#edf5f1] text-[#40524e] text-xs font-medium transition-colors"
          >
             <div className="w-6 h-6 rounded-full bg-[#123b47] text-white flex items-center justify-center text-[10px] font-bold">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline">Profile</span>
          </Link>

          <button
            onClick={handleLogout}
             className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#fce8dc] hover:bg-[#f8d9c9] text-[#b94a28] border border-[#f2c8b5] text-xs font-medium transition-colors cursor-pointer"
          >
            <FaSignOutAlt className="text-xs" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
