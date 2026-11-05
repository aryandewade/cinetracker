const EmptyState = ({
  message = "No watch history yet",
  hint = "Search and add movies or series to get started",
  emoji = "🍿",
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center py-24 text-text-secondary animate-fade-in">
      <div className="text-6xl mb-4" aria-hidden="true">{emoji}</div>
      <h2 className="text-2xl font-semibold mb-2 text-text-primary">{message}</h2>
      {hint && <p className="text-sm">{hint}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-6 bg-text-primary text-background px-6 py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-md"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
