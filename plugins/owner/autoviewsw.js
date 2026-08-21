import db from '../../database/index.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'autoviewsw',
  aliases: ['viewsw', 'storyview', 'swview', 'liatsw'],
  category: 'owner',
  description: 'Otomatis melihat dan membaca setiap Status / Story WhatsApp kontak',
  ownerOnly: true,
  async run({ m, q, usedPrefix, command }) {
    if (!q || (!q.includes('on') && !q.includes('off') && !q.includes('enable') && !q.includes('disable'))) {
      const current = db.data.settings.autoViewSw ? toSmallCaps('aktif (on)') : toSmallCaps('nonaktif (off)');
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('auto view story wa')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('status saat ini')}:* ${current}\n` +
        `├────────────────────\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} on\` - ${toSmallCaps('aktifkan auto view status')}\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} off\` - ${toSmallCaps('matikan auto view status')}\n` +
        `└────────────────────`
      );
    }

    const state = q.toLowerCase().includes('on') || q.toLowerCase().includes('enable');
    db.data.settings.autoViewSw = state;
    db.save();

    await m.react('✦');

    const statusStr = state ? toSmallCaps('diaktifkan (otomatis lihat story wa)') : toSmallCaps('dinonaktifkan');
    const caption = 
      `┌───〔 ${glyphs.check} *${toSmallCaps('auto view story')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('status baru')}:* ${statusStr}\n` +
      `└────────────────────`;

    await m.reply(caption);
  }
};
