import axios from "axios";
import yts from "yt-search";
import ytdl, { fallbackToMp3Buffer } from "../../src/scraper/ytdl.js";

const pluginConfig = {
  name: "play",
  alias: ["playaudio"],
  category: "search",
  description: "Cari YouTube lalu kirim audio MP3",
  usage: ".play <query>",
  example: ".play komang",
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

function formatViews(n) {
  if (!n) return "0";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toString();
}

async function getAudioUrl(url) {
  // Primary API used by the current ytmp3 plugin.
  try {
    const { data } = await axios.get(
      `https://my.izuka-api.xyz/api/downloader/ytmp3?url=${encodeURIComponent(url)}`,
      { timeout: 60000 }
    );

    const download = data?.result?.download_url || data?.result?.download;
    if (download) {
      return {
        download,
        title: data?.result?.title || null,
      };
    }
  } catch (e) {
    console.error("[Play API]", e.message);
  }

  // Fallback to the local YouTube scraper.
  const fallback = await ytdl(url, "mp3");
  if (fallback?.status && fallback?.dl) {
    return {
      download: fallback.dl,
      title: fallback.title || null,
      isFallback: true,
    };
  }

  throw new Error(fallback?.mess || "Gagal mendapatkan URL audio");
}

async function downloadAudio(url, isFallback = false) {
  if (isFallback) {
    return fallbackToMp3Buffer(url);
  }

  const response = await axios.get(url, {
    responseType: "arraybuffer",
    timeout: 120000,
    maxContentLength: 100 * 1024 * 1024,
    maxBodyLength: 100 * 1024 * 1024,
  });

  const contentType = String(response.headers["content-type"] || "").toLowerCase();
  if (contentType.includes("text/html") || contentType.includes("application/json")) {
    throw new Error("URL download tidak mengembalikan file audio");
  }

  return Buffer.from(response.data);
}

async function handler(m, { sock }) {
  const query = m.text?.trim();
  if (!query) {
    return m.reply(`🎵 *PLAY*\n\nContoh:\n${m.prefix}play komang`);
  }

  await m.react("🕐");

  try {
    const search = await yts(query);
    if (!search.videos?.length) {
      throw new Error("Video tidak ditemukan");
    }

    const video = search.videos[0];
    const result = await getAudioUrl(video.url);
    const audioBuffer = await downloadAudio(result.download, result.isFallback);

    const desc = video.description
      ? video.description.substring(0, 150).replace(/\n/g, " ")
      : "";

    const caption =
      `🎵 *NOW PLAYING*\n\n` +
      `📌 *Judul:* ${video.title}\n` +
      `👤 *Channel:* ${video.author?.name || "-"}\n` +
      `⏱️ *Durasi:* ${video.duration?.timestamp || "-"}\n` +
      `👀 *Views:* ${formatViews(video.views)}\n` +
      `📅 *Upload:* ${video.ago || "-"}\n\n` +
      (desc ? `📝 *Deskripsi:* ${desc}${video.description.length > 150 ? "..." : ""}\n\n` : "") +
      `🔗 *YouTube:* ${video.url}`;

    // Standard WhatsApp media message: no custom sendPreview payload.
    await sock.sendMessage(
      m.chat,
      {
        image: { url: video.thumbnail },
        caption,
      },
      { quoted: m }
    );

    await sock.sendMessage(
      m.chat,
      {
        audio: audioBuffer,
        mimetype: "audio/mpeg",
        ptt: false,
        fileName: `${video.title.replace(/[\\/:*?"<>|]/g, "_")}.mp3`,
      },
      { quoted: m }
    );

    await m.react("✅");
  } catch (err) {
    console.error("[Play]", err);
    await m.react("❌");
    return m.reply(
      `❌ *PLAY GAGAL*\n\n${err?.message || "Gagal mengambil audio."}\n\nCoba lagi beberapa saat lagi.`
    );
  }
}

export { pluginConfig as config, handler };
