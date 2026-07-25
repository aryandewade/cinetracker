const fs = require("fs");
const path = require("path");

const DB_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DB_DIR, "cinetracker_db.json");

// Ensure directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const initialData = {
  users: [],
  media: []
};

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf8");
}

function loadData() {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading database file, resetting:", e);
    return initialData;
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing database file:", e);
  }
}

// User helper methods
const users = {
  findByEmail(email) {
    const data = loadData();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  findByUsername(username) {
    const data = loadData();
    return data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  findById(id) {
    const data = loadData();
    return data.users.find(u => u.id === id);
  },

  create(user) {
    const data = loadData();
    const newUser = {
      id: "usr_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      username: user.username,
      email: user.email.toLowerCase(),
      passwordHash: user.passwordHash,
      name: user.name || user.username,
      avatar: user.avatar || "🍿",
      avatarBg: user.avatarBg || "from-red-500 to-amber-500 text-white",
      bio: user.bio || "Movie & TV enthusiast tracking favorites on Cinetracker.",
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    saveData(data);
    return newUser;
  },

  update(id, updates) {
    const data = loadData();
    const index = data.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    data.users[index] = {
      ...data.users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveData(data);
    return data.users[index];
  },

  getAllWithStats() {
    const data = loadData();
    return data.users.map(u => {
      const userMedia = data.media.filter(m => m.userId === u.id);
      const watchedCount = userMedia.filter(m => m.status !== "watch-later").length;
      const watchLaterCount = userMedia.filter(m => m.status === "watch-later").length;
      return {
        id: u.id,
        username: u.username,
        name: u.name,
        avatar: u.avatar,
        avatarBg: u.avatarBg,
        bio: u.bio,
        createdAt: u.createdAt,
        stats: {
          total: userMedia.length,
          watched: watchedCount,
          watchLater: watchLaterCount
        }
      };
    });
  }
};

// Media helper methods
const media = {
  getByUserId(userId) {
    const data = loadData();
    return data.media.filter(m => m.userId === userId);
  },

  getPublicByUserId(userId) {
    const data = loadData();
    // Return all media for public profile
    return data.media.filter(m => m.userId === userId);
  },

  save(userId, item) {
    const data = loadData();
    const itemId = item.id || ("m_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7));
    const index = data.media.findIndex(m => m.id === itemId && m.userId === userId);

    const mediaObj = {
      ...item,
      id: itemId,
      userId: userId,
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      data.media[index] = mediaObj;
    } else {
      mediaObj.createdAt = new Date().toISOString();
      data.media.push(mediaObj);
    }

    saveData(data);
    return mediaObj;
  },

  delete(userId, itemId) {
    const data = loadData();
    const initialLength = data.media.length;
    data.media = data.media.filter(m => !(m.id === itemId && m.userId === userId));
    if (data.media.length !== initialLength) {
      saveData(data);
      return true;
    }
    return false;
  },

  syncBatch(userId, itemsArray) {
    if (!Array.isArray(itemsArray)) return [];
    const data = loadData();
    const existingIds = new Set(data.media.filter(m => m.userId === userId).map(m => m.id));

    itemsArray.forEach(item => {
      const itemId = item.id || ("m_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7));
      const mediaObj = {
        ...item,
        id: itemId,
        userId: userId,
        updatedAt: new Date().toISOString()
      };
      const existingIdx = data.media.findIndex(m => m.id === itemId && m.userId === userId);
      if (existingIdx >= 0) {
        data.media[existingIdx] = mediaObj;
      } else {
        mediaObj.createdAt = new Date().toISOString();
        data.media.push(mediaObj);
      }
    });

    saveData(data);
    return data.media.filter(m => m.userId === userId);
  }
};

module.exports = {
  users,
  media
};
