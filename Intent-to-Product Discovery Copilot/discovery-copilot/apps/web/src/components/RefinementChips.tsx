'use client';

import { Sliders } from 'lucide-react';

interface RefinementChipsProps {
  suggestions: string[];
  onSelect: (chip: string) => void;
}

export function RefinementChips({ suggestions, onSelect }: RefinementChipsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Sliders className="h-3 w-3" />
        <span className="font-medium">Refine:</span>
      </div>
      {suggestions.map((chip, i) => (
        <button
          key={chip}
          onClick={() => onSelect(chip)}
          className="h-7 px-3 rounded-lg border border-border bg-card text-[11px] font-medium text-muted hover:text-foreground hover:border-foreground/20 hover:shadow-sm transition-all duration-150 animate-fade-up"
          style={{ animationDelay: `${400 + i * 50}ms` }}
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
