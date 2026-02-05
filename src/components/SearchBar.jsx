import { useState } from "react";
import { searchOMDB } from "../api/omdb";
import Loader from "./Loader";
import { FaPlus, FaTimes } from "react-icons/fa";

const SearchBar = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const data = await searchOMDB(query);
      if (!data.length) {
        setError("No results found");
      } else {
        setResults(data);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setQuery("");
    setResults([]);
    setError("");
  };

  return (
    <div className="mt-8 transition-all duration-500 ease-in-out">
      <div className="max-w-xl mx-auto flex gap-3 relative">
        <input
          className="flex-1 bg-surface dark:bg-slate-900 border border-border px-5 py-3 rounded-full
                     focus:outline-none focus:ring-1 focus:ring-text-secondary text-text-primary shadow-sm placeholder:text-text-secondary/50"
          placeholder="Search for a movie..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />

        <button
          onClick={handleSearch}
          className="bg-text-primary text-background px-8 rounded-full font-medium shadow-md hover:scale-105 transition-transform"
        >
          Search
        </button>

        {query && (
          <button
            onClick={resetSearch}
            className="absolute right-32 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {loading && <div className="mt-8 flex justify-center"><Loader /></div>}

      {error && (
        <p className="text-center text-red-500 mt-6 font-medium bg-red-500/10 py-2 px-4 rounded-full w-fit mx-auto">{error}</p>
      )}

      {results.length > 0 && (
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
          {results.map((item) => (
            <div
              key={item.imdbID}
              className="group relative bg-surface dark:bg-slate-900 border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              {item.Poster !== "N/A" ? (
                <div className="aspect-[2/3] overflow-hidden">
                  <img
                    src={item.Poster}
                    alt={item.Title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
              ) : (
                <div className="aspect-[2/3] bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-text-secondary">
                  No Image
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <p className="text-white text-sm font-bold line-clamp-2 leading-tight">
                  {item.Title}
                </p>
                <p className="text-gray-300 text-xs mt-1">{item.Year}</p>

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
