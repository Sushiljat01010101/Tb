import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface TelegramPhoto {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  file_size?: number;
}

interface TelegramVideo {
  file_id: string;
  file_unique_id: string;
  width: number;
  height: number;
  duration: number;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

interface TelegramDocument {
  file_id: string;
  file_unique_id: string;
  file_name?: string;
  mime_type?: string;
  file_size?: number;
}

interface TelegramMessage {
  message_id: number;
  date: number;
  photo?: TelegramPhoto[];
  video?: TelegramVideo;
  document?: TelegramDocument;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  channel_post?: TelegramMessage;
}

interface MediaItem {
  type: "image" | "video" | "document";
  url: string;
  file_name: string;
  date: string;
}

async function getFileUrl(token: string, fileId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
    );
    const data = (await res.json()) as { ok: boolean; result?: { file_path: string } };
    if (!data.ok || !data.result?.file_path) return null;
    return `https://api.telegram.org/file/bot${token}/${data.result.file_path}`;
  } catch {
    return null;
  }
}

router.get("/media", async (_req, res) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    res.status(500).json({
      error: "configuration_missing",
      message:
        "TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables are not set. Please add them in Replit Secrets.",
    });
    return;
  }

  try {
    const updatesUrl = `https://api.telegram.org/bot${token}/getUpdates?limit=100&allowed_updates=["message","channel_post"]`;
    const updatesRes = await fetch(updatesUrl);
    const updatesData = (await updatesRes.json()) as {
      ok: boolean;
      result?: TelegramUpdate[];
      description?: string;
    };

    if (!updatesData.ok) {
      res.status(500).json({
        error: "telegram_api_error",
        message: updatesData.description ?? "Telegram API returned an error",
      });
      return;
    }

    const updates: TelegramUpdate[] = updatesData.result ?? [];

    const mediaItems: MediaItem[] = [];

    const processMessage = async (msg: TelegramMessage) => {
      const dateStr = new Date(msg.date * 1000).toISOString();

      if (msg.photo && msg.photo.length > 0) {
        const largest = msg.photo.reduce((a, b) =>
          (a.file_size ?? 0) > (b.file_size ?? 0) ? a : b
        );
        const url = await getFileUrl(token, largest.file_id);
        if (url) {
          mediaItems.push({
            type: "image",
            url,
            file_name: `photo_${msg.message_id}.jpg`,
            date: dateStr,
          });
        }
      } else if (msg.video) {
        const url = await getFileUrl(token, msg.video.file_id);
        if (url) {
          mediaItems.push({
            type: "video",
            url,
            file_name: msg.video.file_name ?? `video_${msg.message_id}.mp4`,
            date: dateStr,
          });
        }
      } else if (msg.document) {
        const url = await getFileUrl(token, msg.document.file_id);
        if (url) {
          mediaItems.push({
            type: "document",
            url,
            file_name: msg.document.file_name ?? `document_${msg.message_id}`,
            date: dateStr,
          });
        }
      }
    };

    const relevantMessages: TelegramMessage[] = [];
    for (const update of updates) {
      const msg = update.message ?? update.channel_post;
      if (!msg) continue;
      const msgChatId = String((msg as any).chat?.id ?? "");
      if (msgChatId !== String(chatId)) continue;
      if (msg.photo || msg.video || msg.document) {
        relevantMessages.push(msg);
      }
    }

    await Promise.all(relevantMessages.map(processMessage));

    mediaItems.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json({ items: mediaItems, count: mediaItems.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: "internal_error", message });
  }
});

export default router;
