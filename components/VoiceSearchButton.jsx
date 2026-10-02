"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";

export default function VoiceSearchButton({ onResult, onStart, onEnd, className = "" }) {
  const { isBn } = useLanguage();
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check SpeechRecognition support in browser
    const SpeechRecognition =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isBn ? "bn-BD" : "en-US";

      recognition.onstart = () => {
        setIsListening(true);
        if (onStart) onStart();
        toast.info(isBn ? "🎤 শুনছি... আপনার কাঁচামালের নাম বলুন" : "🎤 Listening... Say what material you need", {
          duration: 3000
        });
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          toast.success(`"${transcript}"`, { duration: 2000 });
          if (onResult) onResult(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
        if (onEnd) onEnd();
        if (event.error === "not-allowed") {
          toast.error(isBn ? "মাইক্রোফোনের অনুমতি দিন" : "Please allow microphone access");
        } else if (event.error !== "no-speech") {
          toast.error(isBn ? "আবার চেষ্টা করুন" : "Please try again");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (onEnd) onEnd();
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Speech recognition setup error:", err);
      setIsSupported(false);
    }
  }, [isBn]);

  const toggleListening = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isSupported) {
      toast.error(
        isBn
          ? "আপনার ব্রাউজারে ভয়েস সার্চ সমর্থিত নয়। ক্রোম বা এজ ব্যবহার করুন।"
          : "Voice search not supported in this browser. Please use Chrome or Edge."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.lang = isBn ? "bn-BD" : "en-US";
          recognitionRef.current.start();
        }
      } catch (err) {
        console.warn("Start recognition error:", err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`relative p-2.5 rounded-xl transition-all duration-200 flex items-center justify-center shrink-0 ${
        isListening
          ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105 animate-pulse"
          : "text-slate-500 hover:text-blue-700 hover:bg-blue-50"
      } ${className}`}
      title={isListening ? "ভয়েস বন্ধ করুন" : "মুখে বলুন (ভয়েস সার্চ)"}
      aria-label="Voice Search"
    >
      {isListening ? (
        <span className="relative flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <Mic className="w-5 h-5 text-white relative z-10" />
        </span>
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </button>
  );
}
