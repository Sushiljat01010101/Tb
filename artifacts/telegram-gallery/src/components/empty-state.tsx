import { motion } from "framer-motion";
import { Inbox, AlertCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  type: "empty" | "error" | "no-credentials";
  message?: string;
}

export function EmptyState({ type, message }: EmptyStateProps) {
  const isError = type === "error" || type === "no-credentials";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-24 px-4 text-center max-w-2xl mx-auto"
    >
      <div className="relative mb-8">
        <div className={cn(
          "absolute inset-0 blur-3xl opacity-20 rounded-full",
          isError ? "bg-destructive" : "bg-primary"
        )} />
        
        <div className={cn(
          "relative w-24 h-24 rounded-3xl flex items-center justify-center border shadow-2xl",
          isError 
            ? "bg-destructive/10 border-destructive/20 text-destructive" 
            : "bg-card border-border text-primary"
        )}>
          {type === "empty" && <Inbox className="w-10 h-10" />}
          {type === "error" && <AlertCircle className="w-10 h-10" />}
          {type === "no-credentials" && <Settings className="w-10 h-10 text-primary" />}
        </div>
      </div>

      <h2 className="text-3xl font-display font-bold text-foreground mb-3">
        {type === "empty" && "No media found"}
        {type === "error" && "Failed to load media"}
        {type === "no-credentials" && "Setup Required"}
      </h2>
      
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        {type === "empty" && "There are no photos, videos, or documents matching the current filter in this chat yet."}
        {type === "error" && (message || "An unexpected error occurred while communicating with the Telegram API.")}
        {type === "no-credentials" && "The Telegram Bot Token and Chat ID have not been configured on the server. Please add them as Secrets in Replit."}
      </p>

      {type === "no-credentials" && (
        <div className="w-full bg-card border border-border rounded-xl p-6 text-left">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            How to configure:
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-1">
            <li>Open the <strong className="text-foreground">Secrets</strong> tool in Replit.</li>
            <li>Add <code className="bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">TELEGRAM_BOT_TOKEN</code> with your bot token.</li>
            <li>Add <code className="bg-secondary px-1.5 py-0.5 rounded text-secondary-foreground">TELEGRAM_CHAT_ID</code> with your target chat ID.</li>
            <li>Restart the server.</li>
          </ol>
        </div>
      )}
    </motion.div>
  );
}
