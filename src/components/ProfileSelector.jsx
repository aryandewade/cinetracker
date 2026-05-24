import { useState } from "react";
import { FaPlus, FaTrash, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

const PRESET_AVATARS = [
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

export default function ProfileSelector({
  profiles,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);

  // Form States
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);

  const handleOpenCreate = () => {
    setName("");
    setBio("");
    setSelectedAvatar(PRESET_AVATARS[0]);
    setIsCreating(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      bio: bio.trim(),
      avatar: selectedAvatar.emoji,
      avatarBg: selectedAvatar.bg,
    });
    setIsCreating(false);
  };

  const handleOpenEdit = (profile) => {
    setEditingProfile(profile);
    setName(profile.name);
    setBio(profile.bio || "");
    const preset = PRESET_AVATARS.find((a) => a.emoji === profile.avatar) || PRESET_AVATARS[0];
    setSelectedAvatar(preset);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !editingProfile) return;
    onUpdate({
      ...editingProfile,
      name: name.trim(),
      bio: bio.trim(),
      avatar: selectedAvatar.emoji,
      avatarBg: selectedAvatar.bg,
    });
    setEditingProfile(null);
  };

  const handleDeleteClick = (id) => {
    if (confirm("Are you sure you want to delete this profile? All watchlist data will be lost forever.")) {
      onDelete(id);
      setEditingProfile(null);
    }
  };

  const getBgForEmoji = (emoji) => {
    const found = PRESET_AVATARS.find((a) => a.emoji === emoji);
    return found ? found.bg : "from-slate-600 to-slate-800 text-white";
  };

  // 1. Profile Creation View
  if (isCreating) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 animate-fade-in text-white">
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent">
              Create Profile
            </h2>
            <button
              onClick={() => setIsCreating(false)}
              className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800/80 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Choose Avatar
              </label>
              <div className="grid grid-cols-5 gap-3">
                {PRESET_AVATARS.map((avatar) => (
                  <button
                    key={avatar.emoji}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-tr ${avatar.bg} transition-all duration-300 ${
                      selectedAvatar.emoji === avatar.emoji
                        ? "ring-4 ring-purple-500 scale-110 shadow-lg shadow-purple-500/20"
                        : "opacity-60 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                type="text"
                maxLength={15}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none p-3 rounded-xl text-white transition-all placeholder:text-slate-600"
                placeholder="Enter profile name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Short Bio (Optional)
              </label>
              <textarea
                maxLength={80}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none p-3 rounded-xl text-white transition-all placeholder:text-slate-600 resize-none h-20"
                placeholder="Tell others about your cinematic taste..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3 text-sm font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/40 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-600/20"
              >
                Let's Go
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 2. Profile Editing View
  if (editingProfile) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center px-4 animate-fade-in text-white">
        <div className="bg-slate-900/80 border border-slate-800 p-8 rounded-3xl w-full max-w-md shadow-2xl backdrop-blur-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent">
              Edit Profile
            </h2>
            <button
              onClick={() => setEditingProfile(null)}
              className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800/80 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Choose Avatar
              </label>
              <div className="grid grid-cols-5 gap-3">
                {PRESET_AVATARS.map((avatar) => (
                  <button
                    key={avatar.emoji}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-tr ${avatar.bg} transition-all duration-300 ${
                      selectedAvatar.emoji === avatar.emoji
                        ? "ring-4 ring-purple-500 scale-110 shadow-lg shadow-purple-500/20"
                        : "opacity-60 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    {avatar.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                type="text"
                maxLength={15}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none p-3 rounded-xl text-white transition-all placeholder:text-slate-600"
                placeholder="Enter profile name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Short Bio (Optional)
              </label>
              <textarea
                maxLength={80}
                className="w-full bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none p-3 rounded-xl text-white transition-all placeholder:text-slate-600 resize-none h-20"
                placeholder="Tell others about your cinematic taste..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleDeleteClick(editingProfile.id)}
                className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                <FaTrash size={12} /> Delete Profile
              </button>

              <div className="flex gap-2 flex-1 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="px-4 py-3 text-sm font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/40 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-sm font-semibold text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-indigo-600/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. Grid Selector View (Default)
  return (
    <div className="min-h-screen bg-[#0b0f19] flex flex-col items-center justify-center text-white px-6 py-12 select-none animate-fade-in">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3 bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          {isManaging ? "Manage Profiles" : "Who's watching?"}
        </h1>
        <p className="text-slate-400 text-sm md:text-base mb-12">
          {isManaging
            ? "Select a profile to customize settings or delete."
            : "Choose your profile or create a new watch history."}
        </p>

        {/* Profile Card Grid */}
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-10">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="flex flex-col items-center group cursor-pointer relative"
              onClick={() => (isManaging ? handleOpenEdit(profile) : onSelect(profile))}
            >
              {/* Profile Avatar Outer Circle */}
              <div className="relative">
                <div
                  className={`w-28 h-28 md:w-32 md:h-32 rounded-3xl bg-gradient-to-tr ${getBgForEmoji(
                    profile.avatar
                  )} flex items-center justify-center text-5xl md:text-6xl transition-all duration-300 shadow-xl group-hover:scale-105 group-hover:shadow-2xl ${
                    isManaging
                      ? "opacity-50 ring-2 ring-purple-500 scale-100"
                      : "ring-2 ring-transparent group-hover:ring-white/40"
                  }`}
                >
                  {profile.avatar}
                </div>

                {/* Overlays in Manage Mode */}
                {isManaging && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-3xl transition-opacity group-hover:bg-black/25">
                    <div className="bg-black/60 p-3 rounded-full border border-white/20 text-white shadow-lg">
                      <FaEdit size={16} className="text-purple-400 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>

              {/* Profile Name & Short Bio */}
              <span className="mt-4 text-base md:text-lg font-semibold text-slate-300 group-hover:text-white transition-colors">
                {profile.name}
              </span>
              {profile.bio && (
                <span className="text-xs text-slate-500 mt-1 max-w-[140px] text-center line-clamp-1">
                  {profile.bio}
                </span>
              )}
            </div>
          ))}

          {/* Add Profile Card */}
          {profiles.length < 5 && (
            <div
              onClick={handleOpenCreate}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-3xl border-2 border-dashed border-slate-700 flex items-center justify-center text-slate-500 transition-all duration-300 group-hover:border-slate-400 group-hover:text-slate-300 group-hover:scale-105 hover:bg-slate-900/30">
                <FaPlus size={28} className="transition-transform group-hover:rotate-90 duration-300" />
              </div>
              <span className="mt-4 text-base md:text-lg font-semibold text-slate-500 group-hover:text-slate-300 transition-colors">
                Add Profile
              </span>
            </div>
          )}
        </div>

        {/* Action Toggle buttons */}
        <div className="mt-16 flex justify-center">
          {profiles.length > 0 && (
            <button
              onClick={() => setIsManaging(!isManaging)}
              className={`px-8 py-3 rounded-full text-sm font-semibold tracking-wider transition-all duration-300 border ${
                isManaging
                  ? "bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-600/20 hover:bg-purple-500"
                  : "bg-transparent border-slate-700 text-slate-400 hover:border-slate-300 hover:text-white"
              }`}
            >
              {isManaging ? (
                <span className="flex items-center gap-2">
                  <FaCheck /> Done Managing
                </span>
              ) : (
                "Manage Profiles"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
