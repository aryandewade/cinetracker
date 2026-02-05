import { useState, useEffect } from "react";

const RATINGS = ["Skip", "Timepass", "Go for it", "Perfection"];

const AddModal = ({ item, onClose, onSave, isEdit = false }) => {
  const [date, setDate] = useState("");
  const [rating, setRating] = useState("");
  const [isWatchLater, setIsWatchLater] = useState(false);

  useEffect(() => {
    if (item) {
      setDate(item.watchedOn || new Date().toISOString().split("T")[0]);
      setRating(item.rating || "");
      setIsWatchLater(item.status === "watch-later");
    }
  }, [item]);


  const handleSave = () => {
    onSave({
      ...item,
      watchedOn: isWatchLater ? null : date,
      rating: isWatchLater ? null : rating,
      status: isWatchLater ? "watch-later" : "watched",
    });
  };


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-surface dark:bg-slate-900 border border-border p-6 rounded-2xl w-80 shadow-2xl">
        <h2 className="text-xl font-bold mb-6 text-text-primary">
          {isEdit ? "Edit Entry" : "Add Movie"}
        </h2>

        {!isWatchLater && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-text-secondary uppercase mb-1">Watched On</label>
            <input
              type="date"
              className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-text-secondary outline-none p-2 rounded-lg text-text-primary transition-colors"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        )}

        {!isWatchLater && (
          <div className="mb-6">
            <label className="block text-xs font-medium text-text-secondary uppercase mb-1">Rating</label>
            <select
              className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-text-secondary outline-none p-2 rounded-lg text-text-primary transition-colors appearance-none cursor-pointer"
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

        <div className="mb-6 flex items-center gap-2">
          <input
            type="checkbox"
            id="watchLater"
            checked={isWatchLater}
            onChange={(e) => setIsWatchLater(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-text-primary focus:ring-text-secondary"
          />
          <label htmlFor="watchLater" className="text-sm text-text-primary cursor-pointer select-none">Add to Watch Later</label>
        </div>

        <div className="flex justify-end gap-3 mt-6 border-t border-border pt-4">
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
