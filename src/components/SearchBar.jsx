import { useEffect, useRef, useState } from "react";
import { searchTMDB } from "../api/tmdb";
import Loader from "./Loader";
import { FaPlus, FaSearch, FaTimes } from "react-icons/fa";

function PosterImage({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || src === "N/A" || failed) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-text-secondary bg-surface dark:bg-slate-800 text-xs gap-2">
        <span className="text-3xl" aria-hidden="true">🎬</span>
        No Poster
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt || "Poster"}
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

const SearchBar = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);
  const searchSeq = useRef(0);

  const runSearch = async (rawQuery) => {
    const term = rawQuery.trim();
    if (!term) return;

    const seq = ++searchSeq.current;
    setLoading(true);
    setError("");

    try {
      const data = await searchTMDB(term);
      // Ignore stale responses that arrive out of order
      if (seq !== searchSeq.current) return;
      if (!data.length) {
        setResults([]);
        setError("No results found");
      } else {
        setResults(data);
      }
    } catch {
      if (seq === searchSeq.current) setError("Something went wrong. Try again.");
    } finally {
      if (seq === searchSeq.current) setLoading(false);
    }
  };

  // Debounced live search as the user types
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError("");
      setLoading(false);
      return undefined;
    }
    debounceRef.current = setTimeout(() => runSearch(query), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const resetSearch = () => {
    setQuery("");
    setResults([]);
    setError("");
  };

  return (
    <div className="mt-8 transition-all duration-500 ease-in-out">
      <div className="max-w-xl mx-auto flex gap-3">
        <div className="flex-1 relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/50 text-sm pointer-events-none" aria-hidden="true" />
          <input
            id="cine-search-input"
            className="w-full bg-surface dark:bg-slate-900 border border-border px-10 py-3 rounded-full
                     focus:outline-none focus:ring-1 focus:ring-text-secondary text-text-primary shadow-sm placeholder:text-text-secondary/50"
            placeholder="Search for a movie or series..."
            aria-label="Search for a movie or series"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runSearch(query)}
          />
          {query && (
            <button
              aria-label="Clear search"
              onClick={resetSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <button
          onClick={() => runSearch(query)}
          className="bg-text-primary text-background px-8 rounded-full font-medium shadow-md hover:scale-105 transition-transform"
        >
          Search
        </button>
      </div>

      {loading && <div className="mt-8 flex justify-center"><Loader /></div>}

      {error && (
        <p className="text-center text-red-500 mt-6 font-medium bg-red-500/10 py-2 px-4 rounded-full w-fit mx-auto">{error}</p>
      )}

      {results.length > 0 && (
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
          {results.map((item) => (
            <div
              key={item.imdbID || item.id}
              className="group relative bg-surface dark:bg-slate-900 border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="aspect-[2/3] overflow-hidden">
                <PosterImage src={item.Poster || item.poster} alt={item.Title || item.title} />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-sm font-bold line-clamp-2 leading-tight">
                  {item.Title || item.title}
                </p>
                <p className="text-gray-300 text-xs mt-1">{item.Year || item.year}</p>

                <button
                  onClick={() => {
                    onSelect(item);
                    resetSearch();
                  }}
                  className="mt-3 bg-white text-black py-2 rounded-lg text-xs font-bold w-full hover:bg-gray-200 flex items-center justify-center gap-1"
                >
                  <FaPlus size={10} /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
