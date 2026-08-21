import db from '../../database/index.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'delprem',
  aliases: ['delpremium', 'unprem', 'prem-'],
  category: 'owner',
  description: 'Menghapus status VIP Premium pengguna',
  ownerOnly: true,
  async run({ m, args, usedPrefix, command }) {
    let target = null;

    if (m.quoted) {
      target = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      target = m.mentionedJid[0];
    } else if (args[0]) {
      const cleanNum = args[0].replace(/[^0-9]/g, '');
      if (cleanNum.length >= 7) {
        target = `${cleanNum}@s.whatsapp.net`;
      }
    }

    if (!target) {
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('cara penggunaan')}* 〕\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} @tag\`\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} 628xxx\`\n` +
        `└────────────────────`
      );
    }

    const updated = db.delPremium(target);
    const targetNumber = target.split('@')[0];

    const caption = 
      `┌───〔 ${glyphs.cross} *${toSmallCaps('sukses hapus premium')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('user')}:* @${targetNumber}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('status')}:* ${toSmallCaps('free user')}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('limit')}:* ${updated.limit}\n` +
      `└────────────────────`;

    await m.reply(caption, { mentions: [target] });
  }
};
