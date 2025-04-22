"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import Footer from "@/app/components/footer";
import Image from "next/image";

export default function AdminHome() {
  const [adminName, setAdminName] = useState("Admin");
  const [totalUsers, setTotalUsers] = useState(0);
  const [verifiedUsers, setVerifiedUsers] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
    fetchUserData();
  }, []);

  const loadAdminData = () => {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setAdminName(userData.firstName || "Admin");
    }
  };

  const fetchUserData = async () => {
    try {
      const res = await axios.get('/api/getnewsignup');
      const users = res.data.users;
      const verified = users.filter((user: { verified: boolean }) => user.verified).length;
      const pending = users.filter((user: { verified: boolean }) => !user.verified).length;

      setTotalUsers(users.length);
      setVerifiedUsers(verified);
      setPendingUsers(pending);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header 
        className="relative min-h-[250px] sm:h-[300px] bg-cover bg-center" 
        style={{ 
          backgroundImage: "linear-gradient(rgba(13, 148, 136, 0.9), rgba(13, 148, 136, 0.8)), url(/app_bar.png)"
        }}
      >
        <div className="container mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <Image 
              src="/logo.png" 
              alt="Logo" 
              width={128}
              height={128}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-4 border-white shadow-2xl" 
              />
              <div className="mt-4 sm:mt-0 sm:ml-4">
              <h1 className="text-3xl sm:text-5xl font-bold text-white tracking-wide">
                Welcome {adminName}
              </h1>
              <p className="text-xl sm:text-2xl text-teal-100 mt-2">
                Admin Dashboard
              </p>
              </div>
            </div>
            
            <button 
              className="mt-6 sm:mt-0 bg-white/10 hover:bg-white/20 text-white px-6 sm:px-8 py-3 rounded-lg flex items-center gap-3 backdrop-blur-sm transition-all border-2 border-white/20 shadow-lg w-full sm:w-auto justify-center"
              onClick={() => window.location.href = "/admin/profile"}
            >
              <i className="fas fa-user-shield text-xl sm:text-2xl"></i>
              <span className="text-base sm:text-lg font-semibold">My Profile</span>
            </button>
          </div>
        </div>
      </header>

      <main className="relative -mt-24 sm:-mt-34 z-10 container mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {menuItems.map((item, i) => (
            <div
              key={i}
              onClick={() => window.location.href = item.link}
              className="cursor-pointer flex flex-col items-center p-4 sm:p-6 rounded-xl bg-teal-50 hover:bg-teal-100 transition-all duration-300 border border-teal-200 shadow-md hover:shadow-lg"
            >
              <div className="text-teal-600 text-3xl sm:text-4xl mb-3">
                {item.icon()}
              </div>
              <p className="text-base sm:text-lg font-medium text-center text-teal-800">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 sm:mt-10 mb-4">
          <h2 className="text-base sm:text-lg font-semibold text-black mb-4">Dashboard Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard 
              title="Total Users" 
              value={isLoading ? "..." : totalUsers.toString()} 
              color="teal" 
              icon="👥" 
            />
            <StatCard 
              title="Pending Approval" 
              value={isLoading ? "..." : pendingUsers.toString()} 
              color="amber" 
              icon="🕒" 
            />
            <StatCard 
              title="Verified Users" 
              value={isLoading ? "..." : verifiedUsers.toString()} 
              color="emerald" 
              icon="✅" 
            />
            <StatCard 
              title="Completion Rate" 
              value={isLoading ? "..." : `${totalUsers > 0 ? Math.round((verifiedUsers/totalUsers) * 100) : 0}%`} 
              color="blue" 
              icon="📊" 
            />
          </div>
        </div>
      </main>
      <div className="py-6 sm:py-3"></div>
      <Footer />
    </div>
  );
}

const StatCard = ({ title, value, icon }: { title: string, value: string, color: string, icon: string }) => (
  <div className="bg-white p-3 sm:p-5 rounded-xl shadow-lg flex items-center gap-3 sm:gap-4 border border-teal-100 hover:shadow-xl transition-shadow">
    <div className="text-xl sm:text-2xl">{icon}</div>
    <div>
      <p className="text-xs sm:text-sm text-teal-600 font-medium">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-teal-800">{value}</p>
    </div>
  </div>
);

const menuItems = [
  {
    label: "Application Management",
    icon: () => <i className="fas fa-file-alt"></i>,
    link: "/admin/application"
  },
  {
    label: "Notification Management",
    icon: () => <i className="fas fa-bell"></i>,
    link: "/admin/notification"
  },
  {
    label: "User Management",
    icon: () => <i className="fas fa-users"></i>,
    link: "/admin/user"
  }
];
