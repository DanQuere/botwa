import { toSmallCaps, glyphs } from '../../utils/font.js';
import antigravity from '../../lib/antigravity.js';

export default {
  name: 'agylogout',
  aliases: ['logout', 'agyexit'],
  category: 'ai',
  description: 'Keluar dan menghapus sesi token Google Antigravity',
  async run({ m }) {
    await m.react('👋');
    antigravity.logout(m.sender);

    const caption = 
      `┌───〔 ${glyphs.cross} *${toSmallCaps('logout berhasil')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('status')}:* ${toSmallCaps('sesi token telah dibersihkan')}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('riwayat')}:* ${toSmallCaps('memori konteks direset')}\n` +
      `└────────────────────`;

    await m.reply(caption);
  }
};
