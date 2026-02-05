import { FaTrash, FaEdit } from "react-icons/fa";

const getRatingColor = (rating) => {
  switch (rating) {
    case "Skip": return "bg-rating-skip/80 text-white";
    case "Timepass": return "bg-rating-timepass/80 text-black";
    case "Go for it": return "bg-rating-go/80 text-black";
    case "Perfection": return "bg-rating-perfection/80 text-white";
    default: return "bg-slate-500/80 text-white";
  }
};

const getHighResPoster = (url) => {
  if (!url || url === "N/A") return null;
  // OMDB posters often end in _SX300.jpg. Removing it gets the full res.
  return url.replace(/_SX\d+\.jpg$/, ".jpg");
};

const MediaCard = ({ item, onDelete, onEdit }) => {
  return (
    <div className="group w-full cursor-default animate-fade-in">
      <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden bg-slate-800 shadow-md transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]">
        {item.poster && item.poster !== "N/A" ? (
          <img
            src={getHighResPoster(item.poster)}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-secondary bg-surface dark:bg-slate-800">
            No Image
          </div>
        )}

        {/* Rating Badge - Now more subtle/integrated */}
        {item.rating && (
          <div className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-sm shadow-sm backdrop-blur-md ${getRatingColor(item.rating)}`}>
            {item.rating}
          </div>
        )}

        {/* Action Buttons - Show on Hover */}
        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(item); }}
            className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
          >
            <FaEdit size={10} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
            className="bg-black/50 hover:bg-red-500/80 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
          >
            <FaTrash size={10} />
          </button>
        </div>
      </div>

      {/* Info Section - Below Image */}
      <div className="mt-3 px-1">
        <h3 className="text-[17px] font-bold text-text-primary leading-tight line-clamp-1 group-hover:text-text-primary/80 transition-colors">
          {item.title}
        </h3>
        <p className="text-sm text-text-secondary mt-1 font-medium">
          {item.params?.type || "Movie"} • {item.watchedOn ? new Date(item.watchedOn).getFullYear() : "Watch Later"}
        </p>
      </div>
    </div>
  );
};

export default MediaCard;
