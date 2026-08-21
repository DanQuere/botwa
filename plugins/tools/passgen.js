import crypto from 'crypto';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'passgen',
  aliases: ['generatepassword', 'genpass', 'randompass'],
  category: 'tools',
  description: 'Membuat password acak yang kuat, aman, dan sulit ditebak',
  async run({ m, q, usedPrefix }) {
    const length = Math.min(32, Math.max(8, parseInt(q, 10) || 16));
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~|}{[]:;?><,./-=';
    let password = '';
    const bytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
      password += chars[bytes[i] % chars.length];
    }

    let text = `┌───〔 🔐 *${toSmallCaps('password acak aman')}* 〕\n`;
    text += `│ ${glyphs.arrow} *Panjang:* ${length} Karakter\n`;
    text += `│ ${glyphs.arrow} *Password:* \`${password}\`\n`;
    text += `└────────────────────\n\n`;
    text += `_› Password dibuat secara acak kriptografis (CSPRNG)._`;

    await m.reply(text.trim());
  }
};
