import { toSmallCaps, glyphs } from '../../utils/font.js';

function toRoman(num) {
  const map = {
    M: 1000, CM: 900, D: 500, CD: 400, C: 100,
    XC: 90, L: 50, XL: 40, X: 10, IX: 9,
    V: 5, IV: 4, I: 1
  };
  let result = '';
  for (const key in map) {
    while (num >= map[key]) {
      result += key;
      num -= map[key];
    }
  }
  return result;
}

export default {
  name: 'romawi',
  aliases: ['angka-romawi', 'roman'],
  category: 'tools',
  description: 'Mengubah angka biasa ke angka Romawi',
  async run({ m, q, usedPrefix }) {
    const num = parseInt(q, 10);
    if (isNaN(num) || num <= 0 || num > 4000) {
      return m.reply(`🏛️ Masukkan angka antara 1 sampai 3999.\n*Contoh:* \`${usedPrefix}romawi 2026\``);
    }

    const roman = toRoman(num);

    let text = `┌───〔 🏛️ *${toSmallCaps('angka romawi')}* 〕\n`;
    text += `│ ${glyphs.arrow} *Angka Desimal:* ${num}\n`;
    text += `│ ${glyphs.arrow} *Angka Romawi:* *${roman}*\n`;
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
