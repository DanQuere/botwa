import db from '../../database/index.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'delowner',
  aliases: ['hapusowner', 'owner-'],
  category: 'owner',
  description: 'Menghapus nomor dari daftar Owner bot',
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

    const cleanNumber = target.split('@')[0].replace(/[^0-9]/g, '');
    db.delOwner(cleanNumber);

    const user = db.getUser(target);
    if (user) {
      user.role = db.calculateRole(user);
      db.save();
    }

    const caption = 
      `┌───〔 ${glyphs.cross} *${toSmallCaps('sukses hapus owner')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('user')}:* @${cleanNumber}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('status')}:* ${toSmallCaps('kembali ke user standar')}\n` +
      `└────────────────────`;

    await m.reply(caption, { mentions: [target] });
  }
};
