"use client";

import { useEffect, useState } from "react";
import { CheckCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, duration = 2500, onClose }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 200); // Wait for exit animation
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-60 flex -translate-x-1/2 items-center gap-2 rounded-lg border border-border bg-bg-secondary px-4 py-2.5 shadow-lg transition-all duration-200 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      }`}
    >
      <CheckCircle className="h-4 w-4 shrink-0 text-success" />
      <span className="text-sm font-medium text-text-primary">{message}</span>
      <button onClick={onClose} className="ml-1 text-text-tertiary hover:text-text-primary">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
