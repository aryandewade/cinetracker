const http = require("http");
const url = require("url");
const db = require("./db");
const { generateToken, verifyToken, hashPassword, verifyPassword } = require("./jwt");

const PORT = process.env.PORT || 5000;

// Helper to parse JSON body
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

// Send JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
  });
  res.end(JSON.stringify(data));
}

// Authenticate Middleware Helper
function authenticate(req) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  return verifyToken(token);
}

const server = http.createServer(async (req, res) => {
  // CORS Preflight
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

    // ----------------------------------------------------
    // Media / Watchlist Routes
    // ----------------------------------------------------
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

    // ----------------------------------------------------
    // Community / Social Users Routes
    // ----------------------------------------------------
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

    // Fallthrough 404
    sendJson(res, 404, { error: "Endpoint not found." });
  } catch (err) {
    console.error("API error:", err);
    sendJson(res, 500, { error: "Internal server error." });
  }
});

server.listen(PORT, () => {
  console.log(`🎬 Cinetracker API Database Server running on http://localhost:${PORT}`);
});
