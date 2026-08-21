import db from '../../database/index.js';
import settings from '../../settings.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'resetlimit',
  aliases: ['resetalllimit'],
  category: 'owner',
  description: 'Mereset limit semua pengguna bot ke nilai default',
  ownerOnly: true,
  async run({ m, args }) {
    const defaultAmount = args[0] && !isNaN(args[0]) ? parseInt(args[0], 10) : (settings.defaultLimit || 25);
    const count = db.resetAllLimits(defaultAmount);

    const caption = 
      `┌───〔 ${glyphs.check} *${toSmallCaps('reset limit berhasil')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('total user')}:* ${count}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('limit baru')}:* ${defaultAmount}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('vip premium')}:* ${glyphs.infinite}\n` +
      `└────────────────────`;

    await m.reply(caption);
  }
};
