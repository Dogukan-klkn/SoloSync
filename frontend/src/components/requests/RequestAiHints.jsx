const PRIORITY_STYLE = {
  High:   'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-700',
  Low:    'bg-slate-100 text-slate-600',
};

export default function RequestAiHints({ request }) {
  const hasItems = request.aiTaskItems?.length > 0;
  const hasTags  = request.aiTags?.length > 0;
  if (!request.suggestedPriority && !hasItems && !hasTags) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        {request.suggestedPriority && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PRIORITY_STYLE[request.suggestedPriority] ?? PRIORITY_STYLE.Medium}`}>
            AI öncelik: {request.suggestedPriority}
          </span>
        )}
        {request.isAiPowered && request.aiProvider && (
          <span className="text-xs text-slate-400">via {request.aiProvider}</span>
        )}
        {hasTags && request.aiTags.filter(t => t !== 'musteri-istegi').map((tag) => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600">
            #{tag}
          </span>
        ))}
      </div>
      {hasItems && (
        <ul className="text-xs text-slate-500 space-y-0.5 pl-1">
          {request.aiTaskItems.map((item, i) => (
            <li key={i}>↳ {item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
