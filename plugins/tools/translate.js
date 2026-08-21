import { translateText } from '../../utils/scraper.js';

export default {
  name: 'tr',
  aliases: ['translate', 'terjemah'],
  category: 'tools',
  description: 'Menerjemahkan teks antar bahasa dengan Google Translate',
  async run({ m, args, q, usedPrefix, command }) {
    let targetLang = 'id';
    let text = q;

    if (args.length >= 2 && args[0].length <= 3) {
      targetLang = args[0];
      text = args.slice(1).join(' ');
    } else if (m.quoted && m.quoted.text) {
      text = m.quoted.text;
      if (args[0] && args[0].length <= 3) {
        targetLang = args[0];
      }
    }

    if (!text) {
      return m.reply(`🌐 *Cara Penggunaan:*\n\`${usedPrefix + command} <kode_bahasa> <teks>\` atau reply pesan dengan \`${usedPrefix + command} en\`\n\n*Contoh:* \`${usedPrefix + command} en Selamat pagi semuanya!\``);
    }

    await m.react('🌐');
    const result = await translateText(text, targetLang);

    await m.reply(`🌐 *Google Translate [${targetLang.toUpperCase()}]*\n\n${result}`);
  }
};
