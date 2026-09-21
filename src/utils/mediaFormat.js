// Poster URL & rating styling helpers (previously duplicated across 4 files)

/**
 * Normalizes a poster URL for card-sized display.
 * - Legacy OMDb URLs: upgrades the "_SX300" crop suffix to the full image.
 * - TMDB URLs are returned as-is (already served at w500).
 */
export const getHighResPoster = (url) => {
  if (!url || url === "N/A") return null;
  return url.replace(/_SX\d+\.jpg$/, ".jpg");
};

/**
 * Poster URL for large displays (details modal, share card):
 * upgrades TMDB w500 to w1280, strips OMDb crop suffixes.
 */
export const getOriginalPoster = (url) => {
  if (!url || url === "N/A") return null;
  return url.replace(/_SX\d+\.jpg$/, ".jpg").replace("/w500/", "/w1280/");
};

/** Compact badge style (solid background, used on MediaCard). */
export const getRatingColor = (rating) => {
  switch (rating) {
    case "Skip": return "bg-rating-skip/80 text-white";
    case "Timepass": return "bg-rating-timepass/80 text-black";
    case "Go for it": return "bg-rating-go/80 text-black";
    case "Perfection": return "bg-rating-perfection/80 text-white";
    default: return "bg-slate-500/80 text-white";
  }
};

/** Outlined badge style (used in DetailsModal). */
export const getRatingBadgeStyle = (rating) => {
  switch (rating) {
    case "Skip": return "bg-rating-skip/20 text-rating-skip border-rating-skip/40";
    case "Timepass": return "bg-rating-timepass/20 text-rating-timepass border-rating-timepass/40";
    case "Go for it": return "bg-rating-go/20 text-rating-go border-rating-go/40";
    case "Perfection": return "bg-rating-perfection/20 text-rating-perfection border-rating-perfection/40";
    default: return "bg-slate-500/20 text-slate-400 border-slate-500/40";
  }
};

/** Hex color for canvas drawing (ShareCardModal). */
export const getRatingColorHex = (rating) => {
  switch (rating) {
    case "Skip": return "#f472b6"; // Pink-400
    case "Timepass": return "#fbbf24"; // Amber-400
    case "Go for it": return "#34d399"; // Emerald-400
    case "Perfection": return "#c084fc"; // Purple-400
    default: return "#94a3b8"; // Slate-400
  }
};
