import https from 'https';

export default function handler(req, res) {
  const query = req.query.query;
  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const TMDB_KEY = process.env.TMDB_API_KEY || "8265bd1679663a7ea12ac168da84d2e8";
  const tmdbUrl = `https://api.tmdb.org/3/search/multi?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}`;

  https.get(tmdbUrl, (tmdbRes) => {
    let data = '';
    tmdbRes.on('data', chunk => data += chunk);
    tmdbRes.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const results = (parsed.results || [])
          .filter(i => i.media_type === 'movie' || i.media_type === 'tv')
          .map(i => ({
            id: `tmdb-${i.id}`,
            imdbID: `tmdb-${i.id}`,
            title: i.title || i.name,
            Title: i.title || i.name,
            year: (i.release_date || i.first_air_date || '').split('-')[0] || 'N/A',
            Year: (i.release_date || i.first_air_date || '').split('-')[0] || 'N/A',
            type: i.media_type === 'tv' ? 'series' : 'movie',
            Type: i.media_type === 'tv' ? 'series' : 'movie',
            poster: i.poster_path ? `https://image.tmdb.org/t/p/w500${i.poster_path}` : 'N/A',
            Poster: i.poster_path ? `https://image.tmdb.org/t/p/w500${i.poster_path}` : 'N/A',
          }));
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ results });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  }).on('error', err => {
    res.status(500).json({ error: err.message });
  });
}
