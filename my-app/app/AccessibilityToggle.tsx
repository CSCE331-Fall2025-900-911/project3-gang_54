"use client";

import { useState, useEffect } from "react";
import { useTranslationContext } from "./contexts/TranslationContext";

export default function AccessibilityToggle() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage } = useTranslationContext();

  function toggleMode(mode: string) {
    document.body.classList.toggle(mode);
  }

  // Helper for marking ON/OFF state without replacing buttons
  function isOn(mode: string) {
    return document.body.classList.contains(mode) ? " ✓" : "";
  }

  // Sync translation with language state
  useEffect(() => {
    // Update body class based on language
    document.body.classList.remove("a11y-spanish", "a11y-chinese");
    if (language === "es") {
      document.body.classList.add("a11y-spanish");
    } else if (language === "zh") {
      document.body.classList.add("a11y-chinese");
    }
  }, [language]);

  const handleLanguageToggle = () => {
    if (language === "en") {
      setLanguage("es");
    } else if (language === "es") {
      setLanguage("zh");
    } else {
      setLanguage("en");
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-[9999]">
      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition font-semibold"
        aria-label="Accessibility options"
      >
        ♿ Accessibility
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-3 bg-white shadow-xl rounded-lg p-4 w-48 text-black">

          <button
            onClick={() => toggleMode("a11y-high-contrast")}
            className="block w-full py-2 px-3 text-left hover:bg-gray-200 rounded"
          >
            High Contrast <span>{isOn("a11y-high-contrast")}</span>
          </button>

          <button
            onClick={handleLanguageToggle}
            className="block w-full py-2 px-3 text-left hover:bg-gray-200 rounded"
          >
            Language: {language === "en" ? "English" : language === "es" ? "Español" : "中文"} <span>{(language !== "en") ? " ✓" : ""}</span>
          </button>

          <button
            onClick={() => toggleMode("a11y-large-text")}
            className="block w-full py-2 px-3 text-left hover:bg-gray-200 rounded"
          >
            Large Text <span>{isOn("a11y-large-text")}</span>
          </button>

        </div>
      )}
    </div>
  );
}
