import yts from 'yt-search';
import { getNeoxrPlay } from '../../utils/scraper.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';
import { sendButton } from '../../lib/interactive.js';

export default {
  name: 'play2',
  aliases: ['playvid', 'ytplay2', 'putar2'],
  category: 'downloader',
  description: 'Pencarian musik YouTube interaktif dengan daftar pilihan lagu (Play V2)',
  async run({ sock, m, q, usedPrefix, command }) {
    if (!q) {
      return m.reply(
        `┌───〔 🎵 *${toSmallCaps('youtube play 2 (interactive)')}* 〕\n` +
        `│ ${glyphs.arrow} *Format:* \`${usedPrefix + command} <judul lagu>\`\n` +
        `│ ${glyphs.arrow} *Contoh:* \`${usedPrefix + command} Nadin Amizah Rayuan Perempuan Gila\`\n` +
        `└────────────────────`
      );
    }

    await m.react('⏳');

    try {
      const search = await yts(q);
      if (!search.videos || search.videos.length === 0) {
        return m.reply('✕ Video / lagu tidak ditemukan.');
      }

      const topVideo = search.videos[0];
      const otherRows = search.videos.slice(0, 10).map((v, i) => ({
        header: `Track #${i + 1}`,
        title: v.title.length > 50 ? v.title.slice(0, 47) + '...' : v.title,
        description: `⏱️ ${v.duration?.timestamp || ''} • 👤 ${v.author?.name || ''}`,
        id: `${usedPrefix}play ${v.url}`,
        row_id: `${usedPrefix}play ${v.url}`
      }));

      let caption = `┌───〔 🎵 *${toSmallCaps('youtube play stage')}* 〕\n`;
      caption += `│ ${glyphs.arrow} *${toSmallCaps('judul')}:* ${topVideo.title}\n`;
      caption += `│ ${glyphs.arrow} *${toSmallCaps('channel')}:* ${topVideo.author?.name || 'YouTube'}\n`;
      caption += `│ ${glyphs.arrow} *${toSmallCaps('durasi')}:* ${topVideo.duration?.timestamp || '-'}\n`;
      caption += `│ ${glyphs.arrow} *${toSmallCaps('views')}:* ${topVideo.views || '-'}\n`;
      caption += `└────────────────────\n\n`;
      caption += `_Pilih musik dari menu list di bawah atau klik Putar Sekarang._`;

      try {
        await sendButton(sock, m.chat, {
          title: toSmallCaps('YouTube Music Interactive'),
          body: caption.trim(),
          footer: 'Antigravity Music Player • 2026',
          media: {
            image: topVideo.thumbnail
          },
          buttons: [
            {
              name: 'quick_reply',
              params: {
                display_text: '▶️ Putar Sekarang',
                id: `${usedPrefix}play ${topVideo.url}`
              }
            },
            {
              name: 'single_select',
              params: {
                title: '🎧 Pilih Hasil Lainnya',
                sections: [
                  {
                    title: 'Daftar Lagu Terkait',
                    rows: otherRows
                  }
                ]
              }
            }
          ]
        }, m);
      } catch {
        // Fallback jika tidak mendukung button
        await sock.sendMessage(m.chat, {
          image: { url: topVideo.thumbnail },
          caption: caption.trim() + `\n\n_Ketik \`${usedPrefix}play ${topVideo.url}\` untuk memutar lagu ini._`
        }, { quoted: m });
      }

      await m.react('✅');
    } catch (err) {
      await m.react('❌');
      await m.reply(`✕ Gagal mencari lagu: ${err.message}`);
    }
  }
};
