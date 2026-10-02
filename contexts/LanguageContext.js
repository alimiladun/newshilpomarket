"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "../lib/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  // Default to Bangla ('bn') for Bangladesh market
  const [language, setLanguageState] = useState("bn");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("shilpomarket_lang");
      if (savedLang && (savedLang === "bn" || savedLang === "en")) {
        setLanguageState(savedLang);
      } else {
        // Default to 'bn'
        localStorage.setItem("shilpomarket_lang", "bn");
      }
    } catch (e) {
      console.warn("Could not read language from localStorage", e);
    }
    setMounted(true);
  }, []);

  const setLanguage = (lang) => {
    if (lang !== "bn" && lang !== "en") return;
    setLanguageState(lang);
    try {
      localStorage.setItem("shilpomarket_lang", lang);
    } catch (e) {
      console.warn("Could not save language to localStorage", e);
    }
  };

  /**
   * Helper to retrieve translated text by dot path
   * e.g. t('common.callNow') -> "সরাসরি কল দিন"
   */
  const t = (path, fallback = "") => {
    if (!path) return fallback;
    const parts = path.split(".");

    let current = translations[language];
    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        // Fallback to English
        let enCurrent = translations["en"];
        for (const enPart of parts) {
          if (enCurrent && typeof enCurrent === "object" && enPart in enCurrent) {
            enCurrent = enCurrent[enPart];
          } else {
            return fallback || path;
          }
        }
        return typeof enCurrent === "string" ? enCurrent : fallback || path;
      }
    }
    return typeof current === "string" ? current : fallback || path;
  };

  /**
   * Format numbers to Bengali numerals if language is 'bn'
   */
  const toBanglaNumber = (num) => {
    if (num === null || num === undefined) return "";
    const banglaDigits = {
      0: "০",
      1: "১",
      2: "২",
      3: "৩",
      4: "৪",
      5: "৫",
      6: "৬",
      7: "৭",
      8: "৮",
      9: "৯",
    };
    return String(num).replace(/[0-9]/g, (digit) => banglaDigits[digit] || digit);
  };

  const isBn = language === "bn";

  return (
    <LanguageContext.Provider
      value={{
        language,
        isBn,
        setLanguage,
        t,
        toBanglaNumber,
        mounted,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return a safe fallback if used outside provider
    return {
      language: "bn",
      isBn: true,
      setLanguage: () => {},
      t: (path, fallback) => fallback || path,
      toBanglaNumber: (n) => String(n),
      mounted: false,
    };
  }
  return context;
}
