import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'dadu',
  aliases: ['dice', 'roll', 'koin', 'coin'],
  category: 'fun',
  description: 'Lempar dadu acak (1-6) atau lempar koin (Gambar/Angka)',
  async run({ m, command }) {
    if (command === 'koin' || command === 'coin') {
      const sides = ['Gambar 🪙', 'Angka 🔢'];
      const result = sides[Math.floor(Math.random() * sides.length)];

      let text = `┌───〔 🪙 *${toSmallCaps('lempar koin')}* 〕\n`;
      text += `│ ${glyphs.arrow} *${toSmallCaps('hasil')}:* ${result}\n`;
      text += `└────────────────────`;
      return await m.reply(text.trim());
    }

    const diceFaces = ['⚀ (1)', '⚁ (2)', '⚂ (3)', '⚃ (4)', '⚄ (5)', '⚅ (6)'];
    const roll = diceFaces[Math.floor(Math.random() * diceFaces.length)];

    let text = `┌───〔 🎲 *${toSmallCaps('lempar dadu')}* 〕\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('hasil kocokan')}:* ${roll}\n`;
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
