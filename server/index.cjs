const http = require("http");
const https = require("https");
const url = require("url");
const fs = require("fs");
const path = require("path");

// Load .env file into process.env (Backend Only)
try {
  const envPath = path.join(__dirname, "..", ".env");
  if (fs.existsSync(envPath)) {
    const envLines = fs.readFileSync(envPath, "utf8").split("\n");
    envLines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim().replace(/^["']|["']$/g, "");
        process.env[key] = value;
      }
    });
  }
} catch (e) {}

const db = require("./db.cjs");
const { generateToken, verifyToken, hashPassword, verifyPassword } = require("./jwt.cjs");

const PORT = process.env.PORT || 5000;
const TMDB_API_KEY = process.env.TMDB_API_KEY || "8265bd1679663a7ea12ac168da84d2e8";

function fetchHttps(targetUrl) {
  return new Promise((resolve, reject) => {
    https.get(targetUrl, (response) => {
      let data = "";
      response.on("data", (chunk) => { data += chunk; });
      response.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on("error", (err) => reject(err));
  });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
  });
  res.end(JSON.stringify(data));
}

function authenticate(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    });
    return res.end();
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method;

  try {
    // ----------------------------------------------------
    // TMDB API Secure Proxy Routes (Hides API Key from Browser)
    // ----------------------------------------------------
    if (method === "GET" && path === "/api/tmdb/search") {
      const searchQuery = parsedUrl.query.query;
      if (!searchQuery) {
        return sendJson(res, 400, { error: "Query parameter is required" });
      }

      const tmdbUrl = `https://api.tmdb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`;
      const tmdbData = await fetchHttps(tmdbUrl);
      const results = (tmdbData.results || [])
        .filter((item) => item.media_type === "movie" || item.media_type === "tv")
        .map((item) => {
          const releaseYear = (item.release_date || item.first_air_date || "").split("-")[0] || "N/A";
          return {
            id: `tmdb-${item.id}`,
            imdbID: `tmdb-${item.id}`,
            title: item.title || item.name,
            Title: item.title || item.name,
            year: releaseYear,
            Year: releaseYear,
            type: item.media_type === "tv" ? "series" : "movie",
            Type: item.media_type === "tv" ? "series" : "movie",
            poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "N/A",
            Poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "N/A",
          };
        });

      return sendJson(res, 200, { results });
    }

    if (method === "GET" && path === "/api/tmdb/details") {
      const id = parsedUrl.query.id;
      const mediaType = parsedUrl.query.type;
      if (!id) {
        return sendJson(res, 400, { error: "ID parameter is required" });
      }

      let tmdbId = id.replace("tmdb-", "");
      let type = mediaType === "series" ? "tv" : "movie";
      const appendToResponse = type === "tv" ? "credits,content_ratings" : "credits,release_dates";
      const tmdbUrl = `https://api.tmdb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=${appendToResponse}`;

      const details = await fetchHttps(tmdbUrl);

      let rated = "G";
      if (type === "tv") {
        rated = details.content_ratings?.results?.find((r) => r.iso_3166_1 === "US")?.rating || "TV-PG";
      } else {
        const releases = details.release_dates?.results?.find((r) => r.iso_3166_1 === "US")?.release_dates || [];
        rated = releases.find((r) => r.certification)?.certification || "PG-13";
      }

      const formattedDetails = {
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

      return sendJson(res, 200, formattedDetails);
    }

    // ----------------------------------------------------
    // Auth Routes
    // ----------------------------------------------------
    if (method === "POST" && path === "/api/auth/register") {
      const body = await parseBody(req);
      const { username, email, password, name, avatar, avatarBg, bio } = body;

      if (!username || !email || !password) {
        return sendJson(res, 400, { error: "Username, email, and password are required." });
      }

      if (db.users.findByEmail(email)) {
        return sendJson(res, 400, { error: "A user with this email already exists." });
      }

      if (db.users.findByUsername(username)) {
        return sendJson(res, 400, { error: "Username is already taken." });
      }

      const passwordHash = hashPassword(password);
      const user = db.users.create({
        username,
        email,
        passwordHash,
        name: name || username,
        avatar,
        avatarBg,
        bio
      });

      const token = generateToken({ id: user.id, username: user.username });
      const { passwordHash: _, ...userSafe } = user;

      return sendJson(res, 201, {
        token,
        user: userSafe
      });
    }

    if (method === "POST" && path === "/api/auth/login") {
      const body = await parseBody(req);
      const { emailOrUsername, password } = body;

      if (!emailOrUsername || !password) {
        return sendJson(res, 400, { error: "Email/username and password are required." });
      }

      let user = db.users.findByEmail(emailOrUsername);
      if (!user) {
        user = db.users.findByUsername(emailOrUsername);
      }

      if (!user || !verifyPassword(password, user.passwordHash)) {
        return sendJson(res, 401, { error: "Invalid credentials." });
      }

      const token = generateToken({ id: user.id, username: user.username });
      const { passwordHash: _, ...userSafe } = user;

      return sendJson(res, 200, {
        token,
        user: userSafe
      });
    }

    if (method === "GET" && path === "/api/auth/me") {
      const authUser = authenticate(req);
      if (!authUser) {
        return sendJson(res, 401, { error: "Unauthorized." });
      }

      const user = db.users.findById(authUser.id);
      if (!user) {
        return sendJson(res, 404, { error: "User not found." });
      }

      const { passwordHash: _, ...userSafe } = user;
      const userMedia = db.media.getByUserId(user.id);

      return sendJson(res, 200, {
        user: userSafe,
        data: userMedia
      });
    }

    if (method === "PUT" && path === "/api/auth/profile") {
      const authUser = authenticate(req);
      if (!authUser) {
        return sendJson(res, 401, { error: "Unauthorized." });
      }

      const body = await parseBody(req);
      const updatedUser = db.users.update(authUser.id, {
        name: body.name,
        avatar: body.avatar,
        avatarBg: body.avatarBg,
        bio: body.bio
      });

      if (!updatedUser) {
        return sendJson(res, 404, { error: "User not found." });
      }

      const { passwordHash: _, ...userSafe } = updatedUser;
      return sendJson(res, 200, { user: userSafe });
    }

    if (method === "GET" && path === "/api/media") {
      const authUser = authenticate(req);
      if (!authUser) {
        return sendJson(res, 401, { error: "Unauthorized." });
      }

      const userMedia = db.media.getByUserId(authUser.id);
      return sendJson(res, 200, { data: userMedia });
    }

    if (method === "POST" && path === "/api/media") {
      const authUser = authenticate(req);
      if (!authUser) {
        return sendJson(res, 401, { error: "Unauthorized." });
      }

      const body = await parseBody(req);
      if (!body || !body.title) {
        return sendJson(res, 400, { error: "Media title is required." });
      }

      const savedItem = db.media.save(authUser.id, body);
      return sendJson(res, 200, { item: savedItem });
    }

    if (method === "DELETE" && path.startsWith("/api/media/")) {
      const authUser = authenticate(req);
      if (!authUser) {
        return sendJson(res, 401, { error: "Unauthorized." });
      }

      const itemId = path.replace("/api/media/", "");
      const success = db.media.delete(authUser.id, itemId);

      if (success) {
        return sendJson(res, 200, { message: "Item deleted successfully." });
      } else {
        return sendJson(res, 404, { error: "Item not found." });
      }
    }

    if (method === "POST" && path === "/api/media/sync") {
      const authUser = authenticate(req);
      if (!authUser) {
        return sendJson(res, 401, { error: "Unauthorized." });
      }

      const body = await parseBody(req);
      const items = Array.isArray(body.items) ? body.items : [];
      const syncedData = db.media.syncBatch(authUser.id, items);

      return sendJson(res, 200, { data: syncedData });
    }

    if (method === "GET" && path === "/api/users") {
      const allUsers = db.users.getAllWithStats();
      return sendJson(res, 200, { users: allUsers });
    }

    if (method === "GET" && path.startsWith("/api/users/")) {
      const param = decodeURIComponent(path.replace("/api/users/", ""));
      let targetUser = db.users.findByUsername(param);
      if (!targetUser) {
        targetUser = db.users.findById(param);
      }

      if (!targetUser) {
        return sendJson(res, 404, { error: "User profile not found." });
      }

      const { passwordHash: _, ...userSafe } = targetUser;
      const userMedia = db.media.getPublicByUserId(targetUser.id);

      return sendJson(res, 200, {
        user: userSafe,
        data: userMedia
      });
    }

    sendJson(res, 404, { error: "Endpoint not found." });
  } catch (err) {
    console.error("API error:", err);
    sendJson(res, 500, { error: "Internal server error." });
  }
});

server.listen(PORT, () => {
  console.log(`🎬 Cinetracker API Database Server running on http://localhost:${PORT}`);
});
