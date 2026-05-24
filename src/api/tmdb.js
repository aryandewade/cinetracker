import axios from "axios";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.tmdb.org/3";

const tmdb = axios.create({
  baseURL: BASE_URL,
});

console.log("[TMDB Client] Initialized. API Key length:", API_KEY ? API_KEY.length : "undefined");

// Interceptor to ensure api_key is recursively merged into all request query parameters
tmdb.interceptors.request.use((config) => {
  config.params = config.params || {};
  config.params.api_key = API_KEY;
  console.log("[TMDB Outbox Request]", config.method.toUpperCase(), config.url, "Params:", { ...config.params, api_key: config.params.api_key ? "HIDDEN_" + config.params.api_key.slice(-4) : "NONE" });
  return config;
});

export const searchTMDB = async (query) => {
  if (!query.trim()) return [];
  console.log(`[TMDB Search Triggered] Query: "${query}"`);
  try {
    const res = await tmdb.get("/search/multi", {
      params: {
        query: query,
      },
    });

    console.log("[TMDB Search Response Success]", res.status, `Results count: ${res.data.results?.length || 0}`);
    const results = res.data.results || [];
    return results
      .filter((item) => item.media_type === "movie" || item.media_type === "tv")
      .map((item) => ({
        imdbID: `tmdb-${item.id}`,
        Title: item.title || item.name,
        Year: (item.release_date || item.first_air_date || "").split("-")[0] || "N/A",
        Type: item.media_type === "tv" ? "series" : "movie",
        Poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "N/A",
      }));
  } catch (err) {
    console.error("[TMDB Search Error Details]", err.response ? { status: err.response.status, data: err.response.data } : err.message);
    throw err;
  }
};

export const fetchTMDBDetails = async (id, mediaType) => {
  try {
    let tmdbId = id;
    let type = mediaType === "series" ? "tv" : "movie";

    // 1. Check for legacy IMDb ID (starts with "tt")
    if (id.startsWith("tt")) {
      const findRes = await tmdb.get(`/find/${id}`, {
        params: {
          external_source: "imdb_id",
        },
      });

      const findData = findRes.data;
      if (findData.movie_results?.length > 0) {
        tmdbId = findData.movie_results[0].id;
        type = "movie";
      } else if (findData.tv_results?.length > 0) {
        tmdbId = findData.tv_results[0].id;
        type = "tv";
      } else {
        throw new Error("Could not find legacy movie on TMDB.");
      }
    } else if (id.startsWith("tmdb-")) {
      // Extract TMDB ID from prefixed ID
      tmdbId = id.replace("tmdb-", "");
    }

    // 2. Fetch primary movie/tv show details along with credits & certificates
    const appendToResponse = type === "tv" ? "credits,content_ratings" : "credits,release_dates";
    const detailsRes = await tmdb.get(`/${type}/${tmdbId}`, {
      params: {
        append_to_response: appendToResponse,
      },
    });

    const details = detailsRes.data;

    // 3. Extract certification rating
    let rated = "G";
    if (type === "tv") {
      rated = details.content_ratings?.results?.find((r) => r.iso_3166_1 === "US")?.rating || "TV-PG";
    } else {
      const releases = details.release_dates?.results?.find((r) => r.iso_3166_1 === "US")?.release_dates || [];
      rated = releases.find((r) => r.certification)?.certification || "PG-13";
    }

    // 4. Map details to standard format
    return {
      Title: details.title || details.name,
      Year: (details.release_date || details.first_air_date || "").split("-")[0] || "N/A",
      Rated: rated,
      Runtime: details.runtime ? `${details.runtime} min` : details.episode_run_time?.[0] ? `${details.episode_run_time[0]} min` : "N/A",
      Genre: details.genres?.map((g) => g.name).join(", ") || "N/A",
      Director: details.credits?.crew?.find((c) => c.job === "Director")?.name || details.created_by?.[0]?.name || "N/A",
      Writer: details.credits?.crew?.find((c) => c.job === "Writer" || c.job === "Screenplay")?.name || "N/A",
      Actors: details.credits?.cast?.slice(0, 5).map((a) => a.name).join(", ") || "N/A",
      Plot: details.overview || "No description available.",
      Poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : "N/A",
      imdbRating: details.vote_average ? `${details.vote_average.toFixed(1)}/10` : "N/A",
      Ratings: [
        { Source: "TMDb User Score", Value: details.vote_average ? `${(details.vote_average * 10).toFixed(0)}%` : "N/A" },
        { Source: "Popularity Rank", Value: details.popularity ? details.popularity.toFixed(0) : "N/A" },
      ],
      Awards: details.popularity
        ? `Popularity: ${details.popularity.toFixed(0)} • Votes: ${details.vote_count || 0}`
        : "N/A",
      Response: "True",
    };
  } catch (err) {
    console.error("TMDB Details Error:", err);
    throw err;
  }
};
