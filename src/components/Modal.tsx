/**
 * Modal — portal-based dialog that works as a centred modal on desktop
 * and a bottom-sheet on mobile.
 *
 * Rendered via createPortal into document.body so z-index stacking contexts
 * inside the main layout tree (e.g. sticky header z-50) cannot clip it.
 */

import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: ModalSize;
  /** Optional icon rendered left of the title */
  icon?: ReactNode;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-xl',
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Modal({ open, onClose, title, children, size = 'md', icon }: ModalProps) {
  // useId generates a stable ID for aria-labelledby, linking the dialog role
  // to its visible title for screen readers.
  const titleId = useId();

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Lock body scroll while open so content behind the backdrop doesn't scroll.
  // The cleanup restores overflow even if the component unmounts while open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return createPortal(
    <AnimatePresence>
      {open && (
        // Full-screen container — bottom-sheet on mobile, centred on sm+
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:p-4"
          // Clicks on the outer wrapper (not the panel) close the modal,
          // but only when the target is the wrapper itself — not children.
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* ── Backdrop ─────────────────────────────────────── */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* ── Panel ────────────────────────────────────────── */}
          <motion.div
            key="modal-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, scale: 0.97, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.28, ease: EASE }}
            className={`relative bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 w-full ${SIZE_CLASSES[size]} max-h-[92vh] flex flex-col`}
          >
            {/* Drag handle — mobile affordance, hidden on sm+ */}
            <div className="sm:hidden shrink-0 flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 dark:bg-gray-600 rounded-full" />
            </div>

            {/* ── Modal header ─────────────────────────────── */}
            <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                {icon && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    {icon}
                  </div>
                )}
                <h2 id={titleId} className="text-base font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
              </div>

              <motion.button
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.88 }}
                transition={{ duration: 0.18 }}
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* ── Body — scrollable so tall forms don't overflow the viewport */}
            <div className="overflow-y-auto overscroll-contain px-6 py-5">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
