import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import AddModal from "../components/AddModal";
import YearGroup from "../components/YearGroup";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import StatsPanel from "../components/StatsPanel";
import DetailsModal from "../components/DetailsModal";
import ShareCardModal from "../components/ShareCardModal";
import { groupByYearAndMonth } from "../utils/groupByDate";

const Dashboard = ({
  activeProfile,
  profiles = [],
  onUpdateData,
  onSelectProfile,
  onLogout,
  sharedProfile = null,
  onExitSharedView,
  onOpenAuth,
  onOpenCommunity,
  authUser,
}) => {
  const [selected, setSelected] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState("history"); // 'history' or 'watch-later'
  const [detailsItem, setDetailsItem] = useState(null);
  const [shareCardItem, setShareCardItem] = useState(null);

  const isSharedView = !!sharedProfile;
  const currentProfile = isSharedView ? sharedProfile : activeProfile;
  const dataset = currentProfile?.data || [];

  // Update local dataset and trigger state sync up
  const persist = (updated) => {
    if (isSharedView) return; // shared view is read-only
    onUpdateData(updated);
  };

  const addItem = (item) => {
    let updated;
    const exists = dataset.some(i => i.id === item.id);
    if (editItem || exists) {
      updated = dataset.map(i => i.id === item.id ? item : i);
      if (!updated.some(i => i.id === item.id)) updated.push(item);
    } else {
      updated = [...dataset, item];
    }

    persist(updated);
    setSelected(null);
    setEditItem(null);
    setDetailsItem(null); // close details modal if it was open
  };

  const deleteItem = (item) => {
    const updated = dataset.filter((i) => i.id !== item.id);
    persist(updated);
    setConfirmItem(null);
    setDetailsItem(null); // close details modal if it was open
  };

  // Filter data based on tab (Watch Later or Watched History)
  const filteredData = dataset.filter(item => {
    if (isSharedView) return item.status !== 'watch-later'; // shared users only show reviewed items
    if (activeTab === 'watch-later') return item.status === 'watch-later';
    return item.status !== 'watch-later';
  });

  const grouped = groupByYearAndMonth(filteredData);

  // Sorting: in regular mode, items are grouped by Date Watched.
  // In Watch Later mode, we display a standard grid. Let's make sure it's fully integrated.

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar
        showStats={showStats}
        setShowStats={setShowStats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeProfile={activeProfile}
        profiles={profiles}
        onSelectProfile={onSelectProfile}
        onLogout={onLogout}
        isSharedView={isSharedView}
        onExitSharedView={onExitSharedView}
        onOpenAuth={onOpenAuth}
        onOpenCommunity={onOpenCommunity}
        authUser={authUser}
      />

      <div className="px-6 pt-28 max-w-7xl mx-auto pb-20">
        
        {/* Shared View Profile Hero Header */}
        {isSharedView && (
          <div className="mb-12 mt-6 p-6 rounded-3xl bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40 backdrop-blur-md flex flex-col md:flex-row items-center gap-6 animate-fade-in">
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${sharedProfile.avatarBg || "from-slate-700 to-slate-900"} flex items-center justify-center text-5xl shadow-xl shrink-0`}>
              {sharedProfile.avatar}
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="text-[10px] bg-purple-600/10 text-purple-600 dark:bg-purple-600/20 dark:text-purple-400 font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">CineTrack Shared Showcase</span>
              <h1 className="text-3xl font-extrabold text-text-primary tracking-tight mt-2.5">
                {sharedProfile.name}'s Cinematic Portfolio
              </h1>
              {sharedProfile.bio && (
                <p className="text-text-secondary text-sm mt-1.5 italic max-w-2xl">
                  "{sharedProfile.bio}"
                </p>
              )}
            </div>
            <div className="bg-slate-200/50 dark:bg-slate-950/60 px-6 py-4 rounded-2xl border border-border dark:border-slate-900 text-center shrink-0 min-w-[120px]">
              <p className="text-2xl font-extrabold text-text-primary">{dataset.filter(i => i.status !== 'watch-later').length}</p>
              <p className="text-[10px] text-text-secondary uppercase font-bold tracking-wider mt-0.5">Watched Items</p>
            </div>
          </div>
        )}

        {/* Regular Stats Section */}
        {((showStats && activeTab === 'history') || isSharedView) && (
          <div className="mb-12 animate-fade-in">
            {!isSharedView && (
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🔥</span>
                <h2 className="text-3xl font-bold text-text-primary tracking-tight">Your Stats</h2>
              </div>
            )}
            <StatsPanel data={dataset.filter(i => i.status !== 'watch-later')} />
          </div>
        )}

        {/* Search Bar - only shown in regular interactive mode */}
        {!isSharedView && (
          <div className="mb-12">
            <SearchBar onSelect={setSelected} />
          </div>
        )}

        {/* Main List Grid */}
        {filteredData.length === 0 ? (
          <EmptyState
            message={
              isSharedView
                ? `${sharedProfile.name} hasn't rated any movies or series yet.`
                : activeTab === 'watch-later'
                ? "No movies in Watch Later yet."
                : "No movies watched yet."
            }
          />
        ) : (
          <div className="mt-8 animate-fade-in">
            {activeTab === 'watch-later' && !isSharedView ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {filteredData.map(item => (
                  <div key={item.id} className="relative">
                    <MediaCardWrapper
                      item={item}
                      onDelete={setConfirmItem}
                      onEdit={setEditItem}
                      onViewDetails={setDetailsItem}
                    />
                  </div>
                ))}
              </div>
            ) : (
              Object.keys(grouped)
                .sort((a, b) => b - a)
                .map((year) => (
                  <YearGroup
                    key={year}
                    year={year}
                    months={grouped[year]}
                    onDelete={isSharedView ? null : (item) => setConfirmItem(item)}
                    onEdit={isSharedView ? null : (item) => setEditItem(item)}
                    onViewDetails={setDetailsItem}
                  />
                ))
            )}
          </div>
        )}

        {/* Add Movie Modal */}
        {selected && (
          <AddModal
            item={{
              id: selected.imdbID || selected.id,
              title: selected.Title || selected.title,
              poster: selected.Poster || selected.poster,
              type: selected.Type || selected.type,
              year: selected.Year || selected.year,
              Year: selected.Year || selected.year,
            }}
            onClose={() => setSelected(null)}
            onSave={addItem}
          />
        )}

        {/* Edit Review Modal */}
        {editItem && (
          <AddModal
            item={editItem}
            isEdit={true}
            onClose={() => setEditItem(null)}
            onSave={addItem}
          />
        )}

        {/* Details Showcase Modal */}
        {detailsItem && (
          <DetailsModal
            item={detailsItem}
            onClose={() => setDetailsItem(null)}
            onEdit={(item) => {
              setEditItem(item);
              setDetailsItem(null);
            }}
            onDelete={(item) => {
              setConfirmItem(item);
              setDetailsItem(null);
            }}
            isSharedView={isSharedView}
            sharedProfile={sharedProfile}
            activeProfile={activeProfile}
            onShareCard={setShareCardItem}
          />
        )}

        {/* Share Review Card Canvas Generator */}
        {shareCardItem && (
          <ShareCardModal
            item={shareCardItem}
            onClose={() => setShareCardItem(null)}
            activeProfile={activeProfile}
          />
        )}

        {/* Confirm Delete Entry Modal */}
        {confirmItem && (
          <ConfirmModal
            title="Delete this entry?"
            onConfirm={() => deleteItem(confirmItem)}
            onCancel={() => setConfirmItem(null)}
          />
        )}
      </div>
    </div>
  );
};

// Custom Wrapper for MediaCard
import MediaCard from "../components/MediaCard";
const MediaCardWrapper = ({ item, onDelete, onEdit, onViewDetails }) => (
  <MediaCard
    item={item}
    onDelete={onDelete}
    onEdit={onEdit}
    onViewDetails={onViewDetails}
  />
);

export default Dashboard;
