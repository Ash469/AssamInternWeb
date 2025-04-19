'use client';

import React, { useState, useEffect } from 'react';

interface Notification {
  _id?: string;
  title: string;
  content: string;
  createdAt?: string;
  date?: string;
  active: boolean;
}

const AdminNotification: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  //const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:10000/api';
  //const apiUrl = 'http://localhost:10000/api';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const response = await fetch('/api/notification');
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedNotifications = data.map((notification: any) => ({
          _id: notification._id,
          title: notification.title,
          content: notification.content,
          date: new Date(notification.createdAt).toISOString().split('T')[0],
          active: true, // Default to active
          createdAt: notification.createdAt
        }));
        
        setNotifications(formattedNotifications);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setError('Failed to load notifications. Please try again.');
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, []);

  const addNotification = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create notification');
      }
      
      const data = await response.json();
      
      // Add the new notification to the state
      const newNotification: Notification = {
        _id: data.notification._id,
        title,
        content,
        date: new Date().toISOString().split('T')[0],
        active: true,
        createdAt: data.notification.createdAt
      };
      
      setNotifications([newNotification, ...notifications]);
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('Error creating notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to create notification');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = (index: number) => {
    const updated = [...notifications];
    updated[index].active = !updated[index].active;
    setNotifications(updated);
  };

  const deleteNotification = async (index: number) => {
    const notification = notifications[index];
    
    if (!notification._id) {
      setError('Cannot delete notification without ID');
      return;
    }
    
    try {
      const response = await fetch(`/api/notification?id=${notification._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete notification: ${response.status} ${response.statusText}`);
      }
      
      const updated = [...notifications];
      updated.splice(index, 1);
      setNotifications(updated);
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-teal-700 mb-8">Notification Management</h1>

        {/* Add New Notification Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-teal-600 mb-6">Add New Notification</h2>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <textarea
                placeholder="Content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border-2 border-teal-200 rounded-lg focus:border-teal-500 focus:outline-none transition-colors h-32"
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <button 
              onClick={addNotification}
              disabled={loading}
              className={`bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-semibold ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Adding...' : 'Add Notification'}
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loadingNotifications ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700"></div>
              <p className="mt-2 text-gray-600">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-600">No notifications available.</p>
            </div>
          ) : (
            notifications.map((n, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-teal-700">{n.title}</h3>
                  <p className="text-gray-600">{n.content}</p>
                  <small className="text-gray-500">Date: {n.date}</small>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                  <label className="flex items-center space-x-2 text-teal-600">
                    <input
                      type="checkbox"
                      checked={n.active}
                      onChange={() => toggleActive(index)}
                      className="form-checkbox h-5 w-5 text-teal-600 rounded border-teal-400"
                    />
                    <span>Active</span>
                  </label>
                  <button 
                    onClick={() => deleteNotification(index)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNotification;
