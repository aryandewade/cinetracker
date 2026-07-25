const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://rtgkxjwdfzabehlmnmdl.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_HJ92Q6o8ycqkSbsFKSFRLQ_pw7_VWFO";

const TOKEN_KEY = "cineTrack_supabase_token";
const USER_KEY = "cineTrack_supabase_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Supabase REST Helper
async function supabaseFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_ANON_KEY,
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else {
    headers["Authorization"] = `Bearer ${SUPABASE_ANON_KEY}`;
  }

  const response = await fetch(`${SUPABASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.msg || data.message || data.error_description || data.error || `Supabase error (${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// -----------------------------------------------------------
// Supabase Authentication APIs
// -----------------------------------------------------------

export async function registerUser({ username, email, password, name, avatar, avatarBg, bio }) {
  // 1. Sign up with Supabase Auth
  const authRes = await supabaseFetch("/auth/v1/signup", {
    method: "POST",
    body: JSON.stringify({
      email,
      password,
      data: {
        username,
        name: name || username,
        avatar: avatar || "🍿",
        avatar_bg: avatarBg || "from-red-500 to-amber-500 text-white",
        bio: bio || "Movie & TV enthusiast tracking favorites on Cinetracker."
      }
    })
  });

  const user = authRes?.user || authRes;
  if (!user || !user.id) {
    throw new Error(authRes?.error_description || authRes?.msg || "Registration failed. Please check your credentials.");
  }

  const sessionToken = authRes.access_token || authRes.session?.access_token;
  if (sessionToken) {
    setToken(sessionToken);
  }

  const profileData = {
    id: user.id,
    username: username,
    email: email.toLowerCase(),
    name: name || username,
    avatar: avatar || "🍿",
    avatar_bg: avatarBg || "from-red-500 to-amber-500 text-white",
    bio: bio || "Movie & TV enthusiast tracking favorites on Cinetracker."
  };

  // 2. Insert into profiles table
  try {
    await supabaseFetch("/rest/v1/profiles", {
      method: "POST",
      headers: {
        "Prefer": "return=representation,resolution=merge-duplicates"
      },
      body: JSON.stringify(profileData)
    });
  } catch (e) {
    console.warn("Profiles table auto-upsert notice:", e);
  }

  const returnUser = {
    id: user.id,
    username,
    email,
    name: profileData.name,
    avatar: profileData.avatar,
    avatarBg: profileData.avatar_bg,
    bio: profileData.bio
  };

  setStoredUser(returnUser);
  return { token: sessionToken, user: returnUser };
}

export function loginWithGoogle() {
  const redirectUrl = window.location.origin;
  window.location.href = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUrl)}`;
}

export async function loginUser(emailOrUsername, password) {
  let email = emailOrUsername;

  // If user entered a username instead of an email, try resolving email from profiles table
  if (!emailOrUsername.includes("@")) {
    try {
      const foundProfiles = await supabaseFetch(
        `/rest/v1/profiles?username=eq.${encodeURIComponent(emailOrUsername)}&select=email`,
        { method: "GET" }
      );
      if (foundProfiles && foundProfiles.length > 0 && foundProfiles[0].email) {
        email = foundProfiles[0].email;
      }
    } catch (e) {
      // Ignore fallback
    }
  }

  const authRes = await supabaseFetch("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({
      email,
      password
    })
  });

  const authUser = authRes?.user;
  const sessionToken = authRes?.access_token;

  if (!authRes || !authUser || !authUser.id) {
    const errorMsg = authRes?.error_description || authRes?.msg || "Invalid email/username or password.";
    throw new Error(errorMsg);
  }

  setToken(sessionToken);

  // Fetch complete profile from profiles table
  let profile = null;
  try {
    const profs = await supabaseFetch(`/rest/v1/profiles?id=eq.${authUser.id}`, { method: "GET" });
    if (profs && profs.length > 0) {
      profile = profs[0];
    }
  } catch (e) {
    console.warn("Could not fetch profile from table:", e);
  }

  const userObj = {
    id: authUser.id,
    email: authUser.email,
    username: profile?.username || authUser.user_metadata?.username || authUser.email?.split("@")[0] || "user",
    name: profile?.name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "User",
    avatar: profile?.avatar || authUser.user_metadata?.avatar || "🍿",
    avatarBg: profile?.avatar_bg || authUser.user_metadata?.avatar_bg || "from-red-500 to-amber-500 text-white",
    bio: profile?.bio || authUser.user_metadata?.bio || ""
  };

  setStoredUser(userObj);
  return { token: sessionToken, user: userObj };
}

export async function getCurrentUser() {
  const token = getToken();
  if (!token) return null;

  try {
    const authUser = await supabaseFetch("/auth/v1/user", { method: "GET" });
    if (!authUser || !authUser.id) {
      clearSession();
      return null;
    }

    let profile = null;
    try {
      const profs = await supabaseFetch(`/rest/v1/profiles?id=eq.${authUser.id}`, { method: "GET" });
      if (profs && profs.length > 0) {
        profile = profs[0];
      }
    } catch (e) {}

    const userObj = {
      id: authUser.id,
      email: authUser.email,
      username: profile?.username || authUser.user_metadata?.username || authUser.email.split("@")[0],
      name: profile?.name || authUser.user_metadata?.name || authUser.email.split("@")[0],
      avatar: profile?.avatar || authUser.user_metadata?.avatar || "🍿",
      avatarBg: profile?.avatar_bg || authUser.user_metadata?.avatar_bg || "from-red-500 to-amber-500 text-white",
      bio: profile?.bio || authUser.user_metadata?.bio || ""
    };

    // Fetch user media items
    let userMedia = [];
    try {
      userMedia = await supabaseFetch(`/rest/v1/media_items?user_id=eq.${authUser.id}`, { method: "GET" });
    } catch (e) {}

    setStoredUser(userObj);
    return { user: userObj, data: userMedia || [] };
  } catch (e) {
    clearSession();
    return null;
  }
}

export async function updateProfile(profileData) {
  const user = getStoredUser();
  if (!user) throw new Error("Unauthorized");

  const updates = {
    name: profileData.name,
    avatar: profileData.avatar,
    avatar_bg: profileData.avatarBg,
    bio: profileData.bio,
    updated_at: new Date().toISOString()
  };

  try {
    await supabaseFetch(`/rest/v1/profiles?id=eq.${user.id}`, {
      method: "PATCH",
      headers: {
        "Prefer": "return=representation"
      },
      body: JSON.stringify(updates)
    });
  } catch (e) {
    console.warn("Could not patch profile in Supabase table:", e);
  }

  const updatedUser = {
    ...user,
    name: profileData.name || user.name,
    avatar: profileData.avatar || user.avatar,
    avatarBg: profileData.avatarBg || user.avatarBg,
    bio: profileData.bio || user.bio
  };

  setStoredUser(updatedUser);
  return { user: updatedUser };
}

// -----------------------------------------------------------
// Supabase Media Collection APIs
// -----------------------------------------------------------

export async function fetchUserMedia() {
  const user = getStoredUser();
  if (!user) return { data: [] };

  const data = await supabaseFetch(`/rest/v1/media_items?user_id=eq.${user.id}`, { method: "GET" });
  return { data: data || [] };
}

export async function saveMediaItem(item) {
  const user = getStoredUser();
  if (!user) throw new Error("Unauthorized");

  const mediaRow = {
    id: item.id || ("m_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7)),
    user_id: user.id,
    title: item.title,
    poster: item.poster,
    type: item.type,
    status: item.status,
    rating: item.rating || 0,
    review: item.review || "",
    watched_on: item.watchedOn || item.watched_on || null,
    seasons: item.seasons || null,
    episodes_watched: item.episodesWatched || 0,
    total_episodes: item.totalEpisodes || 0,
    notes: item.notes || ""
  };

  const res = await supabaseFetch("/rest/v1/media_items", {
    method: "POST",
    headers: {
      "Prefer": "return=representation,resolution=merge-duplicates"
    },
    body: JSON.stringify(mediaRow)
  });

  return { item: res ? res[0] : mediaRow };
}

export async function deleteMediaItem(itemId) {
  const user = getStoredUser();
  if (!user) throw new Error("Unauthorized");

  await supabaseFetch(`/rest/v1/media_items?id=eq.${encodeURIComponent(itemId)}&user_id=eq.${user.id}`, {
    method: "DELETE"
  });

  return { message: "Item deleted successfully." };
}

export async function syncLocalMedia(items) {
  const user = getStoredUser();
  if (!user || !Array.isArray(items) || items.length === 0) return { data: [] };

  const rows = items.map(item => ({
    id: item.id || ("m_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7)),
    user_id: user.id,
    title: item.title,
    poster: item.poster,
    type: item.type,
    status: item.status,
    rating: item.rating || 0,
    review: item.review || "",
    watched_on: item.watchedOn || item.watched_on || null,
    seasons: item.seasons || null,
    episodes_watched: item.episodesWatched || 0,
    total_episodes: item.totalEpisodes || 0,
    notes: item.notes || ""
  }));

  const res = await supabaseFetch("/rest/v1/media_items", {
    method: "POST",
    headers: {
      "Prefer": "return=representation,resolution=merge-duplicates"
    },
    body: JSON.stringify(rows)
  });

  return { data: res || rows };
}

// -----------------------------------------------------------
// Supabase Community & Multi-User APIs
// -----------------------------------------------------------

export async function fetchAllUsers() {
  try {
    const profs = await supabaseFetch("/rest/v1/profiles?select=*", { method: "GET" });
    const allMedia = await supabaseFetch("/rest/v1/media_items?select=id,user_id,status", { method: "GET" }).catch(() => []);

    const usersWithStats = (profs || []).map(p => {
      const userMedia = (allMedia || []).filter(m => m.user_id === p.id);
      return {
        id: p.id,
        username: p.username,
        name: p.name,
        avatar: p.avatar,
        avatarBg: p.avatar_bg,
        bio: p.bio,
        stats: {
          total: userMedia.length,
          watched: userMedia.filter(m => m.status !== "watch-later").length,
          watchLater: userMedia.filter(m => m.status === "watch-later").length
        }
      };
    });

    return { users: usersWithStats };
  } catch (e) {
    console.error("Error fetching community users from Supabase:", e);
    return { users: [] };
  }
}

export async function fetchUserProfile(usernameOrId) {
  let targetUser = null;
  const profs = await supabaseFetch(
    `/rest/v1/profiles?or=(username.eq.${encodeURIComponent(usernameOrId)},id.eq.${encodeURIComponent(usernameOrId)})`,
    { method: "GET" }
  );

  if (profs && profs.length > 0) {
    targetUser = profs[0];
  }

  if (!targetUser) {
    throw new Error("User profile not found in Supabase.");
  }

  const mediaData = await supabaseFetch(`/rest/v1/media_items?user_id=eq.${targetUser.id}`, { method: "GET" }).catch(() => []);

  const userObj = {
    id: targetUser.id,
    username: targetUser.username,
    name: targetUser.name,
    avatar: targetUser.avatar || "🍿",
    avatarBg: targetUser.avatar_bg || "from-red-500 to-amber-500 text-white",
    bio: targetUser.bio || ""
  };

  return { user: userObj, data: mediaData || [] };
}
