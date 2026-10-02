"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { soundAlert } from '../lib/soundAlert';
import {
  Bell,
  Volume2,
  VolumeX,
  CheckCircle2,
  ShoppingCart,
  FileText,
  Truck,
  MessageSquare,
  Sparkles,
  ExternalLink,
  X,
  PhoneCall
} from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationDrawer() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [prevCount, setPrevCount] = useState(0);
  const dropdownRef = useRef(null);

  // Initialize sound state
  useEffect(() => {
    setSoundEnabled(soundAlert.isEnabled());
  }, []);

  // Fetch notifications
  const fetchNotifications = async (isInitial = false) => {
    if (!user) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch('/api/notifications?limit=15', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      if (data.success) {
        const newUnread = data.unreadCount || 0;
        setNotifications(data.notifications || []);
        setUnreadCount(newUnread);

        // If new unread notification detected (after initial load), play sound chime!
        if (!isInitial && newUnread > prevCount && prevCount >= 0) {
          soundAlert.play('order');
          toast.info('🔔 নতুন নোটিফিকেশন এসেছে!', {
            description: data.notifications?.[0]?.title || 'আপনার ড্যাশবোর্ডে নতুন আপডেট রয়েছে।'
          });
        }
        setPrevCount(newUnread);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications(true);

    // Poll every 25 seconds for new notifications
    const interval = setInterval(() => {
      fetchNotifications(false);
    }, 25000);

    return () => clearInterval(interval);
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleSound = () => {
    const newState = soundAlert.toggle();
    setSoundEnabled(newState);
    toast.success(newState ? '🔊 সাউন্ড অ্যালার্ট চালু করা হয়েছে' : '🔇 সাউন্ড অ্যালার্ট বন্ধ করা হয়েছে');
  };

  const handleTestSound = () => {
    soundAlert.play('order');
    toast.info('🎶 টেস্ট ট্রেড সাউন্ড বাজানো হলো');
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ markAll: true })
      });

      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('সবগুলো পঠিত হিসেবে চিহ্নিত করা হয়েছে');
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'order_new':
        return <ShoppingCart className="w-4 h-4 text-emerald-600" />;
      case 'order_status':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'rfq_quote':
      case 'rfq_accepted':
        return <FileText className="w-4 h-4 text-amber-600" />;
      case 'assisted_trade':
        return <PhoneCall className="w-4 h-4 text-indigo-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-slate-500" />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'এইমাত্র';
    if (diffMins < 60) return `${diffMins} মিনিট আগে`;
    if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
    if (diffDays === 1) return 'গতকাল';
    return `${diffDays} দিন আগে`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        className="relative p-2.5 rounded-xl text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition border border-slate-200/80 bg-white shadow-sm flex items-center justify-center"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-md border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-blue-200" />
              <h3 className="font-bold text-sm">নোটিফিকেশন ও অ্যালার্ট</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} নতুন
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                title={soundEnabled ? 'সাউন্ড বন্ধ করুন' : 'সাউন্ড চালু করুন'}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </button>

              {/* Close */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition text-white/80"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Audio Chime Banner */}
          <div className="bg-blue-50 px-3 py-2 border-b border-blue-100 flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-1.5">
              <span>🔔 সাউন্ড নোটিফিকেশন:</span>
              <span className={`font-semibold ${soundEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>
                {soundEnabled ? 'সক্রিয়' : 'বন্ধ'}
              </span>
            </div>
            <button
              onClick={handleTestSound}
              className="text-blue-700 hover:text-blue-900 font-semibold underline text-[11px]"
            >
              টেস্ট সাউন্ড 🎶
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                <p className="text-xs">কোনো নোটিফিকেশন নেই</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`p-3 transition hover:bg-slate-50 flex items-start gap-2.5 ${
                    !item.isRead ? 'bg-blue-50/50' : 'bg-white'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/60">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {formatTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-1.5">
                      {item.message}
                    </p>

                    <div className="flex items-center justify-between gap-2">
                      {item.actionUrl ? (
                        <Link
                          href={item.actionUrl}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-800"
                        >
                          <span>বিস্তারিত দেখুন</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      ) : <span />}

                      {item.smsStatus && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          item.smsStatus === 'sent' || item.smsStatus === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          📱 SMS {item.smsStatus === 'sent' || item.smsStatus === 'delivered' ? 'সফল' : 'লগ'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={markAllAsRead}
                className="text-xs text-slate-600 hover:text-blue-700 font-semibold flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                <span>সব পঠিত করুন</span>
              </button>

              <span className="text-[11px] text-slate-400">
                মোট {notifications.length}টি বার্তা
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
