import { FaTimes } from "react-icons/fa";
import useModalA11y, { backdropClick } from "../hooks/useModalA11y";

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  const containerRef = useModalA11y({ isOpen: true, onClose: onCancel });

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={backdropClick(onCancel)}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in outline-none"
    >
      <div className="bg-surface dark:bg-slate-900 border border-border dark:border-slate-800 p-6 rounded-2xl w-80 shadow-2xl relative">
        <button
          aria-label="Close dialog"
          onClick={onCancel}
          className="absolute top-3 right-3 text-text-secondary hover:text-text-primary p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <FaTimes size={14} />
        </button>

        <h2 className="text-lg font-bold mb-2 text-text-primary pr-6">{title}</h2>
        {message && (
          <p className="text-sm text-text-secondary mb-5 leading-relaxed">{message}</p>
        )}

        <div className="flex justify-end gap-3 pt-2 border-t border-border dark:border-slate-800">
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
