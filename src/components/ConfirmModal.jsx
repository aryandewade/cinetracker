const ConfirmModal = ({ title, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-surface dark:bg-slate-900 border border-border p-6 rounded-2xl w-80 shadow-2xl">
        <h2 className="text-lg font-bold mb-6 text-text-primary">{title}</h2>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onCancel}
            className="text-text-secondary hover:text-text-primary text-sm px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-full text-white text-sm font-semibold transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
