import { useEffect, useState } from "react";
import SearchBar from "../components/SearchBar";
import AddModal from "../components/AddModal";
import YearGroup from "../components/YearGroup";
import { groupByYearAndMonth } from "../utils/groupByDate";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editItem, setEditItem] = useState(null);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("cineTrack")) || [];
    setData(saved);
  }, []);

  const persist = (updated) => {
    setData(updated);
    localStorage.setItem("cineTrack", JSON.stringify(updated));
  };

  // ADD new
  const addItem = (item) => {
    persist([...data, item]);
    setSelected(null);
  };

  // DELETE
  const deleteItem = (item) => {
    const updated = data.filter(
      (i) => !(i.id === item.id && i.watchedOn === item.watchedOn)
    );
    persist(updated);
  };

  // EDIT
  const updateItem = (updatedItem) => {
    const updated = data.map((item) =>
      item.id === updatedItem.id && item.watchedOn !== updatedItem.watchedOn
        ? updatedItem
        : item
    );
    persist(updated);
    setEditItem(null);
  };

  const grouped = groupByYearAndMonth(data);

  return (
    <div className="px-6 pt-32 max-w-7xl mx-auto">
      <SearchBar onSelect={setSelected} />

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
          isEdit
          onClose={() => setEditItem(null)}
          onSave={updateItem}
        />
      )}

      <div className="mt-16">
        {Object.keys(grouped)
          .sort((a, b) => b - a)
          .map((year) => (
            <YearGroup
              key={year}
              year={year}
              months={grouped[year]}
              onDelete={deleteItem}
              onEdit={setEditItem}
            />
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
