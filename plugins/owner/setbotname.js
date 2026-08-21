import { toSmallCaps } from '../../utils/font.js';
import config from '../../config/config.js';

export default {
  name: 'setbotname',
  aliases: ['botname', 'gantinamabot'],
  category: 'owner',
  description: 'Mengubah nama bot secara dinamis',
  ownerOnly: true,
  async run({ m, q, usedPrefix }) {
    if (!q) {
      return m.reply(`📝 Masukkan nama bot baru.\n*Contoh:* \`${usedPrefix}setbotname Antigravity Ultra\``);
    }

    config.botName = q.trim();
    if (global.settings) global.settings.botName = q.trim();

    await m.reply(`✓ *${toSmallCaps('nama bot berhasil diubah')}* menjadi: *${q.trim()}*`);
  }
};
