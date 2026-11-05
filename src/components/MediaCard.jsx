import { useState } from "react";
import { FaTrash, FaEdit } from "react-icons/fa";
import { getRatingColor, getHighResPoster } from "../utils/mediaFormat";

const MediaCard = ({ item, onDelete, onEdit, onViewDetails }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const posterUrl = getHighResPoster(item.poster);
  const showPoster = Boolean(posterUrl) && !imgFailed;

  const episodeProgress =
    item.type === "series" && (item.episodesWatched > 0 || item.totalEpisodes > 0)
      ? `${item.episodesWatched || 0}/${item.totalEpisodes || "?"}`
      : null;

  return (
    <div
      className="group w-full cursor-pointer animate-fade-in select-none"
      onClick={() => onViewDetails && onViewDetails(item)}
    >
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-md transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]">
        {showPoster ? (
          <img
            src={posterUrl}
            alt={item.title || "Poster"}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary bg-surface dark:bg-slate-800 text-xs font-semibold gap-2">
            <span className="text-3xl" aria-hidden="true">🎬</span>
            No Poster
          </div>
        )}

        {/* Rating Badge */}
        {item.rating && (
          <div className={`absolute top-2 left-2 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded shadow-sm backdrop-blur-md ${getRatingColor(item.rating)}`}>
            {item.rating}
          </div>
        )}

        {/* Episode progress badge for series */}
        {episodeProgress && (
          <div className="absolute bottom-2 left-2 px-2 py-0.5 text-[9px] font-bold rounded bg-black/60 text-white backdrop-blur-sm border border-white/10">
            📺 {episodeProgress}
          </div>
        )}

        {/* Action Buttons — always visible on touch, hover-reveal on desktop */}
        {(onEdit || onDelete) && (
          <div className="absolute top-2 right-2 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
            {onEdit && (
              <button
                aria-label={`Edit ${item.title || "entry"}`}
                onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors border border-white/5 shadow-md"
              >
                <FaEdit size={10} />
              </button>
            )}
            {onDelete && (
              <button
                aria-label={`Delete ${item.title || "entry"}`}
                onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                className="bg-black/50 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors border border-white/5 shadow-md"
              >
                <FaTrash size={10} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Info Section - Below Image */}
      <div className="mt-3 px-1">
        <h3 className="text-[15px] font-bold text-text-primary leading-snug line-clamp-1 group-hover:text-text-primary/80 transition-colors">
          {item.title || item.Title}
        </h3>
        <p className="text-[12px] text-text-secondary mt-1 font-semibold">
          {item.type ? item.type.toUpperCase() : "MOVIE"} • {item.year || item.Year || (item.watchedOn ? new Date(item.watchedOn).getFullYear() : "N/A")}
        </p>
      </div>
    </div>
  );
};

export default MediaCard;
