import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'countwords',
  aliases: ['hitungkarakter', 'hitunghuruf', 'wordcount'],
  category: 'tools',
  description: 'Menghitung jumlah kata, karakter, dan baris dari teks',
  async run({ m, q, usedPrefix }) {
    const input = q || m.quoted?.text;
    if (!input) {
      return m.reply(`📊 Masukkan atau reply teks yang ingin dihitung.\n*Contoh:* \`${usedPrefix}countwords Halo selamat pagi semuanya.\``);
    }

    const characters = input.length;
    const charNoSpaces = input.replace(/\s/g, '').length;
    const words = input.trim().split(/\s+/).filter(Boolean).length;
    const lines = input.split('\n').length;

    let text = `┌───〔 📊 *${toSmallCaps('analisis teks')}* 〕\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('jumlah kata')}:* ${words} kata\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('total karakter')}:* ${characters} huruf\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('tanpa spasi')}:* ${charNoSpaces} huruf\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('jumlah baris')}:* ${lines} baris\n`;
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
