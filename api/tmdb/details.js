import https from 'https';

export default function handler(req, res) {
  const id = (req.query.id || '').replace('tmdb-', '');
  const mediaType = req.query.type === 'series' ? 'tv' : 'movie';
  if (!id) {
    return res.status(400).json({ error: 'ID parameter is required' });
  }

  const TMDB_KEY = process.env.TMDB_API_KEY || "8265bd1679663a7ea12ac168da84d2e8";
  const appendToResponse = mediaType === 'tv' ? 'credits,content_ratings' : 'credits,release_dates';
  const tmdbUrl = `https://api.tmdb.org/3/${mediaType}/${id}?api_key=${TMDB_KEY}&append_to_response=${appendToResponse}`;

  https.get(tmdbUrl, (tmdbRes) => {
    let data = '';
    tmdbRes.on('data', chunk => data += chunk);
    tmdbRes.on('end', () => {
      try {
        const details = JSON.parse(data);
        let rated = 'G';
        if (mediaType === 'tv') {
          rated = details.content_ratings?.results?.find(r => r.iso_3166_1 === 'US')?.rating || 'TV-PG';
        } else {
          const releases = details.release_dates?.results?.find(r => r.iso_3166_1 === 'US')?.release_dates || [];
          rated = releases.find(r => r.certification)?.certification || 'PG-13';
        }
        const formattedDetails = {
          Title: details.title || details.name,
          Year: (details.release_date || details.first_air_date || '').split('-')[0] || 'N/A',
          Rated: rated,
          Runtime: details.runtime ? `${details.runtime} min` : details.episode_run_time?.[0] ? `${details.episode_run_time[0]} min` : 'N/A',
          Genre: details.genres?.map(g => g.name).join(', ') || 'N/A',
          Director: details.credits?.crew?.find(c => c.job === 'Director')?.name || details.created_by?.[0]?.name || 'N/A',
          Writer: details.credits?.crew?.find(c => c.job === 'Writer' || c.job === 'Screenplay')?.name || 'N/A',
          Actors: details.credits?.cast?.slice(0, 5).map(a => a.name).join(', ') || 'N/A',
          Plot: details.overview || 'No description available.',
          Poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : 'N/A',
          imdbRating: details.vote_average ? `${details.vote_average.toFixed(1)}/10` : 'N/A',
          Ratings: [
            { Source: 'TMDb User Score', Value: details.vote_average ? `${(details.vote_average * 10).toFixed(0)}%` : 'N/A' },
            { Source: 'Popularity Rank', Value: details.popularity ? details.popularity.toFixed(0) : 'N/A' },
          ],
          Awards: details.popularity
            ? `Popularity: ${details.popularity.toFixed(0)} • Votes: ${details.vote_count || 0}`
            : 'N/A',
          Response: 'True',
        };
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(formattedDetails);
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });
  }).on('error', err => {
    res.status(500).json({ error: err.message });
  });
}
