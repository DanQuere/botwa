import { toSmallCaps, glyphs } from '../../utils/font.js';
import config from '../../config/config.js';

export default {
  name: 'donasi',
  aliases: ['donate', 'support', 'qris'],
  category: 'main',
  description: 'Informasi donasi dan dukungan untuk bot',
  async run({ m, usedPrefix = '.' }) {
    let donasiText = `┌───〔 💖 *${toSmallCaps('donasi & support')}* 〕\n`;
    donasiText += `│ Terima kasih telah menggunakan *${config.botName}*!\n`;
    donasiText += `│ Donasi dari Anda sangat membantu operasional server & pengembangan fitur bot.\n`;
    donasiText += `│\n`;
    donasiText += `│ ${glyphs.arrow} *Dana / GoPay / OVO:* Hubungi Owner\n`;
    donasiText += `│ ${glyphs.arrow} *Owner Kontak:* \`${usedPrefix}owner\`\n`;
    donasiText += `│ ${glyphs.arrow} *Upgrade VIP Premium:* \`${usedPrefix}owner\`\n`;
    donasiText += `└────────────────────\n\n`;
    donasiText += `_› ${toSmallCaps('terima kasih atas dukungan terbaik anda!')}_`;

    await m.reply(donasiText.trim());
  }
};
