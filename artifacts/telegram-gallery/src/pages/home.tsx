import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMedia } from "@workspace/api-client-react";
import type { MediaItem } from "@workspace/api-client-react/src/generated/api.schemas";
import { MediaCard } from "@/components/media-card";
import { Lightbox } from "@/components/lightbox";
import { EmptyState } from "@/components/empty-state";
import { Loader2, Image as ImageIcon, Film, FileText, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterType = "all" | "image" | "video" | "document";

export function Home() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  // Auto-refresh every 10 seconds
  const { data, isLoading, error } = useGetMedia({
    query: {
      refetchInterval: 10000,
      retry: 1,
    }
  });

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    
    let items = data.items;
    
    // Filter
    if (filter !== "all") {
      items = items.filter(item => item.type === filter);
    }
    
    // Sort by date (latest first)
    return items.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
    });
  }, [data?.items, filter]);

  // Determine error state
  const isConfigError = error && (error as any).status === 500 && (error as any).payload?.message?.includes("credentials");
  
  const filters = [
    { id: "all", label: "All Media", icon: LayoutGrid },
    { id: "image", label: "Photos", icon: ImageIcon },
    { id: "video", label: "Videos", icon: Film },
    { id: "document", label: "Documents", icon: FileText },
  ] as const;

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30">
      {/* Background ambient light */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/empty-bg.png`} 
          alt="Ambient Background" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Glass Header */}
        <header className="sticky top-0 z-40 border-b border-border/50 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21.5 3.5L2.5 11.5L9.5 14.5L16.5 7.5L11.5 16.5L18.5 21.5L21.5 3.5Z" fill="white"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-foreground leading-tight">
                  Telegram Gallery
                </h1>
                <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live sync active
                </p>
              </div>
            </div>

            {/* Total Count Badge */}
            {!isLoading && !error && data?.count !== undefined && (
              <div className="hidden sm:flex items-center px-4 py-1.5 rounded-full bg-secondary border border-border">
                <span className="text-sm font-medium text-secondary-foreground">
                  <strong className="text-foreground">{data.count}</strong> items synced
                </span>
              </div>
            )}
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="flex overflow-x-auto pb-4 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-2">
            {filters.map((f) => {
              const Icon = f.icon;
              const isActive = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-100" 
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 border border-transparent hover:border-border"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Content States */}
          <div className="min-h-[50vh]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[50vh]">
                <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium animate-pulse">Syncing media from Telegram...</p>
              </div>
            ) : isConfigError ? (
              <EmptyState type="no-credentials" />
            ) : error ? (
              <EmptyState type="error" message={(error as any)?.payload?.message} />
            ) : filteredItems.length === 0 ? (
              <EmptyState type="empty" />
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredItems.map((item, index) => (
                    <MediaCard 
                      key={`${item.url}-${index}`} 
                      item={item} 
                      index={index}
                      onClick={setSelectedMedia} 
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Lightbox Modal */}
      <Lightbox 
        item={selectedMedia} 
        onClose={() => setSelectedMedia(null)} 
      />
    </div>
  );
}
