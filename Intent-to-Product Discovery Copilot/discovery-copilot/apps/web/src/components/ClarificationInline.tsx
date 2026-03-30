'use client';

import { MessageSquare, X } from 'lucide-react';

interface ClarificationInlineProps {
  question: string;
  options: string[];
  onAnswer: (answer: string) => void;
  onSkip: () => void;
}

export function ClarificationInline({ question, options, onAnswer, onSkip }: ClarificationInlineProps) {
  return (
    <div className="mb-6 rounded-xl border border-[#E2E1FF] bg-[#FAFAFF] p-5 animate-fade-up">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-8 w-8 rounded-lg bg-[#F0EFFF] flex items-center justify-center flex-shrink-0">
            <MessageSquare className="h-4 w-4 text-[#6D28D9]" />
          </div>
          <div>
            <p className="text-[13px] font-medium text-foreground">{question}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">This helps narrow down the best recommendation</p>
          </div>
        </div>
        <button onClick={onSkip} className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-white/80 transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 ml-11 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => onAnswer(option)}
            className="h-8 px-3.5 rounded-lg border border-[#D4D3FF] bg-white text-[12px] font-medium text-foreground hover:border-[#6D28D9] hover:bg-[#F5F3FF] transition-all duration-150"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
