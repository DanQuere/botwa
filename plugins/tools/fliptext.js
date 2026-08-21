import { toSmallCaps, glyphs } from '../../utils/font.js';

const FLIP_MAP = {
  'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ',
  'i': 'ᴉ', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd',
  'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x',
  'y': 'ʎ', 'z': 'z', 'A': '∀', 'B': '𐐒', 'C': 'Ɔ', 'D': 'p', 'E': 'Ǝ', 'F': 'Ⅎ',
  'G': '⅁', 'H': 'H', 'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N',
  'O': 'O', 'P': 'Ԁ', 'Q': 'Q', 'R': 'ɹ', 'S': 'S', 'T': '┴', 'U': '∩', 'V': 'Λ',
  'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ',
  '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6', '0': '0', '.': '˙', ',': '\'',
  '?': '¿', '!': '¡', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{',
  '<': '>', '>': '<', '_': '‾'
};

export default {
  name: 'fliptext',
  aliases: ['kebalik', 'upsidedown'],
  category: 'tools',
  description: 'Membalikkan teks secara horizontal dan vertikal',
  async run({ m, q, usedPrefix }) {
    const input = q || m.quoted?.text;
    if (!input) {
      return m.reply(`🙃 Masukkan teks yang ingin dibalik.\n*Contoh:* \`${usedPrefix}fliptext Antigravity Bot\``);
    }

    const flipped = input.split('').reverse().map(c => FLIP_MAP[c] || c).join('');

    let text = `┌───〔 🙃 *${toSmallCaps('tulisan terbalik')}* 〕\n`;
    text += `│ ${flipped}\n`;
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
