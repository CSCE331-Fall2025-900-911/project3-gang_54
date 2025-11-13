"use client";

export default function AccessibilityToggle() {
  return (
    <button
      onClick={() => document.body.classList.toggle("a11y-mode")}
      className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700 transition text-sm font-semibold z-[9999]"
    >
      ♿ Accessibility
    </button>
  );
}
