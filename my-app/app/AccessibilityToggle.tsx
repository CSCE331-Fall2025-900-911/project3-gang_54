"use client";

import { useState, useMemo } from "react";
import { useTranslation } from "./hooks/useTranslation";

export default function AccessibilityToggle() {
  const [open, setOpen] = useState(false);

  // Define all translatable strings
  const translatableStrings = useMemo(() => [
    "Accessibility",
    "High Contrast",
    "Translate: Español / English",
    "Large Text"
  ], []);

  const { display, language, setLanguage } = useTranslation(translatableStrings);

  function toggleMode(mode: string) {
    document.body.classList.toggle(mode);
  }

  // Helper for marking ON/OFF state without replacing buttons
  function isOn(mode: string) {
    return document.body.classList.contains(mode) ? " ✓" : "";
  }

  // Toggle translation language between English and Spanish
  function toggleTranslation() {
    toggleMode("a11y-spanish"); // Keep CSS class toggle for legacy support
    // Also toggle the actual translation language
    if (language === "en") {
      setLanguage("es");
    } else if (language === "es") {
      setLanguage("en");
    } else {
      // If Chinese or other, default to Spanish
      setLanguage("es");
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-[9999]">
      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition font-semibold"
      >
        ♿ {display("Accessibility")}
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-3 bg-white shadow-xl rounded-lg p-4 w-48 text-black">

          <button
            onClick={() => toggleMode("a11y-high-contrast")}
            className="block w-full py-2 px-3 text-left hover:bg-gray-200 rounded"
          >
            {display("High Contrast")} <span>{isOn("a11y-high-contrast")}</span>
          </button>

          <button
            onClick={toggleTranslation}
            className="block w-full py-2 px-3 text-left hover:bg-gray-200 rounded"
          >
            {display("Translate: Español / English")} <span>{language !== "en" ? " ✓" : ""}</span>
          </button>

          <button
            onClick={() => toggleMode("a11y-large-text")}
            className="block w-full py-2 px-3 text-left hover:bg-gray-200 rounded"
          >
            {display("Large Text")} <span>{isOn("a11y-large-text")}</span>
          </button>

        </div>
      )}
    </div>
  );
}
