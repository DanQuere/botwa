import { toSmallCaps, glyphs } from '../../utils/font.js';
import antigravity from '../../lib/antigravity.js';

export default {
  name: 'agytoken',
  aliases: ['token', 'settoken', 'agykey', 'setkey', 'code'],
  category: 'ai',
  description: 'Memasukkan dan mengaktifkan token/kode otorisasi Google Antigravity',
  async run({ m, q, usedPrefix, command }) {
    if (!q) {
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('aktivasi token / kode')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('format')}:* \`${usedPrefix + command} <kode_oauth / api_key>\`\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('contoh 1 (OAuth)')}:* \`${usedPrefix + command} 4/0ATsM...\`\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('contoh 2 (API Key)')}:* \`${usedPrefix + command} AIzaSy...\`\n` +
        `└────────────────────\n` +
        `_› ${toSmallCaps(`ketik ${usedPrefix}login untuk mendapatkan tautan Google OAuth baru.`)}_`
      );
    }

    await m.react('⏳');

    const cleanToken = q.trim();

    try {
      const result = await antigravity.login(m.sender, cleanToken);
      const session = result.session;

      await m.react('✦');

      const masked = cleanToken.slice(0, 8) + '...' + cleanToken.slice(-4);
      let authTypeLabel = 'Google Antigravity Token';
      if (result.type === 'oauth') authTypeLabel = 'Google OAuth 2.0 (PKCE Verified)';
      else if (result.type === 'apikey') authTypeLabel = 'Google AI Studio API Key';

      const caption = 
        `┌───〔 ${glyphs.check} *${toSmallCaps('antigravity terhubung')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('metode')}:* ${authTypeLabel}\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('status')}:* ${toSmallCaps('sesi aktif & awet permanen')}\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('token')}:* \`${masked}\`\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('model default')}:* \`${session.model}\`\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('multimodal vision')}:* ${toSmallCaps('siap digunakan')}\n` +
        `└────────────────────\n` +
        `_› ${toSmallCaps(`mulai obrolan dengan mengetik: ${usedPrefix}agy <pertanyaan>`)}_\n` +
        `_› ${toSmallCaps(`atau kirim pesan langsung di DM tanpa command!`)}_`;

      await m.reply(caption);
    } catch (err) {
      await m.react('✕');
      await m.reply(`✕ *${toSmallCaps('gagal aktivasi token')}:*\n${err.message}`);
    }
  }
};

