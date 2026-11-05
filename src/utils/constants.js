// Shared app constants (single source of truth — was duplicated across 5+ files)

export const PRESET_AVATARS = [
  { emoji: "🍿", bg: "from-red-500 to-amber-500 text-white" },
  { emoji: "🎬", bg: "from-slate-700 to-slate-900 text-white" },
  { emoji: "🎥", bg: "from-blue-500 to-indigo-600 text-white" },
  { emoji: "🌟", bg: "from-yellow-400 to-orange-500 text-white" },
  { emoji: "🦁", bg: "from-amber-500 to-yellow-600 text-white" },
  { emoji: "🚀", bg: "from-purple-600 to-pink-500 text-white" },
  { emoji: "👾", bg: "from-violet-600 to-fuchsia-600 text-white" },
  { emoji: "🎨", bg: "from-emerald-400 to-cyan-500 text-white" },
  { emoji: "👑", bg: "from-yellow-300 to-amber-500 text-white" },
];

export const RATINGS = ["Skip", "Timepass", "Go for it", "Perfection"];

export const getBgForEmoji = (emoji) => {
  const found = PRESET_AVATARS.find((a) => a.emoji === emoji);
  return found ? found.bg : "from-slate-600 to-slate-800 text-white";
};
