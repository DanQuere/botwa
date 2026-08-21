import db from '../../database/index.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'selfmode',
  aliases: ['self', 'publicmode'],
  category: 'owner',
  description: 'Mengatur mode bot menjadi Self (hanya owner) atau Public (bisa digunakan semua orang)',
  ownerOnly: true,
  async run({ m, q, usedPrefix, command }) {
    if (!q || (!q.includes('on') && !q.includes('off') && !q.includes('self') && !q.includes('public'))) {
      const current = db.data.settings.selfMode ? toSmallCaps('self mode (hanya owner)') : toSmallCaps('public mode (bisa digunakan semua user)');
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('mode bot')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('status saat ini')}:* ${current}\n` +
        `├────────────────────\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} on\` / \`self\` - ${toSmallCaps('hanya owner yang bisa akses')}\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} off\` / \`public\` - ${toSmallCaps('bisa digunakan semua orang')}\n` +
        `└────────────────────`
      );
    }

    const state = q.toLowerCase().includes('on') || q.toLowerCase().includes('self');
    db.data.settings.selfMode = state;
    db.save();

    await m.react('✦');

    const statusStr = state ? toSmallCaps('self mode (khusus owner bot)') : toSmallCaps('public mode (aktif untuk semua orang)');
    const caption = 
      `┌───〔 ${glyphs.check} *${toSmallCaps('pengaturan mode bot')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('mode baru')}:* ${statusStr}\n` +
      `└────────────────────`;

    await m.reply(caption);
  }
};
