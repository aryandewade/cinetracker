import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import AuthModal from "./components/AuthModal";
import CommunityModal from "./components/CommunityModal";
import { getCurrentUser, logoutUser } from "./api/auth";
import { saveMediaItem, deleteMediaItem, syncLocalMedia, fetchUserProfile } from "./api/media";
import { getToken } from "./api/client";

export default function App() {
  const [authUser, setAuthUser] = useState(null);
  const [activeProfile, setActiveProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [sharedProfile, setSharedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const params = new URLSearchParams(window.location.search);

      // 1. Check for Direct Username share URL (?u=username or ?user=username)
      const usernameParam = params.get("u") || params.get("user");
      if (usernameParam) {
        try {
          const res = await fetchUserProfile(usernameParam);
          if (res && res.user) {
            setSharedProfile({
              ...res.user,
              data: res.data || []
            });
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to load user profile from URL parameter:", e);
        }
      }

      // 2. Check for self-contained Base64 share parameter (?share=...)
      const shareData = params.get("share");
      if (shareData) {
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(shareData)));
          if (decoded && (decoded.name || decoded.username)) {
            setSharedProfile(decoded);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.error("Failed to decode share parameter:", e);
        }
      }

      // 3. Check for active authenticated user session
      const token = getToken();
      if (token) {
        try {
          const res = await getCurrentUser();
          if (res && res.user) {
            setAuthUser(res.user);
            const remoteMedia = res.data || [];
            
            // Check for cached user data in local storage
            const cachedMedia = JSON.parse(localStorage.getItem(`cineTrack_cache_${res.user.id}`) || "null");

            // Check for legacy or guest local data to sync
            const localProfiles = JSON.parse(localStorage.getItem("cineTrack_profiles") || "[]");
            const legacyData = JSON.parse(localStorage.getItem("cineTrack") || "[]");
            let itemsToSync = [];

            if (localProfiles.length > 0) {
              localProfiles.forEach(p => {
                if (Array.isArray(p.data)) itemsToSync.push(...p.data);
              });
            } else if (legacyData.length > 0) {
              itemsToSync = legacyData;
            }

            // Deduplicate itemsToSync against remote items
            itemsToSync = itemsToSync.filter(item => !remoteMedia.some(rm => rm.id === item.id));

            let finalMedia = remoteMedia.length > 0 ? remoteMedia : (cachedMedia || []);

            if (itemsToSync.length > 0) {
              try {
                const syncRes = await syncLocalMedia(itemsToSync);
                if (syncRes && syncRes.data && syncRes.data.length > 0) {
                  // Merge without duplicating
                  const existingIds = new Set(finalMedia.map(m => m.id));
                  const newItems = syncRes.data.filter(m => !existingIds.has(m.id));
                  finalMedia = [...finalMedia, ...newItems];
                  localStorage.removeItem("cineTrack_profiles");
                  localStorage.removeItem("cineTrack");
                }
              } catch (syncErr) {
                console.error("Failed auto-syncing local media:", syncErr);
              }
            }

            // Save refreshed media to local cache
            localStorage.setItem(`cineTrack_cache_${res.user.id}`, JSON.stringify(finalMedia));

            const profileObj = {
              id: res.user.id,
              username: res.user.username,
              name: res.user.name || res.user.username,
              avatar: res.user.avatar || "🍿",
              avatarBg: res.user.avatarBg || "from-red-500 to-amber-500 text-white",
              bio: res.user.bio || "",
              data: finalMedia,
            };

            setActiveProfile(profileObj);
            setProfiles([profileObj]);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Stored token invalid or fetch error, falling back to guest:", e);
          logoutUser();
        }
      }

      // 4. Fallback to Guest/Local storage mode
      loadGuestProfiles();
    } catch (err) {
      console.error("Critical init error:", err);
      loadGuestProfiles();
    } finally {
      setIsLoading(false);
    }
  };

  const loadGuestProfiles = () => {
    let savedProfiles = JSON.parse(localStorage.getItem("cineTrack_profiles") || "null");
    const legacyData = JSON.parse(localStorage.getItem("cineTrack") || "null");

    if (!savedProfiles || savedProfiles.length === 0) {
      const initialData = legacyData && legacyData.length > 0 ? legacyData : [];
      const guestProfile = {
        id: "profile-guest",
        name: "Guest User",
        avatar: "🍿",
        avatarBg: "from-red-500 to-amber-500 text-white",
        bio: "Local watchlist & reviews collection.",
        data: initialData,
      };
      savedProfiles = [guestProfile];
      localStorage.setItem("cineTrack_profiles", JSON.stringify(savedProfiles));
    }

    setProfiles(savedProfiles);
    setActiveProfile(savedProfiles[0]);
  };

  const handleAuthSuccess = async (user) => {
    if (!user || !user.id) {
      setIsLoading(false);
      return;
    }
    setAuthUser(user);
    setIsLoading(true);
    try {
      const res = await getCurrentUser();
      let userMedia = (res && res.data && res.data.length > 0) ? res.data : [];

      // Check local cache if remote was empty
      if (userMedia.length === 0) {
        const cached = JSON.parse(localStorage.getItem(`cineTrack_cache_${user.id}`) || "null");
        if (cached && cached.length > 0) {
          userMedia = cached;
        }
      }

      // If active guest had local items, sync them to the database
      if (activeProfile && activeProfile.data && activeProfile.data.length > 0) {
        const existingIds = new Set(userMedia.map(m => m.id));
        const unmergedItems = activeProfile.data.filter(m => !existingIds.has(m.id));

        if (unmergedItems.length > 0) {
          try {
            const syncRes = await syncLocalMedia(unmergedItems);
            if (syncRes && syncRes.data) {
              const newlySynced = syncRes.data.filter(m => !existingIds.has(m.id));
              userMedia = [...userMedia, ...newlySynced];
            }
          } catch (e) {
            console.error("Error syncing media after auth:", e);
            // Even if sync failed over network, retain in local state
            userMedia = [...userMedia, ...unmergedItems];
          }
        }
      }

      // Persist to user cache
      localStorage.setItem(`cineTrack_cache_${user.id}`, JSON.stringify(userMedia));

      const profileObj = {
        id: user.id,
        username: user.username,
        name: user.name || user.username,
        avatar: user.avatar || "🍿",
        avatarBg: user.avatarBg || "from-red-500 to-amber-500 text-white",
        bio: user.bio || "",
        data: userMedia,
      };

      setActiveProfile(profileObj);
      setProfiles([profileObj]);
      localStorage.removeItem("cineTrack_profiles");
      localStorage.removeItem("cineTrack");
    } catch (e) {
      console.error("Error setting up authenticated profile:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfileData = async (updatedData) => {
    if (!activeProfile) return;

    const updatedProfile = { ...activeProfile, data: updatedData };
    setActiveProfile(updatedProfile);

    if (authUser) {
      // Optimistically update per-user cache
      localStorage.setItem(`cineTrack_cache_${authUser.id}`, JSON.stringify(updatedData));

      const oldData = activeProfile.data || [];
      
      for (const item of updatedData) {
        const oldItem = oldData.find((i) => i.id === item.id);
        if (!oldItem || JSON.stringify(oldItem) !== JSON.stringify(item)) {
          try {
            await saveMediaItem(item);
          } catch (e) {
            console.error("Failed to save media to Supabase:", e);
          }
        }
      }

      for (const item of oldData) {
        if (!updatedData.some((i) => i.id === item.id)) {
          try {
            await deleteMediaItem(item.id);
          } catch (e) {
            console.error("Failed to delete media from Supabase:", e);
          }
        }
      }
    } else {
      const updatedProfiles = profiles.map((p) =>
        p.id === activeProfile.id ? updatedProfile : p
      );
      setProfiles(updatedProfiles);
      localStorage.setItem("cineTrack_profiles", JSON.stringify(updatedProfiles));
    }
  };

  const handleLogout = () => {
    logoutUser();
    setAuthUser(null);
    loadGuestProfiles();
  };

  const handleExitSharedView = () => {
    const url = new URL(window.location);
    url.searchParams.delete("share");
    url.searchParams.delete("u");
    url.searchParams.delete("user");
    window.history.pushState({}, "", url.pathname);
    setSharedProfile(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center text-white flex-col gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        <p className="text-sm font-semibold tracking-wider text-slate-400">Loading Cinetracker...</p>
      </div>
    );
  }

  // 1. Shared Profile Viewer View
  if (sharedProfile) {
    return (
      <Dashboard
        sharedProfile={sharedProfile}
        onExitSharedView={handleExitSharedView}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCommunity={() => setIsCommunityOpen(true)}
        authUser={authUser}
      />
    );
  }

  // 2. Main Dashboard View
  return (
    <>
      <Dashboard
        activeProfile={activeProfile}
        profiles={profiles}
        onUpdateData={handleUpdateProfileData}
        onSelectProfile={setActiveProfile}
        onCreateProfile={() => setIsAuthOpen(true)}
        onDeleteProfile={() => {}}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCommunity={() => setIsCommunityOpen(true)}
        authUser={authUser}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Community Modal */}
      <CommunityModal
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
        onSelectSharedUser={(userProfile) => setSharedProfile(userProfile)}
      />
    </>
  );
}
