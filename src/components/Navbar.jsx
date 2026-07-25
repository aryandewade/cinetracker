import { FaChartBar, FaSun, FaMoon, FaUser, FaShareAlt, FaSignOutAlt, FaChevronDown, FaCheck, FaExternalLinkAlt, FaUsers, FaDatabase, FaCloud } from "react-icons/fa";
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
  onOpenAuth,
  onOpenCommunity,
  authUser = null,
}) => {
  const [isDark, setIsDark] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
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
      const payload = {
        name: activeProfile.name,
        avatar: activeProfile.avatar,
        avatarBg: activeProfile.avatarBg || getBgForEmoji(activeProfile.avatar),
        bio: activeProfile.bio,
        data: (activeProfile.data || []).map(i => ({
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

      const base64Data = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      const shareUrl = `${window.location.origin}${window.location.pathname}?share=${base64Data}`;

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

        {/* Right Side: Community, Theme, Stats and Profile Switchers */}
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

          {/* Community Explore Button */}
          <button
            onClick={onOpenCommunity}
            className="flex items-center gap-1.5 text-xs font-semibold py-2 px-3.5 rounded-full bg-purple-600/10 border border-purple-500/30 text-purple-400 hover:bg-purple-600 hover:text-white transition-all shadow-sm"
            title="Explore other users and public watchlists"
          >
            <FaUsers size={12} />
            <span>Community</span>
          </button>

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

          {/* Auth Button or Account Dropdown */}
          {!authUser ? (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 text-xs font-bold py-2 px-4 rounded-full bg-white/10 dark:bg-white/10 border border-white/20 dark:border-white/20 text-white backdrop-blur-xl hover:bg-white/20 hover:border-white/40 shadow-lg hover:shadow-red-500/10 transition-all duration-300 group"
            >
              <FaUser size={11} className="text-red-400 group-hover:scale-110 transition-transform" />
              <span>Sign In / Register</span>
            </button>
          ) : (
            /* Profiles & Account Switcher Dropdown */
            !isSharedView && activeProfile && (
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
                  <div className="absolute right-0 mt-3.5 w-64 bg-surface dark:bg-slate-950 border border-border dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 animate-fade-in text-text-primary z-50">
                    {/* Current Active User Info Header */}
                    <div className="p-2.5 border-b border-border dark:border-slate-900 mb-2 bg-slate-900/40 rounded-xl">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider flex items-center gap-1">
                          <FaCloud size={10} /> Supabase Cloud Account
                        </p>
                        <span className="text-[9px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                          @{authUser.username}
                        </span>
                      </div>
                      <p className="font-extrabold text-sm truncate mt-1">{activeProfile.name}</p>
                      {activeProfile.bio && (
                        <p className="text-[10px] text-text-secondary/80 mt-0.5 line-clamp-1 italic font-normal">"{activeProfile.bio}"</p>
                      )}
                    </div>

                    <div className="border-t border-border dark:border-slate-900/50 pt-2 space-y-1">
                      {/* Share Watchlist */}
                      <button
                        onClick={handleShareWatchlist}
                        className="w-full flex items-center gap-2.5 p-2 hover:bg-purple-600/10 dark:hover:bg-purple-600/15 text-purple-600 dark:text-purple-400 rounded-xl transition-all text-left text-xs font-bold"
                      >
                        <FaShareAlt size={12} />
                        <span>Share My Showcase</span>
                      </button>

                      {/* Log Out */}
                      <button
                        onClick={() => {
                          onLogout();
                          setShowDropdown(false);
                        }}
                        className="w-full flex items-center gap-2.5 p-2 hover:bg-red-500/10 text-red-500 rounded-xl transition-colors text-left text-xs font-bold"
                      >
                        <FaSignOutAlt size={12} />
                        <span>Sign Out ({authUser.username})</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
