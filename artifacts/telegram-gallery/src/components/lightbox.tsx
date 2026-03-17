import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import type { MediaItem } from "@workspace/api-client-react/src/generated/api.schemas";
import { useEffect } from "react";

interface LightboxProps {
  item: MediaItem | null;
  onClose: () => void;
}

export function Lightbox({ item, onClose }: LightboxProps) {
  // Prevent scrolling when lightbox is open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [item]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const dateObj = new Date(item.date);
  const formattedDate = isNaN(dateObj.getTime()) ? "Unknown Date" : format(dateObj, "PPP 'at' p");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-4 sm:p-8"
        onClick={onClose}
      >
        {/* Top Header/Toolbar */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none"
        >
          <div className="flex flex-col">
            <h3 className="font-display text-xl font-medium text-white drop-shadow-md">
              {item.file_name || "Media"}
            </h3>
            <div className="flex items-center text-white/60 text-sm mt-1">
              <Calendar className="w-3 h-3 mr-1.5" />
              {formattedDate}
            </div>
          </div>
          
          <div className="flex items-center gap-4 pointer-events-auto">
            <a 
              href={item.url} 
              download={item.file_name}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95"
              title="Download"
            >
              <Download className="w-5 h-5" />
            </a>
            <button 
              onClick={onClose}
              className="p-3 rounded-full bg-white/10 hover:bg-destructive/80 text-white transition-all hover:scale-105 active:scale-95"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Content Container */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, filter: "blur(10px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative max-w-full max-h-full flex items-center justify-center mt-12"
          onClick={(e) => e.stopPropagation()}
        >
          {item.type === "image" && (
            <img 
              src={item.url} 
              alt={item.file_name} 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
          )}
          
          {item.type === "video" && (
            <video 
              src={item.url} 
              controls 
              autoPlay
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
            />
          )}

          {item.type === "document" && (
            <div className="bg-card border border-border p-12 rounded-2xl flex flex-col items-center max-w-md w-full shadow-2xl">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <FileText className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-display font-semibold text-center break-words max-w-full">
                {item.file_name}
              </h2>
              <p className="text-muted-foreground mt-2 mb-8 text-center">
                This document cannot be previewed. Please download it to view the contents.
              </p>
              <a 
                href={item.url} 
                download={item.file_name}
                className="px-8 py-4 bg-primary text-primary-foreground rounded-xl font-medium flex items-center gap-2 hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                <Download className="w-5 h-5" />
                Download Document
              </a>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
