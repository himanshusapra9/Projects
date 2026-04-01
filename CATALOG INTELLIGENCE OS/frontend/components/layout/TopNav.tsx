"use client";

import { Menu } from "lucide-react";

export default function TopNav({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur lg:h-16 lg:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex flex-1 items-center justify-between">
        <p className="text-sm text-slate-500">Catalog Intelligence OS</p>
      </div>
    </header>
  );
}
