"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  FaChartPie,
  FaClipboardList,
  FaUsers,
  FaBullhorn,
  FaSignOutAlt,
  FaUserShield,
} from "react-icons/fa";

interface AdminNavbarProps {
  currentTab?: "dashboard" | "application" | "user" | "notification";
}

export default function AdminNavbar({ currentTab }: AdminNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminName, setAdminName] = useState<string>("Admin");
  const [adminRole, setAdminRole] = useState<string>("district_admin");
  const [assignedDistrict, setAssignedDistrict] = useState<string | null>(null);

  useEffect(() => {
    const userDataStr = localStorage.getItem("userData");
    if (userDataStr) {
      try {
        const u = JSON.parse(userDataStr);
        setAdminName(u.name || u.firstName || "District Official");
        setAdminRole(u.role || "district_admin");
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
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">


      {/* Main navigation header */}
      <div className="container mx-auto px-4 sm:px-8 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg  text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <Image
              src="/logo.png"
              width={500}
              height={500}
              alt="Picture of the author"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                {assignedDistrict ? `${assignedDistrict} In-Charge` : "District Administration"}
              </h2>
              <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
                Official
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Assigned to: <strong className="text-slate-700">{adminName}</strong>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200">
          {navLinks.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeKey === tab.key;
            return (
              <Link
                key={tab.key}
                href={tab.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200/80 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
              >
                <Icon className={`text-xs ${isActive ? "text-slate-900" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right action / user control */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/profile"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline">Profile</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <FaSignOutAlt className="text-xs" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
