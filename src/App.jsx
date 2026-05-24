import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import ProfileSelector from "./components/ProfileSelector";

export default function App() {
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [sharedProfile, setSharedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    // 2. Initialize profiles and check legacy migration
    let savedProfiles = JSON.parse(localStorage.getItem("cineTrack_profiles"));
    const legacyData = JSON.parse(localStorage.getItem("cineTrack"));

    if (!savedProfiles) {
      if (legacyData && legacyData.length > 0) {
        // Migrate legacy data
        const guestProfile = {
          id: "profile-guest",
          name: "Guest User",
          avatar: "🍿",
          bio: "My collection of movie reviews and watchlist.",
          data: legacyData,
        };
        savedProfiles = [guestProfile];
        localStorage.setItem("cineTrack_profiles", JSON.stringify(savedProfiles));
        localStorage.setItem("cineTrack_active_profile_id", guestProfile.id);
      } else {
        savedProfiles = [];
      }
    }

    setProfiles(savedProfiles);

    // 3. Load active profile
    const activeId = localStorage.getItem("cineTrack_active_profile_id");
    if (activeId && savedProfiles.length > 0) {
      const active = savedProfiles.find((p) => p.id === activeId);
      if (active) {
        setActiveProfile(active);
      }
    }

    setIsLoading(false);
  }, []);

  const handleSelectProfile = (profile) => {
    setActiveProfile(profile);
    localStorage.setItem("cineTrack_active_profile_id", profile.id);
  };

  const handleUpdateProfile = (updatedProfile) => {
    const updatedProfiles = profiles.map((p) =>
      p.id === updatedProfile.id ? { ...p, ...updatedProfile } : p
    );
    setProfiles(updatedProfiles);
    localStorage.setItem("cineTrack_profiles", JSON.stringify(updatedProfiles));
    if (activeProfile && activeProfile.id === updatedProfile.id) {
      setActiveProfile({ ...activeProfile, ...updatedProfile });
    }
  };

  const handleUpdateProfileData = (updatedData) => {
    if (!activeProfile) return;
    const updatedProfile = { ...activeProfile, data: updatedData };
    setActiveProfile(updatedProfile);

    const updatedProfiles = profiles.map((p) =>
      p.id === activeProfile.id ? updatedProfile : p
    );
    setProfiles(updatedProfiles);
    localStorage.setItem("cineTrack_profiles", JSON.stringify(updatedProfiles));
  };

  const handleCreateProfile = (newProfile) => {
    const profile = {
      ...newProfile,
      id: "profile-" + Date.now(),
      data: [],
    };
    const updatedProfiles = [...profiles, profile];
    setProfiles(updatedProfiles);
    localStorage.setItem("cineTrack_profiles", JSON.stringify(updatedProfiles));
    handleSelectProfile(profile);
  };

  const handleDeleteProfile = (id) => {
    const updatedProfiles = profiles.filter((p) => p.id !== id);
    setProfiles(updatedProfiles);
    localStorage.setItem("cineTrack_profiles", JSON.stringify(updatedProfiles));

    if (activeProfile && activeProfile.id === id) {
      setActiveProfile(null);
      localStorage.removeItem("cineTrack_active_profile_id");
    }
  };

  const handleLogout = () => {
    setActiveProfile(null);
    localStorage.removeItem("cineTrack_active_profile_id");
  };

  const handleExitSharedView = () => {
    const url = new URL(window.location);
    url.searchParams.delete("share");
    window.history.pushState({}, "", url);
    setSharedProfile(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  // 1. Shared Viewer View
  if (sharedProfile) {
    return (
      <Dashboard
        sharedProfile={sharedProfile}
        onExitSharedView={handleExitSharedView}
      />
    );
  }

  // 2. Profile Selector View (no active profile)
  if (!activeProfile) {
    return (
      <ProfileSelector
        profiles={profiles}
        onSelect={handleSelectProfile}
        onCreate={handleCreateProfile}
        onUpdate={handleUpdateProfile}
        onDelete={handleDeleteProfile}
      />
    );
  }

  // 3. Main Dashboard View
  return (
    <Dashboard
      activeProfile={activeProfile}
      profiles={profiles}
      onUpdateData={handleUpdateProfileData}
      onSelectProfile={handleSelectProfile}
      onCreateProfile={handleCreateProfile}
      onDeleteProfile={handleDeleteProfile}
      onLogout={handleLogout}
    />
  );
}
