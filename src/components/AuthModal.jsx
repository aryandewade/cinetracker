import { useState } from "react";
import { FaTimes, FaUser, FaLock, FaEnvelope, FaFilm, FaExclamationCircle } from "react-icons/fa";
import { loginUser, registerUser } from "../api/auth";
import useModalA11y, { backdropClick } from "../hooks/useModalA11y";
import { PRESET_AVATARS } from "../utils/constants";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form Fields
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);

  const containerRef = useModalA11y({ isOpen, onClose });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "login") {
        if (!emailOrUsername || !password) {
          setError("Please enter your email/username and password.");
          setLoading(false);
          return;
        }
        const res = await loginUser(emailOrUsername, password);
        onSuccess(res.user);
        onClose();
      } else {
        if (!username || !email || !password) {
          setError("Username, email, and password are required.");
          setLoading(false);
          return;
        }
        const res = await registerUser({
          username: username.trim(),
          email: email.trim(),
          password,
          name: name.trim() || username.trim(),
          bio: bio.trim(),
          avatar: selectedAvatar.emoji,
          avatarBg: selectedAvatar.bg,
        });
        onSuccess(res.user);
        onClose();
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Sign in to Cinetracker" : "Create a Cinetracker account"}
      onClick={backdropClick(onClose)}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in outline-none"
    >
      <div className="bg-surface dark:bg-slate-900 border border-border dark:border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative outline-none">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-border dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center text-xl">
              <FaFilm />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary tracking-tight">
                {mode === "login" ? "Welcome Back to Cinetrack" : "Join Cinetrack"}
              </h2>
              <p className="text-xs text-text-secondary">
                {mode === "login"
                  ? "Log in to sync your database watchlist"
                  : "Create an account to save & share movies"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-border dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
              mode === "login"
                ? "border-red-500 text-text-primary bg-slate-100 dark:bg-slate-800/50"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("register");
              setError("");
            }}
            className={`flex-1 py-3 text-sm font-semibold text-center border-b-2 transition-all ${
              mode === "register"
                ? "border-red-500 text-text-primary bg-slate-100 dark:bg-slate-800/50"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-xs text-red-400">
              <FaExclamationCircle className="shrink-0 text-base" />
              <span>{error}</span>
            </div>
          )}

          {mode === "login" ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Email or Username
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-3.5 text-text-secondary/60 text-sm" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. moviebuff or name@example.com"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="w-full bg-surface dark:bg-slate-950 border border-border dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-3.5 text-text-secondary/60 text-sm" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface dark:bg-slate-950 border border-border dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Username
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3.5 top-3.5 text-text-secondary/60 text-sm" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. cinemafan"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-surface dark:bg-slate-950 border border-border dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3.5 top-3.5 text-text-secondary/60 text-sm" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface dark:bg-slate-950 border border-border dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-3.5 top-3.5 text-text-secondary/60 text-sm" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-surface dark:bg-slate-950 border border-border dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Display Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-surface dark:bg-slate-950 border border-border dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Choose Avatar Emoji
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedAvatar(av)}
                      className={`h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                        selectedAvatar.emoji === av.emoji
                          ? "ring-2 ring-red-500 scale-105 bg-slate-200 dark:bg-slate-800"
                          : "bg-surface dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                      }`}
                    >
                      {av.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Tell others what movies you enjoy..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-surface dark:bg-slate-950 border border-border dark:border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-red-500 transition-colors resize-none"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-text-primary text-background font-bold rounded-xl shadow-xl transition-all duration-300 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Processing...
              </span>
            ) : mode === "login" ? (
              "Sign In to Database"
            ) : (
              "Create Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
