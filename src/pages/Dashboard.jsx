import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import AddModal from "../components/AddModal";
import YearGroup from "../components/YearGroup";
import ConfirmModal from "../components/ConfirmModal";
import EmptyState from "../components/EmptyState";
import StatsPanel from "../components/StatsPanel";
import { groupByYearAndMonth } from "../utils/groupByDate";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [confirmItem, setConfirmItem] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [activeTab, setActiveTab] = useState("history"); // 'history' or 'watch-later'

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cineTrack")) || [];
    setData(saved);
  }, []);

  const persist = (updated) => {
    setData(updated);
    localStorage.setItem("cineTrack", JSON.stringify(updated));
  };

  const addItem = (item) => {
    // If editing, remove old instance first (simple way to handle updates)
    const filtered = data.filter(i => i.id !== item.id); // This might be too aggressive if we allow duplicates. 
    // Better: if it's an edit of an existing item in the list, replace it. 
    // The previous logic was: check exists. 

    // Let's stick to the previous pattern but be smarter about updates vs new adds.
    // If 'editItem' was set, we are updating.
    let updated;
    if (editItem || data.some(i => i.id === item.id)) {
      updated = data.map(i => i.id === item.id ? item : i);
      // If it wasn't there (shouldn't happen in edit), append.
      if (!updated.some(i => i.id === item.id)) updated.push(item);
    } else {
      updated = [...data, item];
    }

    persist(updated);
    setSelected(null);
    setEditItem(null);
  };

  const deleteItem = (item) => {
    const updated = data.filter((i) => i.id !== item.id);
    persist(updated);
    setConfirmItem(null);
  };

  // Filter data based on tab
  const filteredData = data.filter(item => {
    if (activeTab === 'watch-later') return item.status === 'watch-later';
    return item.status !== 'watch-later'; // Default to history (legacy items have undefined status)
  });

  const grouped = groupByYearAndMonth(filteredData);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Navbar
        showStats={showStats}
        setShowStats={setShowStats}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />


      <div className="px-6 pt-32 max-w-7xl mx-auto pb-20">

        {/* Moctale Style Header for Stats/Top Section */}
        {showStats && activeTab === 'history' && (
          <div className="mb-12 animate-fade-in">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">🔥</span>
              <h2 className="text-3xl font-bold text-text-primary tracking-tight">Your Stats</h2>
            </div>
            <StatsPanel data={data.filter(i => i.status !== 'watch-later')} />
          </div>
        )}

        <div className="mb-12">
          <SearchBar onSelect={setSelected} />
        </div>

        {filteredData.length === 0 ? (
          <EmptyState message={activeTab === 'watch-later' ? "No movies in Watch Later yet." : "No movies watched yet."} />
        ) : (
          <div className="mt-8 animate-fade-in">
            {activeTab === 'watch-later' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {filteredData.map(item => (
                  <div key={item.id} className="relative"> {/* Manually wrap MediaCard since YearGroup behaves differently */}
                    <MediaCardWrapper
                      item={item}
                      onDelete={setConfirmItem}
                      onEdit={setEditItem}
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
                    onDelete={(item) => setConfirmItem(item)}
                    onEdit={(item) => setEditItem(item)}
                  />
                ))
            )}
          </div>
        )}

        {selected && (
          <AddModal
            item={{
              id: selected.imdbID,
              title: selected.Title,
              poster: selected.Poster,
              type: selected.Type,
            }}
            onClose={() => setSelected(null)}
            onSave={addItem}
          />
        )}

        {editItem && (
          <AddModal
            item={editItem}
            isEdit={true}
            onClose={() => setEditItem(null)}
            onSave={addItem}
          />
        )}

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

// Helper component to avoid circular dependency or code duplication if MediaCard is imported directly
import MediaCard from "../components/MediaCard";
const MediaCardWrapper = ({ item, onDelete, onEdit }) => (
  <MediaCard item={item} onDelete={onDelete} onEdit={onEdit} />
);

export default Dashboard;
