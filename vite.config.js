import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import https from 'https';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const TMDB_KEY = env.TMDB_API_KEY || "8265bd1679663a7ea12ac168da84d2e8";

  return {
    plugins: [
      react(),
      {
        name: 'tmdb-secure-proxy',
        configureServer(server) {
          // 1. Search Proxy
          server.middlewares.use('/api/tmdb/search', (req, res) => {
            const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
            const query = urlParams.get('query');
            if (!query) {
              res.statusCode = 400;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ error: 'Query parameter is required' }));
            }

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
                  res.end(JSON.stringify({ results }));
                } catch (e) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: e.message }));
                }
              });
            }).on('error', err => {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            });
          });

          // 2. Details Proxy
          server.middlewares.use('/api/tmdb/details', (req, res) => {
            const urlParams = new URLSearchParams(req.url.split('?')[1] || '');
            const id = (urlParams.get('id') || '').replace('tmdb-', '');
            const mediaType = urlParams.get('type') === 'series' ? 'tv' : 'movie';
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
                  res.end(JSON.stringify(formattedDetails));
                } catch (e) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: e.message }));
                }
              });
            }).on('error', err => {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            });
          });
        }
      }
    ],
    server: {
      port: 5173,
      proxy: {
        '/api/auth': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/api/media': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
        '/api/users': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
