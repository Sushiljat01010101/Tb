import { useState } from "react";
import { motion } from "framer-motion";
import { Play, FileText, Image as ImageIcon, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { MediaItem } from "@workspace/api-client-react/src/generated/api.schemas";
import { cn } from "@/lib/utils";

interface MediaCardProps {
  item: MediaItem;
  onClick: (item: MediaItem) => void;
  index: number;
}

export function MediaCard({ item, onClick, index }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const dateObj = new Date(item.date);
  const timeAgo = !isNaN(dateObj.getTime()) ? formatDistanceToNow(dateObj, { addSuffix: true }) : "";

  const isDocument = item.type === "document";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        ease: "easeOut",
        delay: Math.min(index * 0.05, 0.5) // Cap stagger delay
      }}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card border border-border/50 shadow-sm cursor-pointer transition-all duration-300",
        "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30",
        isDocument ? "aspect-[4/3] flex flex-col" : "aspect-square"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => isDocument ? undefined : onClick(item)}
    >
      {/* Visual Content */}
      {!isDocument ? (
        <div className="absolute inset-0 w-full h-full bg-secondary/50">
          {item.type === "image" && (
            <img 
              src={item.url} 
              alt={item.file_name} 
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            />
          )}
          
          {item.type === "video" && (
            <>
              <video 
                src={item.url} 
                preload="metadata"
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-primary/80 transition-colors duration-300">
                  <Play className="w-6 h-6 text-white ml-1" fill="currentColor" />
                </div>
              </div>
            </>
          )}

          {/* Overlay Gradient for Image/Video */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-90" />
          
          {/* Metadata overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 flex flex-col justify-end">
            <p className="text-white font-medium text-sm truncate font-display mb-1 drop-shadow-md">
              {item.file_name}
            </p>
            <p className="text-white/70 text-xs font-medium">
              {timeAgo}
            </p>
          </div>
          
          {/* Type Badge */}
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5">
            {item.type === "image" ? <ImageIcon className="w-3.5 h-3.5 text-white" /> : <Play className="w-3.5 h-3.5 text-white" />}
            <span className="text-[10px] font-semibold text-white uppercase tracking-wider">
              {item.type}
            </span>
          </div>
        </div>
      ) : (
        /* Document Card */
        <div className="flex flex-col h-full p-6 relative">
          <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-white/5 border border-white/10 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">
              Document
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center mt-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <div className="mt-auto">
            <h3 className="font-display font-medium text-foreground line-clamp-2 leading-tight mb-1">
              {item.file_name}
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              {timeAgo}
            </p>
            
            <a 
              href={item.url}
              download={item.file_name}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2.5 px-4 bg-secondary hover:bg-primary hover:text-primary-foreground text-secondary-foreground rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </a>
          </div>
        </div>
      )}
    </motion.div>
  );
}
