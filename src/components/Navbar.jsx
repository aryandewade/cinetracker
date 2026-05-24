import { FaChartBar, FaSun, FaMoon, FaUser, FaShareAlt, FaSignOutAlt, FaChevronDown, FaCheck, FaExternalLinkAlt } from "react-icons/fa";
import { useEffect, useState, useRef } from "react";
import logo from "../assets/logo.png";

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

const Navbar = ({
  showStats,
  setShowStats,
  activeTab,
  setActiveTab,
  activeProfile,
  profiles = [],
  onSelectProfile,
  onLogout,
  isSharedView = false,
  onExitSharedView,
}) => {
  const [isDark, setIsDark] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check system preference or localStorage
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDark(true);
    }
  };

  const getBgForEmoji = (emoji) => {
    const found = PRESET_AVATARS.find((a) => a.emoji === emoji);
    return found ? found.bg : "from-slate-600 to-slate-800 text-white";
  };

  const handleShareWatchlist = () => {
    if (!activeProfile) return;

    try {
      // 1. Curate and optimize payload
      const payload = {
        name: activeProfile.name,
        avatar: activeProfile.avatar,
        avatarBg: activeProfile.avatarBg || getBgForEmoji(activeProfile.avatar),
        bio: activeProfile.bio,
        data: activeProfile.data.map(i => ({
          id: i.id,
          title: i.title,
          poster: i.poster,
          type: i.type,
          watchedOn: i.watchedOn,
          rating: i.rating,
          review: i.review,
          status: i.status
        }))
      };

      // 2. Compress payload to URL base64 safely
      const base64Data = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${base64Data}`;

      // 3. Copy to clipboard
      navigator.clipboard.writeText(shareUrl).then(() => {
        setToastMessage("Share Link Copied! 🍿");
        setShowDropdown(false);
        setTimeout(() => setToastMessage(""), 3000);
      });
    } catch (e) {
      console.error("Failed to generate share link", e);
      setToastMessage("Failed to generate link");
      setTimeout(() => setToastMessage(""), 3000);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/50 border-b border-slate-200/40 dark:border-white/5 transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold px-6 py-2.5 rounded-full shadow-2xl border border-slate-700/30 text-xs tracking-wider animate-bounce flex items-center gap-2">
          <FaCheck className="text-emerald-500" /> {toastMessage}
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Left Side: Brand Logo and Switchable Tabs */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="CineTrack"
              className="h-14 w-auto cursor-pointer object-contain hover:scale-105 transition-transform"
              onClick={() => {
                if (isSharedView) {
                  onExitSharedView();
                } else {
                  window.location.reload();
                }
              }}
            />
          </div>

          {!isSharedView && activeProfile && (
            <div className="flex gap-4 text-sm font-semibold mt-1">
              <button
                onClick={() => setActiveTab('history')}
                className={`transition-colors py-1 ${activeTab === 'history' ? 'text-text-primary border-b-2 border-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('watch-later')}
                className={`transition-colors py-1 ${activeTab === 'watch-later' ? 'text-text-primary border-b-2 border-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
              >
                Watch Later
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Theme, Stats and Profile Switchers */}
        <div className="flex items-center gap-3">
          
          {/* Shared View Return CTA */}
          {isSharedView && (
            <button
              onClick={onExitSharedView}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-full hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow-md shadow-indigo-600/10"
            >
              <FaExternalLinkAlt size={10} /> Go to My App
            </button>
          )}

          {/* Stats Button */}
          {!isSharedView && activeTab === 'history' && activeProfile && (
            <button
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-full transition-all border ${
                showStats
                  ? 'bg-text-primary/10 border-text-primary/15 text-text-primary'
                  : 'bg-transparent border-slate-200/50 dark:border-slate-800 text-text-secondary hover:text-text-primary hover:border-text-primary/30'
              }`}
            >
              <FaChartBar size={12} />
              <span>Stats</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="text-text-secondary hover:text-text-primary border border-slate-200/50 dark:border-slate-800 transition-colors p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900"
          >
            {isDark ? <FaSun size={12} /> : <FaMoon size={12} />}
          </button>

          {/* Profiles Switcher Dropdown */}
          {!isSharedView && activeProfile && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 p-1 pl-2.5 pr-1 border border-slate-200/50 dark:border-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              >
                <div className={`w-7 h-7 rounded-full bg-gradient-to-tr ${activeProfile.avatarBg || getBgForEmoji(activeProfile.avatar)} flex items-center justify-center text-sm shadow-md`}>
                  {activeProfile.avatar}
                </div>
                <FaChevronDown size={10} className={`text-text-secondary mr-1.5 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Box */}
              {showDropdown && (
                <div className="absolute right-0 mt-3.5 w-60 bg-surface dark:bg-slate-950 border border-border dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 animate-fade-in text-text-primary z-50">
                  {/* Current Active Profile Info Header */}
                  <div className="p-2 border-b border-border dark:border-slate-900 mb-2">
                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-wider">Active Profile</p>
                    <p className="font-extrabold text-sm truncate mt-0.5">{activeProfile.name}</p>
                    {activeProfile.bio && (
                      <p className="text-[10px] text-text-secondary/80 mt-0.5 line-clamp-1 italic font-normal">"{activeProfile.bio}"</p>
                    )}
                  </div>

                  {/* Switch to Profiles */}
                  {profiles.filter(p => p.id !== activeProfile.id).length > 0 && (
                    <div className="space-y-1 mb-2">
                      <p className="text-[9px] text-text-secondary font-bold uppercase tracking-wider px-2 py-1">Switch Profile</p>
                      {profiles
                        .filter(p => p.id !== activeProfile.id)
                        .map(p => (
                          <button
                            key={p.id}
                            onClick={() => {
                              onSelectProfile(p);
                              setShowDropdown(false);
                            }}
                            className="w-full flex items-center gap-2.5 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900/60 rounded-xl transition-colors text-left text-xs font-semibold"
                          >
                            <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${p.avatarBg || getBgForEmoji(p.avatar)} flex items-center justify-center text-xs shadow-sm`}>
                              {p.avatar}
                            </div>
                            <span className="truncate">{p.name}</span>
                          </button>
                        ))}
                    </div>
                  )}

                  <div className="border-t border-border dark:border-slate-900/50 pt-2 space-y-1">
                    {/* Share Watchlist */}
                    <button
                      onClick={handleShareWatchlist}
                      className="w-full flex items-center gap-2.5 p-2 hover:bg-purple-600/10 dark:hover:bg-purple-600/15 text-purple-600 dark:text-purple-400 rounded-xl transition-all text-left text-xs font-bold"
                    >
                      <FaShareAlt size={12} />
                      <span>Share My Showcase</span>
                    </button>

                    {/* Go back to Profile Select screen */}
                    <button
                      onClick={() => {
                        onLogout();
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-2.5 p-2 hover:bg-slate-100 dark:hover:bg-slate-900 text-text-secondary hover:text-text-primary rounded-xl transition-colors text-left text-xs font-bold"
                    >
                      <FaSignOutAlt size={12} />
                      <span>Switch Profiles</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
