import { useEffect, useRef } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessibility kit for modal dialogs:
 * - Escape key closes the modal
 * - Background scroll is locked while open
 * - Focus moves into the dialog on open and is trapped (Tab / Shift+Tab)
 * - Focus is restored to the trigger element on close
 *
 * Attach the returned ref to the modal's outermost (backdrop) element and
 * give it tabIndex={-1} plus role="dialog" aria-modal="true".
 */
export default function useModalA11y({ isOpen = true, onClose }) {
  const containerRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const container = containerRef.current;
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    if (container) {
      const firstField = container.querySelector("input, textarea, select");
      (firstField || container).focus({ preventScroll: true });
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        if (onCloseRef.current) onCloseRef.current();
        return;
      }

      if (event.key !== "Tab" || !container) return;

      const focusable = container.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  return containerRef;
}

/**
 * Backdrop click handler: closes only when the click lands on the backdrop
 * itself, not on the dialog content. Usage: onClick={backdropClick(handler)}
 */
export function backdropClick(onClose) {
  return (event) => {
    if (event.target === event.currentTarget && onClose) onClose();
  };
}
