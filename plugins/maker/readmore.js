import { toSmallCaps } from '../../utils/font.js';

export default {
  name: 'readmore',
  aliases: ['spoiler', 'baca-selengkapnya'],
  category: 'maker',
  description: 'Membuat teks Read More (Baca Selengkapnya) di WhatsApp',
  async run({ m, q, usedPrefix }) {
    if (!q || !q.includes('|')) {
      return m.reply(`📖 *Read More Generator*\n\nFormat: \`${usedPrefix}readmore Teks Depan | Teks Tersembunyi\`\n*Contoh:* \`${usedPrefix}readmore Info Penting | Ini adalah rahasianya!\``);
    }

    const [front, ...hidden] = q.split('|').map(s => s.trim());
    const readMoreChar = String.fromCharCode(8206).repeat(4001);

    const result = `${front} ${readMoreChar} ${hidden.join(' | ')}`;
    await m.reply(result);
  }
};
