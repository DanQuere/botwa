import { toSmallCaps, glyphs } from '../../utils/font.js';
import antigravity from '../../lib/antigravity.js';

export default {
  name: 'agyclear',
  aliases: ['clear', 'reset', 'agyreset'],
  category: 'ai',
  description: 'Mereset riwayat memori konteks percakapan Antigravity',
  async run({ m }) {
    await m.react('🧹');

    const count = antigravity.clearHistory(m.sender);

    const caption = 
      `┌───〔 ${glyphs.check} *${toSmallCaps('memori konteks dibersihkan')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('pesan direset')}:* ${count} ${toSmallCaps('pesan')}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('status')}:* ${toSmallCaps('konteks kembali ke kondisi awal')}\n` +
      `└────────────────────`;

    await m.reply(caption);
  }
};
