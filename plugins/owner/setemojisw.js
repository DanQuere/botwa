import db from '../../database/index.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'setemojisw',
  aliases: ['setswemoji', 'swemoji', 'emojisw'],
  category: 'owner',
  description: 'Mengatur emoji kustom untuk auto-react story / status WhatsApp (misal: 🐔, 🗿, 🦄, 🤖, dsb.)',
  ownerOnly: true,
  async run({ m, q, usedPrefix, command }) {
    if (!q) {
      const currentList = (db.data.settings.swEmojis || ['🐔', '🗿', '🦄', '🤖', '👑', '🔥', '⚡', '🐧', '🦊']).join(' ');
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('pengaturan emoji story')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('emoji saat ini')}:* ${currentList}\n` +
        `├────────────────────\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('format satu emoji')}:*\n` +
        `│   \`${usedPrefix + command} 🐔\`\n` +
        `│\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('format banyak emoji (acak)')}:*\n` +
        `│   \`${usedPrefix + command} 🐔 🗿 🦄 🤖 👑 🔥 ⚡\`\n` +
        `└────────────────────`
      );
    }

    // Ekstrak semua emoji / karakter unik dari input
    const inputParts = q.trim().split(/\s+/).filter(Boolean);
    const newEmojis = inputParts.length > 0 ? inputParts : ['🐔'];

    db.data.settings.swEmojis = newEmojis;
    db.save();

    await m.react('✦');

    const caption = 
      `┌───〔 ${glyphs.check} *${toSmallCaps('emoji story diperbarui')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('emoji baru')}:* ${newEmojis.join(' ')}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('total pilihan')}:* ${newEmojis.length} emoji\n` +
      `└────────────────────\n` +
      `_› ${toSmallCaps('bot akan menggunakan emoji ini saat otomatis merespon status wa.')}_`;

    await m.reply(caption);
  }
};
