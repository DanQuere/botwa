import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'base64',
  aliases: ['b64', 'base64enc', 'base64dec'],
  category: 'tools',
  description: 'Encode dan decode teks ke format Base64',
  async run({ m, q, command, usedPrefix }) {
    const input = q || m.quoted?.text;
    if (!input) {
      return m.reply(`📦 *Base64 Converter*\n\nFormat: \`${usedPrefix}base64 [enc/dec] <teks>\`\n*Contoh:* \`${usedPrefix}base64 enc Halo Dunia\``);
    }

    const [mode, ...rest] = input.split(' ');
    const textToProcess = (mode === 'enc' || mode === 'dec' || mode === 'encode' || mode === 'decode') ? rest.join(' ') : input;
    const isDecode = mode === 'dec' || mode === 'decode' || command === 'base64dec';

    try {
      let result = '';
      if (isDecode) {
        result = Buffer.from(textToProcess.trim(), 'base64').toString('utf-8');
      } else {
        result = Buffer.from(textToProcess).toString('base64');
      }

      let text = `┌───〔 📦 *${toSmallCaps(isDecode ? 'base64 decode' : 'base64 encode')}* 〕\n`;
      text += `│ ${result}\n`;
      text += `└────────────────────`;

      await m.reply(text.trim());
    } catch (err) {
      await m.reply(`✕ Gagal memproses Base64: ${err.message}`);
    }
  }
};
