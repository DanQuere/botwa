import { toSmallCaps, glyphs } from '../../utils/font.js';

const STYLES = [
  { name: 'Small Caps', fn: (t) => toSmallCaps(t) },
  { name: 'Monospace', fn: (t) => `\`\`\`${t}\`\`\`` },
  { name: 'Bold Sans', fn: (t) => t.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D5D4 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D5EE + code - 97);
    return c;
  }).join('') },
  { name: 'Italic Serif', fn: (t) => t.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D434 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D44E + code - 97);
    return c;
  }).join('') },
  { name: 'Bubble / Circle', fn: (t) => t.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x24B6 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x24D0 + code - 97);
    if (code >= 49 && code <= 57) return String.fromCodePoint(0x2460 + code - 49);
    return c;
  }).join('') },
  { name: 'Gothic / Fraktur', fn: (t) => t.split('').map(c => {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D504 + code - 65);
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D51E + code - 97);
    return c;
  }).join('') }
];

export default {
  name: 'fancytext',
  aliases: ['styletext', 'font', 'fontstyle'],
  category: 'tools',
  description: 'Mengubah gaya teks menjadi berbagai macam variasi font estetik',
  async run({ m, q, usedPrefix }) {
    const input = q || m.quoted?.text;
    if (!input) {
      return m.reply(`✨ *Fancy Text Generator*\n\nContoh: \`${usedPrefix}fancytext Antigravity Bot\``);
    }

    let text = `┌───〔 ✨ *${toSmallCaps('pilihan font estetik')}* 〕\n`;
    for (const style of STYLES) {
      text += `│ *${style.name}:*\n`;
      text += `│ ${style.fn(input)}\n│\n`;
    }
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
