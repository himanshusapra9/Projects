const TYPE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  extracted: { bg: "bg-blue-100", text: "text-blue-700", label: "Extracted" },
  normalized: { bg: "bg-purple-100", text: "text-purple-700", label: "Normalized" },
  inferred: { bg: "bg-amber-100", text: "text-amber-700", label: "Inferred" },
  llm_generated: { bg: "bg-pink-100", text: "text-pink-700", label: "LLM Generated" },
};

export default function ExtractionTypeBadge({ type }: { type: string }) {
  const style = TYPE_STYLES[type] || { bg: "bg-gray-100", text: "text-gray-700", label: type };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style.bg} ${style.text}`}>
      {style.label}
    </span>
  );
}
