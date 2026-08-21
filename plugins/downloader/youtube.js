import { downloadYouTube } from '../../utils/scraper.js';

export default {
  name: 'ytmp4',
  aliases: ['youtube', 'ytdl', 'ytvideo'],
  category: 'downloader',
  description: 'Download video YouTube dalam format MP4',
  async run({ sock, m, q, usedPrefix, command }) {
    if (!q || (!q.includes('youtube.com') && !q.includes('youtu.be'))) {
      return m.reply(`📥 Silakan sertakan link YouTube yang valid.\n*Contoh:* \`${usedPrefix + command} https://youtu.be/xxxxxx\``);
    }

    await m.react('⏳');
    await m.reply('⏳ Sedang memproses download YouTube...');

    const res = await downloadYouTube(q, 'mp4');

    await sock.sendMessage(m.chat, {
      video: { url: res.downloadUrl },
      caption: `🎥 *YouTube Video Downloader*\n\n` +
        `📝 *Judul:* ${res.title}\n` +
        (res.duration ? `⏱️ *Durasi:* ${res.duration}\n` : '')
    }, { quoted: m });

    await m.react('✅');
  }
};
