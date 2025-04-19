'use client';

import { useEffect, useState } from 'react';
import NavBar from '../components/nav_bar';

interface NotificationItem {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  avatar?: string;
  hasAdv?: boolean;
}

function getAvatarColor(avatar: string): string {
  switch (avatar) {
    case 'D':
      return 'bg-teal-600 border-2 border-teal-400';
    case 'Y':
      return 'bg-teal-600 border-2 border-teal-400';
    case 'O':
      return 'bg-teal-600 border-2 border-teal-400';
    case 'ML':
      return 'bg-teal-600 border-2 border-teal-400';
    default:
      return 'bg-teal-600 border-2 border-teal-400';
  }
}

// Function to format date to a readable format
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');
}

// Function to get first letter(s) for avatar
function getAvatarText(title: string): string {
  if (!title) return 'N';
  
  const words = title.split(' ');
  if (words.length > 1) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return title.substring(0, 1).toUpperCase();
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:10000/api';
  //const apiUrl = 'http://localhost:10000/api';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/notification');
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedNotifications: NotificationItem[] = data.map((item: any) => ({
          _id: item._id,
          title: item.title,
          content: item.content,
          createdAt: item.createdAt,
          avatar: getAvatarText(item.title)
        }));
        
        setNotifications(formattedNotifications);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <NavBar />

      {/* Hero Section */}
      <section className="relative h-[300px] overflow-hidden">
        {/* Spline background */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-green-500/30 z-[1]"></div>
          {/* <Spline 
            scene="https://prod.spline.design/Pogqf2P4pTEDp9b5/scene.splinecode" 
          /> */}
        </div>

        {/* Text content overlay */}
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center max-w-2xl px-6">
            <h2 className="text-4xl font-bold mb-4 text-black">
              Stay Up to Date with Notifications
            </h2>
            <p className="text-lg text-black/80">
              Keep track of all important updates and messages in one centralized location.
              Never miss an important notification again!
            </p>
          </div>
        </div>
      </section>

      {/* Notifications List */}
      <section className="bg-gray-100 py-10 px-6 md:px-16">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-teal-800">Recent Notifications</h3>
          </div>
          
          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
              <p className="mt-2 text-gray-600">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">
              {error}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-10 text-gray-600">
              No notifications available
            </div>
          ) : (
            <ul>
              {notifications.map((notification) => (
                <li key={notification._id} className="border-b last:border-b-0 border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="px-6 py-4 flex items-start">
                    <div className={`flex-shrink-0 w-12 h-12 ${getAvatarColor(notification.avatar || '')} rounded-full flex items-center justify-center text-white font-bold mr-4`}>
                      {notification.avatar}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-teal-800">{notification.title}</p>
                      <p className="text-sm text-gray-800 mt-0.5">{notification.content}</p>
                    </div>
                    
                    <div className="ml-3 flex flex-col items-end">
                      <span className="text-xs text-gray-500">{formatDate(notification.createdAt)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}