import { useState, useEffect } from "react";
import { FaTimes, FaEdit, FaTrash, FaShareAlt, FaCalendarAlt, FaAward, FaStar } from "react-icons/fa";
import { fetchTMDBDetails } from "../api/tmdb";
import Loader from "./Loader";

const getRatingColor = (rating) => {
  switch (rating) {
    case "Skip": return "bg-rating-skip/20 text-rating-skip border-rating-skip/40";
    case "Timepass": return "bg-rating-timepass/20 text-rating-timepass border-rating-timepass/40";
    case "Go for it": return "bg-rating-go/20 text-rating-go border-rating-go/40";
    case "Perfection": return "bg-rating-perfection/20 text-rating-perfection border-rating-perfection/40";
    default: return "bg-slate-500/20 text-slate-400 border-slate-500/40";
  }
};

const getHighResPoster = (url) => {
  if (!url || url === "N/A") return null;
  return url.replace(/_SX\d+\.jpg$/, ".jpg");
};

export default function DetailsModal({
  item,
  onClose,
  onEdit,
  onDelete,
  isSharedView = false,
  sharedProfile = null,
  activeProfile = null,
  onShareCard,
}) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getDetails = async () => {
      try {
        setLoading(true);
        const data = await fetchTMDBDetails(item.id, item.type);
        if (data.Response === "False") {
          setError(data.Error || "Failed to fetch details.");
        } else {
          setDetails(data);
        }
      } catch (err) {
        console.error("Error fetching TMDB details:", err);
        setError("Could not load details from TMDB.");
      } finally {
        setLoading(false);
      }
    };

    if (item?.id) {
      getDetails();
    }
  }, [item]);

  // Profile metadata to show alongside review
  const reviewerName = isSharedView ? (sharedProfile?.name || "Shared User") : (activeProfile?.name || "You");
  const reviewerAvatar = isSharedView ? (sharedProfile?.avatar || "🎬") : (activeProfile?.avatar || "🍿");
  const reviewerAvatarBg = isSharedView ? (sharedProfile?.avatarBg || "from-slate-700 to-slate-900") : (activeProfile?.avatarBg || "from-red-500 to-amber-500");

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4 md:p-6 overflow-y-auto animate-fade-in">
      {/* Cinematic Blur Ambient Glow Background */}
      {item.poster && item.poster !== "N/A" && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10 blur-3xl pointer-events-none transition-opacity duration-1000"
          style={{ backgroundImage: `url(${getHighResPoster(item.poster)})` }}
        />
      )}

      {/* Main Container */}
      <div className="relative bg-surface dark:bg-slate-950 border border-border dark:border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden transition-all duration-300 max-h-[90vh] flex flex-col">
        
        {/* Header/Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="bg-black/40 hover:bg-black/60 text-white p-2.5 rounded-full backdrop-blur-md border border-white/10 transition-colors shadow-lg"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[350px]">
            <Loader />
            <p className="text-sm text-text-secondary mt-4 animate-pulse">Loading cinematic details...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <p className="text-red-500 font-semibold mb-4 bg-red-500/10 py-2 px-4 rounded-full">{error}</p>
            <button onClick={onClose} className="px-6 py-2 bg-text-primary text-background rounded-full font-medium">Close</button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Split Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 md:p-8">
              
              {/* Poster Column */}
              <div className="md:col-span-4 flex flex-col items-center">
                <div className="w-48 md:w-full aspect-[2/3] rounded-2xl overflow-hidden bg-slate-800 shadow-2xl border border-white/5 relative group">
                  {details.Poster && details.Poster !== "N/A" ? (
                    <img
                      src={getHighResPoster(details.Poster)}
                      alt={details.Title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-secondary bg-surface dark:bg-slate-900">
                      No Poster
                    </div>
                  )}

                  {/* Rating Tag */}
                  {item.rating && (
                    <div className={`absolute top-3 left-3 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border backdrop-blur-md shadow-lg ${getRatingColor(item.rating)}`}>
                      {item.rating}
                    </div>
                  )}
                </div>

                {/* Quick sharing option for local user reviews */}
                {item.status !== "watch-later" && !isSharedView && (
                  <button
                    onClick={() => onShareCard(item)}
                    className="mt-4 w-full py-2.5 px-4 bg-gradient-to-r from-purple-600/15 to-indigo-600/15 hover:from-purple-600/25 hover:to-indigo-600/25 border border-purple-500/20 text-purple-400 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <FaShareAlt size={12} /> Generate Share Card
                  </button>
                )}
              </div>

              {/* Details Column */}
              <div className="md:col-span-8 flex flex-col">
                {/* Title and metadata */}
                <div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight leading-tight">
                    {details.Title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs md:text-sm text-text-secondary font-medium">
                    <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-border dark:border-slate-800">{details.Year}</span>
                    <span>•</span>
                    <span className="bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-border dark:border-slate-800">{details.Rated}</span>
                    <span>•</span>
                    <span>{details.Runtime}</span>
                    <span>•</span>
                    <span>{details.Genre}</span>
                  </div>
                </div>

                {/* External Ratings Showcase */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                  {details.imdbRating && details.imdbRating !== "N/A" && (
                    <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-border dark:border-slate-900 p-2.5 rounded-xl text-center">
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">IMDb Rating</p>
                      <p className="text-base font-extrabold text-text-primary mt-1 flex items-center justify-center gap-1">
                        <FaStar className="text-yellow-500" size={13} /> {details.imdbRating}
                      </p>
                    </div>
                  )}

                  {details.Ratings?.find(r => r.Source === "Rotten Tomatoes") && (
                    <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-border dark:border-slate-900 p-2.5 rounded-xl text-center">
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Tomatoes</p>
                      <p className="text-base font-extrabold text-red-500 mt-1">
                        🍅 {details.Ratings.find(r => r.Source === "Rotten Tomatoes").Value}
                      </p>
                    </div>
                  )}

                  {details.Metascore && details.Metascore !== "N/A" && (
                    <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-border dark:border-slate-900 p-2.5 rounded-xl text-center">
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Metascore</p>
                      <p className="text-base font-extrabold text-green-500 mt-1">
                        {details.Metascore}/100
                      </p>
                    </div>
                  )}

                  {item.rating && (
                    <div className="bg-slate-100/50 dark:bg-slate-900/50 border border-border dark:border-slate-900 p-2.5 rounded-xl text-center">
                      <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Your Rating</p>
                      <p className="text-sm font-extrabold mt-1 truncate">
                        {item.rating === "Perfection" && "👑 "}
                        {item.rating === "Go for it" && "👍 "}
                        {item.rating === "Timepass" && "🍿 "}
                        {item.rating === "Skip" && "❌ "}
                        {item.rating}
                      </p>
                    </div>
                  )}
                </div>

                {/* Plot */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold uppercase text-text-secondary tracking-wider mb-2">Synopsis</h4>
                  <p className="text-sm text-text-primary/90 leading-relaxed font-normal">
                    {details.Plot}
                  </p>
                </div>

                {/* People/Info */}
                <div className="mt-6 space-y-2 text-sm border-t border-border dark:border-slate-900 pt-4">
                  <p className="font-normal"><strong className="text-text-secondary font-bold text-xs uppercase tracking-wider mr-2 block sm:inline">Director:</strong> {details.Director}</p>
                  <p className="font-normal"><strong className="text-text-secondary font-bold text-xs uppercase tracking-wider mr-2 block sm:inline">Writer:</strong> {details.Writer}</p>
                  <p className="font-normal"><strong className="text-text-secondary font-bold text-xs uppercase tracking-wider mr-2 block sm:inline">Actors:</strong> {details.Actors}</p>
                  {details.Awards && details.Awards !== "N/A" && (
                    <p className="font-normal flex items-start gap-1">
                      <strong className="text-text-secondary font-bold text-xs uppercase tracking-wider mr-2 block sm:inline shrink-0"><FaAward className="inline mr-1 text-yellow-500" /> Awards:</strong>
                      <span className="text-yellow-600 dark:text-yellow-400 font-medium">{details.Awards}</span>
                    </p>
                  )}
                </div>

                {/* Personal Review and Notes section */}
                {item.status !== "watch-later" && (
                  <div className="mt-6 bg-slate-50 dark:bg-slate-900/60 border border-border dark:border-slate-900 p-5 rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${reviewerAvatarBg} flex items-center justify-center text-base shadow-md`}>
                          {reviewerAvatar}
                        </div>
                        <div>
                          <h5 className="text-xs font-extrabold text-text-primary tracking-wide">{reviewerName}</h5>
                          <p className="text-[10px] text-text-secondary flex items-center gap-1 mt-0.5 font-medium">
                            <FaCalendarAlt size={9} /> Watched {new Date(item.watchedOn).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      {item.rating && (
                        <div className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRatingColor(item.rating)}`}>
                          {item.rating}
                        </div>
                      )}
                    </div>

                    {item.review ? (
                      <p className="text-sm italic text-text-primary/95 leading-relaxed bg-white/40 dark:bg-black/20 p-3.5 rounded-xl border border-white/5 font-normal whitespace-pre-line">
                        "{item.review}"
                      </p>
                    ) : (
                      <p className="text-xs text-text-secondary/70 italic p-2.5">No review text written yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar at bottom */}
            {!isSharedView && (
              <div className="px-6 py-4 bg-slate-100/50 dark:bg-slate-900/30 border-t border-border dark:border-slate-900 flex justify-between items-center gap-3">
                <button
                  onClick={() => onDelete(item)}
                  className="px-4 py-2 border border-red-500/10 hover:border-red-500/30 text-red-500 hover:bg-red-500/5 text-xs font-semibold rounded-full transition-all flex items-center gap-1.5"
                >
                  <FaTrash size={10} /> Delete Entry
                </button>

                <button
                  onClick={() => onEdit(item)}
                  className="px-6 py-2 bg-text-primary text-background font-semibold rounded-full text-xs hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md"
                >
                  <FaEdit size={10} /> Edit Review & Date
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
