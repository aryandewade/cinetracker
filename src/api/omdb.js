import axios from "axios";

const API_KEY = import.meta.env.VITE_OMDB_API_KEY;
const BASE_URL = "https://www.omdbapi.com/";

export const searchOMDB = async (query) => {
  const res = await axios.get(BASE_URL, {
    params: {
      apikey: API_KEY,
      s: query,
      
    }
  });

  return res.data.Search || [];
};
