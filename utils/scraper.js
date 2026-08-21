import axios from 'axios';
import settings from '../settings.js';

/**
 * YouTube Audio Play via Neoxr API
 */
export async function getNeoxrPlay(query) {
  const apiKey = settings?.api?.neoxr?.apiKey || settings?.neoxrApiKey || 'daniel001';
  const baseUrl = settings?.api?.neoxr?.baseUrl || 'https://api.neoxr.eu/api';
  
  try {
    const res = await axios.get(`${baseUrl}/play?q=${encodeURIComponent(query.trim())}&apikey=${apiKey}`, {
      timeout: 45000
    });
    
    if (res.data && res.data.status && res.data.data) {
      return {
        status: true,
        id: res.data.id,
        title: res.data.title,
        thumbnail: res.data.thumbnail,
        duration: res.data.duration,
        durationSeconds: res.data.duration_seconds,
        channel: res.data.channel,
        views: res.data.views,
        filename: res.data.data.filename,
        quality: res.data.data.quality,
        size: res.data.data.size,
        extension: res.data.data.extension,
        url: res.data.data.url
      };
    }
    
    throw new Error(res.data?.message || 'Gagal memutar audio dari YouTube.');
  } catch (err) {
    throw new Error(err.response?.data?.message || err.message || 'Gagal memproses audio');
  }
}

/**
 * TikTok Downloader via Neoxr API with reliable fallback
 */
export async function downloadTikTok(url) {
  const cleanUrl = url.trim();
  const apiKey = settings?.api?.neoxr?.apiKey || settings?.neoxrApiKey || 'daniel001';
  const baseUrl = settings?.api?.neoxr?.baseUrl || 'https://api.neoxr.eu/api';

  // Primary: Neoxr API
  try {
    const res = await axios.get(`${baseUrl}/tiktok?url=${encodeURIComponent(cleanUrl)}&apikey=${apiKey}`, {
      timeout: 30000
    });

    if (res.data && res.data.status && res.data.data) {
      const d = res.data.data;
      return {
        status: true,
        id: d.id,
        caption: d.caption || 'TikTok Media',
        title: d.caption || 'TikTok Media',
        author: {
          name: d.author?.nickname || 'Unknown',
          username: d.author?.uniqueId || 'unknown',
          avatar: d.author?.avatarMedium || d.author?.avatarLarger || d.author?.avatarThumb
        },
        stats: {
          likes: d.statistic?.likes || 0,
          comments: d.statistic?.comments || 0,
          shares: d.statistic?.shares || 0,
          views: d.statistic?.views || 0,
          saved: d.statistic?.saved || 0
        },
        music: {
          title: d.music?.title || 'Original Sound',
          author: d.music?.author || 'Unknown',
          duration: d.music?.duration || 0,
          url: d.audio
        },
        video: d.video || d.videoWM,
        audio: d.audio,
        photo: d.photo || false
      };
    }
  } catch (err) {
    // Continue to TikWM fallback
  }

  // Fallback: TikWM API
  try {
    const res = await axios.post('https://www.tikwm.com/api/', {
      url: cleanUrl,
      count: 12,
      cursor: 0,
      web: 1,
      hd: 1
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json'
      },
      timeout: 20000
    });

    const data = res.data?.data;
    if (!data) throw new Error('Video tidak ditemukan atau akun private.');

    return {
      status: true,
      id: data.id,
      caption: data.title || 'TikTok Video',
      title: data.title || 'TikTok Video',
      author: {
        name: data.author?.nickname || 'Unknown',
        username: data.author?.unique_id || 'unknown',
        avatar: data.author?.avatar
      },
      stats: {
        likes: data.digg_count || 0,
        comments: data.comment_count || 0,
        shares: data.share_count || 0,
        views: data.play_count || 0,
        saved: data.collect_count || 0
      },
      music: {
        title: data.music_info?.title || 'Original Sound',
        author: data.music_info?.author || 'Unknown',
        duration: data.music_info?.duration || 0,
        url: data.music
      },
      duration: data.duration,
      cover: data.cover,
      video: data.play || data.hdplay || data.wmplay,
      audio: data.music
    };
  } catch (err) {
    throw new Error(`Gagal mengunduh TikTok: ${err.message}`);
  }
}

/**
 * YouTube Downloader via public scraper API
 */
export async function downloadYouTube(url, format = 'mp4') {
  try {
    const cleanUrl = url.trim();
    const res = await axios.get(`https://api.vreden.my.id/api/ytmp4?url=${encodeURIComponent(cleanUrl)}`, {
      timeout: 30000
    }).catch(() => null);

    if (res?.data?.result?.download?.url) {
      return {
        title: res.data.result.metadata?.title || 'YouTube Video',
        duration: res.data.result.metadata?.duration,
        downloadUrl: res.data.result.download.url
      };
    }

    // Secondary fallback
    const res2 = await axios.get(`https://api.ryzendesu.vip/api/downloader/ytmp4?url=${encodeURIComponent(cleanUrl)}`, {
      timeout: 30000
    }).catch(() => null);

    if (res2?.data?.url) {
      return {
        title: res2.data.title || 'YouTube Video',
        downloadUrl: res2.data.url
      };
    }

    throw new Error('Gagal mengambil URL download video YouTube.');
  } catch (err) {
    throw new Error(`YouTube Downloader error: ${err.message}`);
  }
}

/**
 * Free AI Chat Assistant (with multi-turn or single query)
 */
export async function chatAI(query, history = []) {
  try {
    // Free LLM endpoint
    const res = await axios.get(`https://api.ryzendesu.vip/api/ai/chatgpt?text=${encodeURIComponent(query)}`, {
      timeout: 30000
    }).catch(() => null);

    if (res?.data?.response || res?.data?.result || res?.data?.text) {
      return res.data.response || res.data.result || res.data.text;
    }

    // Fallback free AI endpoint
    const fallbackRes = await axios.get(`https://api.siputzx.my.id/api/ai/gpt3?prompt=Kamu%20adalah%20asisten%20AI%20WhatsApp%20yang%20ramah%20dan%20pintar.&content=${encodeURIComponent(query)}`, {
      timeout: 30000
    }).catch(() => null);

    if (fallbackRes?.data?.data) {
      return fallbackRes.data.data;
    }

    // Offline fallback
    return `Halo! Saya asisten AI WhatsApp. Anda bertanya: "${query}". Layanan AI saat ini sedang memproses permintaan Anda.`;
  } catch (err) {
    return `Halo! Terjadi kendala pada gateway AI: ${err.message}.`;
  }
}

/**
 * Google Translate
 */
export async function translateText(text, targetLang = 'id') {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await axios.get(url, { timeout: 15000 });
    
    if (res.data && res.data[0]) {
      const translated = res.data[0].map(item => item[0]).filter(Boolean).join('');
      return translated;
    }
    throw new Error('Terjemahan kosong');
  } catch (err) {
    throw new Error(`Gagal menerjemahkan teks: ${err.message}`);
  }
}

/**
 * Generate QR Code Buffer / URL
 */
export function getQRUrl(text) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(text)}`;
}
