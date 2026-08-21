import yts from 'yt-search';
import { getNeoxrPlay } from '../../utils/scraper.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';
import axios from 'axios';

export default {
  name: 'play',
  aliases: ['play1', 'ytplay', 'lagu', 'musik', 'song'],
  category: 'downloader',
  description: 'Mencari dan memutar audio MP3 dari YouTube (Neoxr API Engine)',
  async run({ sock, m, q, usedPrefix, command }) {
    if (!q) {
      return m.reply(
        `┌───〔 🎵 *${toSmallCaps('youtube play music')}* 〕\n` +
        `│ ${glyphs.arrow} *Format:* \`${usedPrefix + command} <judul lagu / kata kunci>\`\n` +
        `│ ${glyphs.arrow} *Contoh:* \`${usedPrefix + command} Komang Raim Laode\`\n` +
        `└────────────────────`
      );
    }

    await m.react('⏳');

    try {
      // 1. Ambil data audio & metadata dari Neoxr API
      let data = null;
      try {
        data = await getNeoxrPlay(q);
      } catch (e) {
        // Fallback jika API sedang gangguan: cari via yt-search
        const search = await yts(q);
        if (!search.videos.length) throw new Error('Lagu tidak ditemukan.');
        const vid = search.videos[0];
        data = await getNeoxrPlay(vid.url);
      }

      if (!data || !data.url) {
        throw new Error('Gagal mendapatkan tautan download audio.');
      }

      // 2. Format Teks Informasi Detail
      let caption = `┌───〔 🎵 *${toSmallCaps('now playing (play 1)')}* 〕\n`;
      caption += `│ ${glyphs.arrow} *${toSmallCaps('judul')}:* ${data.title}\n`;
      caption += `│ ${glyphs.arrow} *${toSmallCaps('channel')}:* ${data.channel || 'YouTube'}\n`;
      caption += `│ ${glyphs.arrow} *${toSmallCaps('durasi')}:* ${data.duration || '-'}\n`;
      caption += `│ ${glyphs.arrow} *${toSmallCaps('kualitas')}:* ${data.quality || '128kbps'}\n`;
      caption += `│ ${glyphs.arrow} *${toSmallCaps('ukuran')}:* ${data.size || '-'}\n`;
      caption += `└────────────────────\n\n`;
      caption += `_› Mengirimkan file audio mp3, mohon tunggu sebentar..._`;

      // 3. Kirim Thumbnail Foto
      if (data.thumbnail) {
        await sock.sendMessage(m.chat, {
          image: { url: data.thumbnail },
          caption: caption.trim()
        }, { quoted: m });
      }

      // 4. Download buffer audio & kirim secara universal & bersih (Kompatibel 100% dengan WhatsApp Business)
      const audioRes = await axios.get(data.url, {
        responseType: 'arraybuffer',
        timeout: 90000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      const audioBuffer = Buffer.from(audioRes.data);
      const fileName = `${data.title.replace(/[\\/:*?"<>|]/g, '_')}.mp3`;

      // Cek apakah user meminta format dokumen (--doc) atau VN (--vn)
      if (q.includes('--doc') || q.includes('--document')) {
        await sock.sendMessage(m.chat, {
          document: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: fileName
        }, { quoted: m });
      } else if (q.includes('--vn') || q.includes('--ptt')) {
        await sock.sendMessage(m.chat, {
          audio: audioBuffer,
          mimetype: 'audio/ogg; codecs=opus',
          ptt: true
        }, { quoted: m });
      } else {
        // Format Audio Player Standar WhatsApp (Bersih, Jernih, Anti-Bug WA Business)
        await sock.sendMessage(m.chat, {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: fileName
        }, { quoted: m });
      }

      await m.react('✅');
    } catch (err) {
      await m.react('❌');
      await m.reply(`✕ Gagal memutar lagu: ${err.message}`);
    }
  }
};
