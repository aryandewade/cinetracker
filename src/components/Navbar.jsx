import { FaChartBar, FaSun, FaMoon } from "react-icons/fa";
import { useEffect, useState } from "react";

const Navbar = ({ showStats, setShowStats, activeTab, setActiveTab }) => {
  const [isDark, setIsDark] = useState(true);

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

  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-surface/80 dark:bg-black/80 border-b border-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1
            className="text-2xl font-bold text-text-primary cursor-pointer tracking-tight"
            onClick={() => window.location.reload()}
          >
            CineTrack
          </h1>

          <div className="flex gap-4 text-sm font-medium">
            <button
              onClick={() => setActiveTab('history')}
              className={`transition-colors ${activeTab === 'history' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('watch-later')}
              className={`transition-colors ${activeTab === 'watch-later' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              Watch Later
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {activeTab === 'history' && (
            <button
              onClick={() => setShowStats(!showStats)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors ${showStats ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
            >
              <FaChartBar />
              <span>Stats</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
          >
            {isDark ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
