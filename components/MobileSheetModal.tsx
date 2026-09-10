"use client";

import { motion, PanInfo, useDragControls } from "framer-motion";
import { ReactNode } from "react";

// Shared "chrome" for every bottom-sheet-style modal: fades the backdrop in,
// slides the sheet up from the bottom, and lets the handle bar be dragged
// down to dismiss. `dragListener={false}` + `dragControls` restricts the
// drag gesture to the handle only, so scrolling the sheet's own content
// (which can be long) doesn't fight with the dismiss gesture.
export default function MobileSheetModal({
  onClose,
  children,
  className = "",
}: {
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const dragControls = useDragControls();

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100 || info.velocity.y > 600) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        className={`relative bg-white w-full shadow-lg rounded-t-2xl sm:rounded-lg ${className}`}
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 320 }}
        drag="y"
        dragListener={false}
        dragControls={dragControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.6 }}
        onDragEnd={handleDragEnd}
      >
        <div
          onPointerDown={(e) => dragControls.start(e)}
          className="sm:hidden flex justify-center pt-2 pb-1 shrink-0 cursor-grab touch-none active:cursor-grabbing"
        >
          <span className="h-1 w-10 rounded-full bg-zinc-200" />
        </div>

        {children}
      </motion.div>
    </div>
  );
}
