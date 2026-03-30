"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, SkipForward } from "lucide-react";
import { useCallback, useState } from "react";

export type ClarificationOption = {
  id: string;
  label: string;
};

export type ClarificationQuestion = {
  id: string;
  prompt: string;
  options: ClarificationOption[];
};

export type ClarificationFlowProps = {
  questions: ClarificationQuestion[];
  onComplete: (answers: Record<string, string>) => void;
  onSkip?: () => void;
  className?: string;
};

export function ClarificationFlow({
  questions,
  onComplete,
  onSkip,
  className = "",
}: ClarificationFlowProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const q = questions[step];
  const progress = questions.length ? ((step + 1) / questions.length) * 100 : 0;

  const pick = useCallback(
    (optionId: string) => {
      if (!q) return;
      const next = { ...answers, [q.id]: optionId };
      setAnswers(next);
      if (step >= questions.length - 1) {
        onComplete(next);
        return;
      }
      setStep((s) => s + 1);
    },
    [answers, onComplete, q, questions.length, step],
  );

  const skip = useCallback(() => {
    if (step >= questions.length - 1) {
      onComplete(answers);
      onSkip?.();
      return;
    }
    setStep((s) => s + 1);
  }, [answers, onComplete, onSkip, questions.length, step]);

  if (!q) return null;

  return (
    <div
      className={`rounded-lg border border-slate-200/90 bg-white p-6 shadow-md ${className}`}
      role="region"
      aria-label="Quick fit questions"
    >
      <div className="mb-6 flex items-center gap-3">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"
          aria-hidden
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-accent to-indigo-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums text-slate-500">
          {step + 1} / {questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <h3 className="font-serif text-xl font-normal tracking-tight text-navy-950">
            {q.prompt}
          </h3>
          <ul
            className="mt-5 flex flex-wrap gap-2"
            role="listbox"
            aria-label={q.prompt}
          >
            {q.options.map((opt) => (
              <li key={opt.id}>
                <button
                  type="button"
                  onClick={() => pick(opt.id)}
                  className="rounded-full border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-medium text-slate-800 shadow-sm transition hover:border-indigo-300 hover:bg-white hover:shadow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={skip}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          <SkipForward className="h-4 w-4" aria-hidden />
          Skip for now
        </button>
        <span className="hidden text-xs text-slate-400 sm:inline">
          Press Tab to move between options · Enter to select
        </span>
        <ChevronRight className="h-4 w-4 text-slate-300 sm:hidden" aria-hidden />
      </div>
    </div>
  );
}
