import db from '../../database/index.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'setlimit',
  aliases: ['aturlimit'],
  category: 'owner',
  description: 'Mengatur jumlah limit pengguna',
  ownerOnly: true,
  async run({ m, args, usedPrefix, command }) {
    let target = null;
    let amount = 25;

    if (m.quoted) {
      target = m.quoted.sender;
      if (args[0] && !isNaN(args[0])) amount = parseInt(args[0], 10);
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      target = m.mentionedJid[0];
      if (args[1] && !isNaN(args[1])) amount = parseInt(args[1], 10);
    } else if (args[0]) {
      const cleanNum = args[0].replace(/[^0-9]/g, '');
      if (cleanNum.length >= 7) {
        target = `${cleanNum}@s.whatsapp.net`;
        if (args[1] && !isNaN(args[1])) amount = parseInt(args[1], 10);
      }
    }

    if (!target) {
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('cara penggunaan')}* 〕\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} @tag <jumlah>\`\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} 628xxx <jumlah>\`\n` +
        `└────────────────────`
      );
    }

    const user = db.getUser(target);
    user.limit = Number(amount);
    db.save();

    const targetNumber = target.split('@')[0];
    const caption = 
      `┌───〔 ${glyphs.check} *${toSmallCaps('sukses atur limit')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('user')}:* @${targetNumber}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('limit baru')}:* ${user.limit}\n` +
      `└────────────────────`;

    await m.reply(caption, { mentions: [target] });
  }
};
