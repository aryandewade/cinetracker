import { useState, useEffect } from "react";

const AddModal = ({ item, onClose, onSave, isEdit = false }) => {
  const [date, setDate] = useState("");

  useEffect(() => {
    if (item?.watchedOn) {
      setDate(item.watchedOn);
    }
  }, [item]);

  const handleSave = () => {
    if (!date) return;

    onSave({
      ...item,
      watchedOn: date,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 p-6 rounded-xl w-80">
        <h2 className="text-lg mb-4">
          {isEdit ? "Edit watch date" : "Add to watched"}
        </h2>

        <input
          type="date"
          className="w-full bg-slate-800 p-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="text-slate-400">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 px-4 py-2 rounded text-black"
          >
            {isEdit ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddModal;
