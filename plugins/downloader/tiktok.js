import { downloadTikTok } from '../../utils/scraper.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';
import { formatNumber } from '../../utils/format.js';

export default {
  name: 'tiktok',
  aliases: ['tt', 'ttnowm', 'tiktokdl', 'ttdl'],
  category: 'downloader',
  description: 'Download video dan audio TikTok tanpa watermark',
  async run({ sock, m, q, usedPrefix, command }) {
    if (!q || (!q.includes('tiktok.com') && !q.includes('douyin.com'))) {
      return m.reply(`📥 Silakan sertakan link TikTok yang valid.\n*Contoh:* \`${usedPrefix + command} https://vt.tiktok.com/xxxxxx/\``);
    }

    await m.react('⏳');

    try {
      const data = await downloadTikTok(q);

      const authorName = typeof data.author === 'object' 
        ? `${data.author.name} (@${data.author.username})` 
        : (data.author || 'Unknown');

      const likesCount = data.stats?.likes ? formatNumber(data.stats.likes) : '-';
      const viewsCount = data.stats?.views ? formatNumber(data.stats.views) : '-';
      const commentsCount = data.stats?.comments ? formatNumber(data.stats.comments) : '-';
      const sharesCount = data.stats?.shares ? formatNumber(data.stats.shares) : '-';

      const captionText = `┌───〔 ${glyphs.diamond} *${toSmallCaps('tiktok downloader')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('pembuat')}:* ${authorName}\n` +
        (data.caption ? `│ ${glyphs.arrow} *${toSmallCaps('caption')}:* ${data.caption.slice(0, 150)}${data.caption.length > 150 ? '...' : ''}\n` : '') +
        (data.music?.title ? `│ ${glyphs.arrow} *${toSmallCaps('sound')}:* ${data.music.title}\n` : '') +
        `│ ${glyphs.arrow} *${toSmallCaps('stats')}:* ❤️ ${likesCount} 💬 ${commentsCount} 👁️ ${viewsCount} 🔁 ${sharesCount}\n` +
        `└────────────────────`;

      if (data.video) {
        await sock.sendMessage(m.chat, {
          video: { url: data.video },
          caption: captionText
        }, { quoted: m });
        await m.react('✅');
      } else if (data.audio) {
        await m.reply(captionText);
        await sock.sendMessage(m.chat, {
          audio: { url: data.audio },
          mimetype: 'audio/mp4',
          fileName: `${data.title || 'tiktok_audio'}.mp3`
        }, { quoted: m });
        await m.react('✅');
      } else {
        throw new Error('Tidak ada media video/audio yang dapat diunduh.');
      }
    } catch (err) {
      await m.react('❌');
      throw new Error(`Gagal mengunduh TikTok: ${err.message}`);
    }
  }
};
