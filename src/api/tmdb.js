import axios from "axios";

export const searchTMDB = async (query) => {
  if (!query || !query.trim()) return [];

  try {
    const res = await axios.get("/api/tmdb/search", {
      params: { query: query.trim() }
    });
    return res.data?.results || [];
  } catch (err) {
    console.error("TMDB Proxy Search Error:", err.response ? err.response.data : err.message);
    return [];
  }
};

export const fetchTMDBDetails = async (id, mediaType) => {
  try {
    const res = await axios.get("/api/tmdb/details", {
      params: { id, type: mediaType }
    });
    return res.data || {};
  } catch (err) {
    console.error("TMDB Proxy Details Error:", err.response ? err.response.data : err.message);
    throw err;
  }
};
