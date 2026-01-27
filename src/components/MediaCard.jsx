import { FaTrash, FaEdit } from "react-icons/fa";

const MediaCard = ({ item, onDelete, onEdit }) => {
  return (
    
    <div className="w-36 bg-slate-900 border border-slate-800 rounded-xl p-2">
      {item.poster && item.poster !== "N/A" ? (
        <img
          src={item.poster}
          alt={item.title}
          className="rounded-lg"
        />
      ) : (
        <div className="h-44 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
          No Image
        </div>
      )}

      <p className="mt-2 text-sm font-medium tracking-tight text-slate-100 leading-snug line-clamp-2">
  {item.title}
</p>
<p className="text-xs text-slate-400">
  Watched on {item.watchedOn}
</p>


      <div className="flex justify-between mt-2 text-xs">
        <button
          onClick={() => onEdit(item)}
          className="text-blue-400 flex items-center gap-1"
        >
          <FaEdit /> Edit
        </button>

        <button
          onClick={() => onDelete(item)}
          className="text-red-400 flex items-center gap-1"
        >
          <FaTrash /> Delete
        </button>
      </div>
    </div>
  );
};

export default MediaCard;
