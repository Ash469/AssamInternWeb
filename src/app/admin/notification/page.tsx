'use client';

import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaTrash,
  FaCheck,
  FaTimes,
  FaSync,
  FaBullhorn,
  FaCalendarAlt,
  FaEye,
} from 'react-icons/fa';
import Footer from '@/app/components/footer';
import AdminNavbar from '@/app/components/AdminNavbar';
import AdminRouteProtection from '@/app/components/AdminRouteProtection';

interface Notification {
  _id?: string;
  title: string;
  content: string;
  date: string;
  active: boolean;
  createdAt?: string;
}

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{ index: number } | null>(null);
  const [actionResult, setActionResult] = useState<{ message: string; isError: boolean } | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await fetch('/api/notification');
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      const data = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const formatted = (data || []).map((n: any) => ({
        _id: n._id,
        title: n.title,
        content: n.content,
        date: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Recent',
        active: true,
        createdAt: n.createdAt,
      }));

      setNotifications(formatted);
      setError('');
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoadingNotifications(false);
    }
  };

  const addNotification = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Please provide both title and content.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create notification');
      }

      const data = await response.json();

      const newNotification: Notification = {
        _id: data.notification?._id,
        title,
        content,
        date: new Date().toLocaleDateString(),
        active: true,
        createdAt: data.notification?.createdAt,
      };

      setNotifications([newNotification, ...notifications]);
      setTitle('');
      setContent('');
      setActionResult({
        message: 'Broadcast notice published successfully',
        isError: false,
      });
    } catch (err) {
      console.error('Error creating notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to publish notice');
      setActionResult({
        message: err instanceof Error ? err.message : 'Failed to publish notice',
        isError: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = (index: number) => {
    const updated = [...notifications];
    updated[index].active = !updated[index].active;
    setNotifications(updated);
  };

  const handleDeleteConfirmation = (index: number) => {
    setConfirmationData({ index });
    setShowConfirmation(true);
  };

  const deleteNotification = async (index: number) => {
    const notification = notifications[index];
    if (!notification?._id) {
      setError('Cannot delete notification without ID');
      return;
    }

    try {
      const response = await fetch(`/api/notification?id=${notification._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      const updated = [...notifications];
      updated.splice(index, 1);
      setNotifications(updated);
      setShowConfirmation(false);
      setActionResult({
        message: 'Notification deleted successfully',
        isError: false,
      });
    } catch (err) {
      console.error('Error deleting notification:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete notification');
      setActionResult({
        message: err instanceof Error ? err.message : 'Failed to delete notification',
        isError: true,
      });
    }
  };

  return (
    <AdminRouteProtection>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
        <AdminNavbar currentTab="notification" />

        <main className="container mx-auto px-4 sm:px-8 py-8 flex-grow">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Broadcasts & Public Notices
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Publish district-level civic advisories, community updates, and emergency notices
              </p>
            </div>

            <button
              onClick={fetchNotifications}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <FaSync className={`text-xs ${loadingNotifications ? 'animate-spin' : ''}`} />
              <span>Refresh Notices</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Compose Notice */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sticky top-24">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs">
                    <FaPlus />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">Issue New Notice</h2>
                    <p className="text-[11px] text-slate-500">Visible to portal citizens</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Notice Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Road repair schedule in Ward 4"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Notice Content
                    </label>
                    <textarea
                      placeholder="Provide complete public advisory details..."
                      rows={5}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-slate-400 transition-colors resize-none"
                    />
                  </div>

                  <button
                    onClick={addNotification}
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FaBullhorn className="text-xs" />
                    <span>{loading ? 'Publishing Notice...' : 'Publish Announcement'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Published Notices Feed */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">
                    Published Notices ({notifications.length})
                  </h2>
                  <span className="text-[11px] text-slate-500">Latest active broadcasts</span>
                </div>

                {loadingNotifications ? (
                  <div className="py-16 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin mb-3"></div>
                    <p className="text-xs text-slate-500">Loading notices...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <FaBullhorn className="text-lg" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800">No notices published yet</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Use the composer form on the left to broadcast announcements to citizens.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((item, index) => (
                      <div
                        key={item._id || index}
                        className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  item.active
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    item.active ? 'bg-emerald-500' : 'bg-slate-400'
                                  }`}
                                ></span>
                                {item.active ? 'Active' : 'Archived'}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                                <FaCalendarAlt className="text-[9px]" />
                                <span>{item.date}</span>
                              </div>
                            </div>

                            <h3 className="text-sm font-bold text-slate-900 mb-1">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                              {item.content}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => setSelectedNotification(item)}
                              title="View details"
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition-colors cursor-pointer"
                            >
                              <FaEye />
                            </button>

                            <button
                              onClick={() => toggleActive(index)}
                              title={item.active ? 'Archive' : 'Activate'}
                              className={`p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                                item.active
                                  ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              <FaCheck />
                            </button>

                            <button
                              onClick={() => handleDeleteConfirmation(index)}
                              title="Delete notice"
                              className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs transition-colors cursor-pointer"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        <Footer />

        {/* View Modal */}
        {selectedNotification && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        selectedNotification.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {selectedNotification.active ? 'Active' : 'Archived'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {selectedNotification.date}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    <FaTimes />
                  </button>
                </div>

                <h2 className="text-base font-bold text-slate-900 mb-3">
                  {selectedNotification.title}
                </h2>
                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {selectedNotification.content}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    onClick={() => setSelectedNotification(null)}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showConfirmation && confirmationData !== null && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border border-slate-200">
              <div className="p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-2">Delete Notice</h3>
                <p className="text-xs text-slate-600">
                  Are you sure you want to permanently delete this broadcast announcement? This action cannot be undone.
                </p>

                <div className="mt-5 flex justify-end gap-2">
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteNotification(confirmationData.index)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {actionResult && (
          <div className="fixed bottom-5 right-5 max-w-xs w-full z-50">
            <div
              className={`rounded-xl p-3.5 shadow-lg border text-xs flex items-center justify-between gap-2 ${
                actionResult.isError
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <span>{actionResult.message}</span>
              <button
                onClick={() => setActionResult(null)}
                className="opacity-60 hover:opacity-100 transition-opacity"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminRouteProtection>
  );
}
