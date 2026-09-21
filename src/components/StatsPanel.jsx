import { RATINGS } from "../utils/constants";
import { getRatingColorHex } from "../utils/mediaFormat";

const StatsPanel = ({ data = [] }) => {
  const total = data.length;
  const movies = data.filter((i) => i.type === "movie").length;
  const series = data.filter((i) => i.type === "series").length;
  const thisYear = data.filter((i) => {
    if (!i.watchedOn) return false;
    const d = new Date(i.watchedOn);
    return !isNaN(d.getTime()) && d.getFullYear() === new Date().getFullYear();
  }).length;

  const ratingCounts = RATINGS.map((rating) => ({
    rating,
    count: data.filter((i) => i.rating === rating).length,
  }));
  const maxCount = Math.max(1, ...ratingCounts.map((r) => r.count));

  const summary = [
    { label: "Total", value: total },
    { label: "Movies", value: movies },
    { label: "Series", value: series },
    { label: "This Year", value: thisYear },
  ];

  return (
    <div className="bg-surface dark:bg-slate-900/80 backdrop-blur p-6 rounded-2xl mb-10 border border-border dark:border-slate-800">
      <h3 className="text-lg font-semibold mb-5 text-text-primary">Your Watch Stats</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-6">
        {summary.map((s) => (
          <div
            key={s.label}
            className="bg-slate-100/60 dark:bg-slate-950/50 border border-border dark:border-slate-800/60 p-4 rounded-xl"
          >
            <p className="text-2xl font-extrabold text-text-primary">{s.value}</p>
            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <h4 className="text-xs font-bold uppercase text-text-secondary tracking-wider mb-3">Rating Breakdown</h4>
      <div className="space-y-2.5">
        {ratingCounts.map(({ rating, count }) => (
          <div key={rating} className="flex items-center gap-3">
            <span className="w-20 text-xs font-semibold text-text-primary shrink-0">{rating}</span>
            <div className="flex-1 h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(count / maxCount) * 100}%`,
                  backgroundColor: getRatingColorHex(rating),
                  minWidth: count > 0 ? "8px" : 0,
                }}
                role="progressbar"
                aria-valuenow={count}
                aria-valuemin={0}
                aria-valuemax={total}
                aria-label={`${rating}: ${count} entries`}
              />
            </div>
            <span className="w-8 text-right text-xs font-bold text-text-secondary tabular-nums">{count}</span>
          </div>
        ))}
      </div>

      {total === 0 && (
        <p className="text-xs text-text-secondary/70 italic mt-4">
          Add entries to your history to see stats here.
        </p>
      )}
    </div>
  );
};

export default StatsPanel;
