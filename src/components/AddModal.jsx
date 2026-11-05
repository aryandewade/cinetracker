import { useState } from "react";
import useModalA11y, { backdropClick } from "../hooks/useModalA11y";
import { RATINGS } from "../utils/constants";

const AddModal = ({ item, onClose, onSave, isEdit = false }) => {
  const containerRef = useModalA11y({ isOpen: true, onClose });

  // The modal remounts for every open/edit, so lazy initializers are enough —
  // no setState-inside-effect cascade needed.
  const [date, setDate] = useState(
    item?.watchedOn || new Date().toISOString().split("T")[0]
  );
  const [rating, setRating] = useState(item?.rating || "");
  const [review, setReview] = useState(item?.review || "");
  const [isWatchLater, setIsWatchLater] = useState(item?.status === "watch-later");
  const [episodesWatched, setEpisodesWatched] = useState(item?.episodesWatched || 0);
  const [totalEpisodes, setTotalEpisodes] = useState(item?.totalEpisodes || 0);

  const isSeries = item?.type === "series";

  const handleSave = () => {
    onSave({
      ...item,
      watchedOn: isWatchLater ? null : date,
      rating: isWatchLater ? null : rating,
      review: isWatchLater ? null : review,
      episodesWatched: isSeries ? Number(episodesWatched) || 0 : 0,
      totalEpisodes: isSeries ? Number(totalEpisodes) || 0 : 0,
      status: isWatchLater ? "watch-later" : "watched",
    });
  };

  const inputClass =
    "w-full bg-surface dark:bg-slate-800 border border-transparent focus:border-text-secondary outline-none p-2 rounded-lg text-text-primary transition-colors";

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? "Edit entry" : "Add movie"}
      onClick={backdropClick(onClose)}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in outline-none"
    >
      <div className="bg-surface dark:bg-slate-900 border border-border dark:border-slate-800 p-6 rounded-2xl w-[360px] md:w-[400px] shadow-2xl transition-all">
        <h2 className="text-xl font-bold mb-6 text-text-primary">
          {isEdit ? "Edit Entry" : "Add Movie"}
        </h2>

        {!isWatchLater && (
          <div className="mb-4">
            <label htmlFor="cine-date" className="block text-xs font-semibold text-text-secondary uppercase mb-1">Watched On</label>
            <input
              id="cine-date"
              type="date"
              className={inputClass}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        )}

        {!isWatchLater && (
          <div className="mb-4">
            <label htmlFor="cine-rating" className="block text-xs font-semibold text-text-secondary uppercase mb-1">Rating</label>
            <select
              id="cine-rating"
              className={`${inputClass} appearance-none cursor-pointer`}
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <option value="">Select a rating...</option>
              {RATINGS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        )}

        {/* Episode tracking for series */}
        {isSeries && (
          <div className="mb-4">
            <span className="block text-xs font-semibold text-text-secondary uppercase mb-1">Episode Progress</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                aria-label="Episodes watched"
                placeholder="Watched"
                className={`${inputClass} w-full`}
                value={episodesWatched || ""}
                onChange={(e) => setEpisodesWatched(e.target.value)}
              />
              <span className="text-text-secondary font-bold">/</span>
              <input
                type="number"
                min="0"
                aria-label="Total episodes"
                placeholder="Total"
                className={`${inputClass} w-full`}
                value={totalEpisodes || ""}
                onChange={(e) => setTotalEpisodes(e.target.value)}
              />
            </div>
          </div>
        )}

        {!isWatchLater && (
          <div className="mb-4">
            <label htmlFor="cine-review" className="block text-xs font-semibold text-text-secondary uppercase mb-1">Review &amp; Notes</label>
            <textarea
              id="cine-review"
              className={`${inputClass} p-3 h-24 resize-none text-sm placeholder:text-text-secondary/40 focus:ring-1 focus:ring-text-secondary`}
              placeholder="Write your review, thoughts, or private notes here..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
            />
          </div>
        )}

        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            id="watchLater"
            checked={isWatchLater}
            onChange={(e) => setIsWatchLater(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-text-primary focus:ring-text-secondary cursor-pointer"
          />
          <label htmlFor="watchLater" className="text-sm text-text-primary cursor-pointer select-none">Add to Watch Later</label>
        </div>

        <div className="flex justify-end gap-3 mt-6 border-t border-border dark:border-slate-800 pt-4">
          <button onClick={onClose} className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-text-primary text-background px-6 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModal;
