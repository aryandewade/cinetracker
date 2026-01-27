import { useState } from "react";
import { searchOMDB } from "../api/omdb";

const SearchBar = ({ onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
  if (!query.trim()) return;
  const data = await searchOMDB(query);
  setResults(data);
};

const resetSearch = () => {
  setQuery("");
  setResults([]);
};



  return (
    <div className="mt-12">
      {/* Search Input */}
      <div className="max-w-2xl mx-auto flex gap-3">
        <input
          className="flex-1 bg-slate-900 border border-slate-700 px-4 py-3 rounded-xl
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Search movie or series..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <button
          onClick={handleSearch}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-xl
                     text-black font-medium"
        >
          Search
        </button>
      </div>

      {/* Results */}
<div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
  {results.map((item) => (
    <div
      key={item.imdbID}
      className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col"
    >
      {item.Poster && item.Poster !== "N/A" ? (
        <img
          src={item.Poster}
          alt={item.Title}
          className="rounded-lg mb-3"
        />
      ) : (
        <div className="h-48 bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 mb-3">
          No Image
        </div>
      )}

      <p className="mt-2 text-sm font-medium text-slate-200 leading-snug line-clamp-2">
  {item.Title}
</p>

<p className="text-xs text-slate-500">
  {item.Year} • {item.Type}
</p>

      <button
        onClick={() => {
  onSelect(item);
  resetSearch();
}}
        className="mt-auto bg-blue-500 hover:bg-blue-600 text-black py-2 rounded-lg text-sm font-medium"
      >
        Add
      </button>
    </div>
  ))}
</div>

    </div>
  );
};

export default SearchBar;
