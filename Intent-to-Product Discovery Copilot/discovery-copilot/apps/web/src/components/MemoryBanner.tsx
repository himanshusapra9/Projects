'use client';

import { useState } from 'react';
import { Brain, X, Settings } from 'lucide-react';

interface MemoryBannerProps {
  notes: string[];
  onDismiss?: () => void;
  onManage?: () => void;
}

export function MemoryBanner({ notes, onDismiss, onManage }: MemoryBannerProps) {
  const [visible, setVisible] = useState(true);

  if (!visible || notes.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-[#E2E1FF] bg-[#FAFAFF] px-5 py-3.5 animate-fade-up">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-7 w-7 rounded-lg bg-[#F0EFFF] flex items-center justify-center flex-shrink-0">
            <Brain className="h-3.5 w-3.5 text-[#6D28D9]" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#6D28D9]">Based on your preferences</p>
            <div className="mt-1 space-y-0.5">
              {notes.map((note, i) => (
                <p key={i} className="text-[11px] text-[#6D28D9]/70">{note}</p>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onManage} className="h-6 w-6 rounded-md flex items-center justify-center text-[#6D28D9]/40 hover:text-[#6D28D9] hover:bg-[#F0EFFF] transition-colors" title="Manage memory">
            <Settings className="h-3 w-3" />
          </button>
          <button onClick={() => { setVisible(false); onDismiss?.(); }} className="h-6 w-6 rounded-md flex items-center justify-center text-[#6D28D9]/40 hover:text-[#6D28D9] hover:bg-[#F0EFFF] transition-colors" title="Dismiss">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
