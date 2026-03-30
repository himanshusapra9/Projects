'use client';

import { useState, useRef, useEffect } from 'react';
import type { SubmitQueryResponse, ClarificationQuestion } from '@discovery-copilot/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  response?: SubmitQueryResponse;
  timestamp: Date;
}

interface ConversationPanelProps {
  messages: Message[];
  isLoading: boolean;
  onSubmit: (query: string) => void;
}

export function ConversationPanel({ messages, isLoading, onSubmit }: ConversationPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input.trim());
    setInput('');
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white">
      <div className="border-b border-stone-100 px-4 py-3">
        <h2 className="text-sm font-medium text-stone-700">Conversation</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-sm text-stone-400 text-center py-8">
            Start by describing what you're looking for...
          </p>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                message.role === 'user'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-800'
              }`}
            >
              <p>{message.content}</p>

              {message.response?.clarificationQuestions && (
                <div className="mt-3 space-y-2">
                  {message.response.clarificationQuestions.map((q) => (
                    <ClarificationQuestionCard key={q.id} question={q} onAnswer={onSubmit} />
                  ))}
                </div>
              )}

              {message.response?.confidence && (
                <ConfidenceIndicator confidence={message.response.confidence.overall} />
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-stone-100 px-4 py-3">
              <div className="flex space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 rounded-full bg-stone-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-stone-100 p-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe what you're looking for..."
            className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm placeholder:text-stone-400 focus:border-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

function ClarificationQuestionCard({
  question,
  onAnswer,
}: {
  question: ClarificationQuestion;
  onAnswer: (answer: string) => void;
}) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm border border-stone-200">
      <p className="text-xs font-medium text-stone-700 mb-2">{question.question}</p>
      {question.options ? (
        <div className="flex flex-wrap gap-1.5">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onAnswer(option.label)}
              className="rounded-lg bg-stone-50 px-2.5 py-1 text-xs text-stone-600 hover:bg-stone-100 transition-colors border border-stone-200"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-stone-500">Type your answer above</p>
      )}
    </div>
  );
}

function ConfidenceIndicator({ confidence }: { confidence: number }) {
  const level = confidence > 0.7 ? 'high' : confidence > 0.4 ? 'medium' : 'low';
  const colors = {
    high: 'bg-emerald-500',
    medium: 'bg-amber-500',
    low: 'bg-rose-500',
  };

  return (
    <div className="mt-2 flex items-center gap-1.5">
      <div className={`h-1.5 w-1.5 rounded-full ${colors[level]}`} />
      <span className="text-[10px] opacity-60">
        {level === 'high' ? 'High confidence' : level === 'medium' ? 'Moderate — refinement may help' : 'Low — more details needed'}
      </span>
    </div>
  );
}
