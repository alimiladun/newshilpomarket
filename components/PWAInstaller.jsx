"use client";

import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('✅ ServiceWorker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('ServiceWorker registration failed:', error);
          });
      });
    }

    // 2. Check if already installed / standalone
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone ||
                           document.referrer.includes('android-app://');
      if (isStandalone) {
        setIsInstalled(true);
        return;
      }

      // Check if user dismissed recently (within 3 days)
      const dismissedAt = localStorage.getItem('sm_pwa_dismissed');
      if (dismissedAt) {
        const diff = Date.now() - parseInt(dismissedAt, 10);
        if (diff < 3 * 24 * 60 * 60 * 1000) {
          return;
        }
      }

      // 3. Listen for beforeinstallprompt
      const handleBeforeInstall = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowBanner(true);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);

      window.addEventListener('appinstalled', () => {
        setIsInstalled(true);
        setShowBanner(false);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallSuccess(true);
      setTimeout(() => setShowBanner(false), 2500);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sm_pwa_dismissed', Date.now().toString());
    }
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-blue-500/30 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 shadow-md border border-white/20">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm sm:text-base flex items-center gap-1.5 text-white">
              <span>শিল্পমার্কেট অ্যাপ</span>
              <span className="text-[10px] bg-blue-500/30 text-blue-300 font-semibold px-1.5 py-0.5 rounded border border-blue-400/30">
                PWA
              </span>
            </div>
            <p className="text-xs text-slate-300 line-clamp-1">
              {installSuccess 
                ? '✅ অ্যাপটি সফলভাবে ইনস্টল হয়েছে!' 
                : 'সহজে ব্যবহারের জন্য আপনার ফোনে অ্যাপটি ইনস্টল করুন'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {installSuccess ? (
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold px-3 py-2 bg-emerald-500/20 rounded-xl border border-emerald-500/40">
              <Check className="w-4 h-4" />
              <span>যুক্ত হয়েছে</span>
            </div>
          ) : (
            <button
              onClick={handleInstallClick}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>ইনস্টল করুন</span>
            </button>
          )}

          <button
            onClick={handleDismiss}
            aria-label="Close"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
