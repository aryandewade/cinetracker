import { useEffect, useState } from "react";
import { FaTimes, FaUsers, FaFilm, FaStar, FaEye, FaSearch, FaUserCircle } from "react-icons/fa";
import { fetchAllUsers, fetchUserProfile } from "../api/media";

export default function CommunityModal({ isOpen, onClose, onSelectSharedUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadUsers();
  }, [isOpen]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await fetchAllUsers();
      setUsers(res.users || []);
    } catch (e) {
      console.error("Failed to load community users:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectUser = async (user) => {
    setLoadingDetail(true);
    try {
      const res = await fetchUserProfile(user.username || user.id);
      if (res.user && res.data) {
        onSelectSharedUser({
          ...res.user,
          data: res.data,
        });
        onClose();
      }
    } catch (e) {
      console.error("Failed to fetch user details:", e);
    } finally {
      setLoadingDetail(false);
    }
  };

  if (!isOpen) return null;

  const filteredUsers = (users || []).filter(
    (u) =>
      u &&
      ((u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.bio && u.bio.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-white">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center text-xl">
              <FaUsers />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent">
                Community & Member Profiles
              </h2>
              <p className="text-xs text-slate-400">
                Explore movie collections and reviews shared by other users
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Search Filter Bar */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <FaSearch className="absolute left-4 top-3.5 text-slate-500 text-sm" />
            <input
              type="text"
              placeholder="Search members by username or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* User Grid Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent mb-4" />
              <p className="text-sm">Loading community members...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FaUserCircle className="mx-auto text-5xl mb-3 text-slate-600" />
              <p className="font-semibold text-slate-300">No users found</p>
              <p className="text-xs mt-1 text-slate-500">Try searching for a different name</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className="bg-slate-950/60 border border-slate-800/80 hover:border-purple-500/50 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between hover:shadow-xl group"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${
                        u.avatarBg || "from-slate-700 to-slate-900 text-white"
                      } flex items-center justify-center text-2xl shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                    >
                      {u.avatar || "🍿"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-base text-white truncate group-hover:text-purple-300 transition-colors">
                        {u.name}
                      </h3>
                      <p className="text-xs text-purple-400 font-mono">@{u.username}</p>
                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                        {u.bio || "Movie fan on Cinetrack."}
                      </p>
                    </div>
                  </div>

                  {/* Stats & View Action */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1">
                        <FaFilm className="text-purple-400" />
                        <strong className="text-white">{u.stats?.watched || 0}</strong> watched
                      </span>
                      <span className="flex items-center gap-1">
                        <FaStar className="text-amber-400" />
                        <strong className="text-white">{u.stats?.total || 0}</strong> total
                      </span>
                    </div>

                    <button
                      onClick={() => handleInspectUser(u)}
                      disabled={loadingDetail}
                      className="px-3.5 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white rounded-xl font-semibold flex items-center gap-1.5 transition-all text-xs"
                    >
                      <FaEye />
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
