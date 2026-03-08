"use client";

import { useEffect, useState } from "react";

const SCROLL_THRESHOLD = 300;

export function ReturnToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-40 rounded-full border border-zinc-200 bg-white/90 px-4 py-2 text-sm font-medium text-zinc-700 shadow-md backdrop-blur-sm hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-700"
      aria-label="Return to top"
    >
      Return to top
    </button>
  );
}
