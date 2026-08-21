import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'suhu',
  aliases: ['konversisuhu', 'temp'],
  category: 'tools',
  description: 'Konversi suhu lengkap (Celsius, Fahrenheit, Kelvin, Reamur)',
  async run({ m, q, usedPrefix }) {
    const val = parseFloat(q);
    if (isNaN(val)) {
      return m.reply(`🌡️ *Konverter Suhu*\n\nMasukkan nilai suhu dalam Celsius (°C).\n*Contoh:* \`${usedPrefix}suhu 36\``);
    }

    const c = val;
    const f = (c * 9/5) + 32;
    const k = c + 273.15;
    const r = c * 4/5;

    let text = `┌───〔 🌡️ *${toSmallCaps('konversi suhu')}* 〕\n`;
    text += `│ ${glyphs.arrow} *Celsius:* ${c.toFixed(2)} °C\n`;
    text += `│ ${glyphs.arrow} *Fahrenheit:* ${f.toFixed(2)} °F\n`;
    text += `│ ${glyphs.arrow} *Kelvin:* ${k.toFixed(2)} K\n`;
    text += `│ ${glyphs.arrow} *Reamur:* ${r.toFixed(2)} °R\n`;
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
