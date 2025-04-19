"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function SummaryPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    pendingApplications: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  //const apiUrl = 'http://localhost:10000';

  const fetchStats = async () => {
    try {
      const [usersRes, applicationsRes] = await Promise.all([
        axios.get('/api/getnewsignup'),
        axios.get('/api/getapplications')
      ]);

      const users = usersRes.data.users;
      const applications = applicationsRes.data.applications;

      setStats({
        totalUsers: users.length,
        verifiedUsers: users.filter((user: { verified: boolean }) => user.verified).length,
        totalApplications: applications.length,
        approvedApplications: applications.filter((app: { status: string }) => app.status === 'approved').length,
        rejectedApplications: applications.filter((app: { status: string }) => app.status === 'rejected').length,
        pendingApplications: applications.filter((app: { status: string }) => app.status === 'pending').length,
      });
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon }: { title: string, value: number, icon: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all border border-teal-100 flex items-center gap-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <p className="text-sm text-teal-600 font-medium">{title}</p>
        <p className="text-2xl font-bold text-teal-800">{isLoading ? "..." : value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header 
        className="relative min-h-[200px] bg-cover bg-center" 
        style={{ 
          backgroundImage: "linear-gradient(rgba(13, 148, 136, 0.9), rgba(13, 148, 136, 0.8)), url(/app_bar.png)"
        }}
      >
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Summary Dashboard</h1>
            <p className="text-teal-100 text-lg">Overview of Users and Applications</p>
          </div>
        </div>
      </header>

      <main className="relative -mt-16 z-10 container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon="👥"
          />
          <StatCard
            title="Verified Users"
            value={stats.verifiedUsers}
            icon="✅"
          />
          <StatCard
            title="Total Applications"
            value={stats.totalApplications}
            icon="📝"
          />
          <StatCard
            title="Approved Applications"
            value={stats.approvedApplications}
            icon="👍"
          />
          <StatCard
            title="Rejected Applications"
            value={stats.rejectedApplications}
            icon="👎"
          />
          <StatCard
            title="Pending Applications"
            value={stats.pendingApplications}
            icon="⏳"
          />
        </div>
      </main>
    </div>
  );
}