"use client";

import { useState } from "react";

export default function AccessibilityToggle() {
  const [open, setOpen] = useState(false);

  function toggleMode(mode: string) {
    document.body.classList.toggle(mode);
  }

  // Helper for marking ON/OFF state without replacing buttons
  function isOn(mode: string) {
    return document.body.classList.contains(mode) ? " ✓" : "";
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* FAB Button */}
      <button
        onClick={() => setOpen(!open)}
        className="bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition font-semibold"
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
            onClick={() => toggleMode("a11y-spanish")}
            className="block w-full py-2 px-3 text-left hover:bg-gray-200 rounded"
          >
            Translate: Español / English <span>{isOn("a11y-spanish")}</span>
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
