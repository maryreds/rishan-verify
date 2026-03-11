"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex items-center bg-muted rounded-full p-0.5 gap-0.5">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground">
          <Sun className="w-3.5 h-3.5" />
          Light
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground">
          <Moon className="w-3.5 h-3.5" />
          Dark
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center bg-muted rounded-full p-0.5 gap-0.5">
      <button
        onClick={() => setTheme("light")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          theme === "light"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Sun className="w-3.5 h-3.5" />
        Light
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          theme === "dark"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Moon className="w-3.5 h-3.5" />
        Dark
      </button>
    </div>
  );
}
