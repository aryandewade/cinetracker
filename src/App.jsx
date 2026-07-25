import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import ProfileSelector from "./components/ProfileSelector";
import AuthModal from "./components/AuthModal";
import CommunityModal from "./components/CommunityModal";
import { getCurrentUser, logoutUser, updateProfile } from "./api/auth";
import { fetchUserMedia, saveMediaItem, deleteMediaItem, syncLocalMedia } from "./api/media";
import { getToken, setToken } from "./api/client";

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
      // 1. Check for URL share parameter
      const params = new URLSearchParams(window.location.search);
      const shareData = params.get("share");
      if (shareData) {
        try {
          const decoded = JSON.parse(decodeURIComponent(atob(shareData)));
          setSharedProfile(decoded);
          setIsLoading(false);
          return;
        } catch (e) {
          console.error("Failed to decode share parameter:", e);
        }
      }

      // 3. Check for active Supabase token
      const token = getToken();
      if (token) {
        try {
          const res = await getCurrentUser();
          if (res && res.user) {
            setAuthUser(res.user);
            const userMedia = res.data || [];
            
            // Check for legacy local data to sync
            const localProfiles = JSON.parse(localStorage.getItem("cineTrack_profiles")) || [];
            const legacyData = JSON.parse(localStorage.getItem("cineTrack")) || [];
            let itemsToSync = [];

            if (localProfiles.length > 0) {
              localProfiles.forEach(p => {
                if (Array.isArray(p.data)) itemsToSync.push(...p.data);
              });
            } else if (legacyData.length > 0) {
              itemsToSync = legacyData;
            }

            let finalMedia = userMedia;
            if (itemsToSync.length > 0) {
              try {
                const syncRes = await syncLocalMedia(itemsToSync);
                if (syncRes && syncRes.data) {
                  finalMedia = syncRes.data;
                  localStorage.removeItem("cineTrack_profiles");
                  localStorage.removeItem("cineTrack");
                }
              } catch (syncErr) {
                console.error("Failed auto-syncing local media:", syncErr);
              }
            }

            const profileObj = {
              id: res.user.id,
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

      // 3. Fallback to Guest/Local storage mode
      loadGuestProfiles();
    } catch (err) {
      console.error("Critical init error:", err);
      loadGuestProfiles();
    } finally {
      setIsLoading(false);
    }
  };

  const loadGuestProfiles = () => {
    let savedProfiles = JSON.parse(localStorage.getItem("cineTrack_profiles"));
    const legacyData = JSON.parse(localStorage.getItem("cineTrack"));

    if (!savedProfiles || savedProfiles.length === 0) {
      if (legacyData && legacyData.length > 0) {
        const guestProfile = {
          id: "profile-guest",
          name: "Guest User",
          avatar: "🍿",
          bio: "Local watchlist & reviews collection.",
          data: legacyData,
        };
        savedProfiles = [guestProfile];
        localStorage.setItem("cineTrack_profiles", JSON.stringify(savedProfiles));
      } else {
        const guestProfile = {
          id: "profile-guest",
          name: "Guest User",
          avatar: "🍿",
          bio: "Local watchlist & reviews collection.",
          data: [],
        };
        savedProfiles = [guestProfile];
        localStorage.setItem("cineTrack_profiles", JSON.stringify(savedProfiles));
      }
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
      const userMedia = (res && res.data) ? res.data : [];

      if (activeProfile && activeProfile.data && activeProfile.data.length > 0) {
        try {
          const syncRes = await syncLocalMedia(activeProfile.data);
          if (syncRes && syncRes.data) {
            userMedia.push(...syncRes.data);
          }
        } catch (e) {
          console.error("Error syncing media after auth:", e);
        }
      }

      const profileObj = {
        id: user.id,
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
    window.history.pushState({}, "", url);
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
