import db from '../../database/index.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'listowner',
  aliases: ['ownerlist', 'daftaronwer'],
  category: 'owner',
  description: 'Melihat seluruh daftar nomor Owner bot aktif',
  ownerOnly: true,
  async run({ m }) {
    const owners = db.getOwners();

    let listText = `┌───〔 ${glyphs.diamond} *${toSmallCaps(`daftar owner bot (${owners.length})`)}* 〕\n`;
    owners.forEach((num, i) => {
      listText += `│ ${glyphs.arrow} ${i + 1}. @${num}\n`;
    });
    listText += `└────────────────────`;

    await m.reply(listText, {
      mentions: owners.map(num => `${num}@s.whatsapp.net`)
    });
  }
};
