import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'register',
  aliases: ['daftar', 'reg'],
  category: 'user',
  description: 'Mendaftarkan nama pengguna ke dalam database bot',
  async run({ m, q, user, db, usedPrefix }) {
    if (!q || !q.includes('.')) {
      return m.reply(`📝 *Pendaftaran User*\n\nFormat: \`${usedPrefix}daftar Nama.Umur\`\n*Contoh:* \`${usedPrefix}daftar Daniel.20\``);
    }

    const [name, age] = q.split('.').map(s => s.trim());
    if (!name || isNaN(parseInt(age, 10))) {
      return m.reply('✕ Format salah. Gunakan titik pemisah, contoh: `.daftar Daniel.20`');
    }

    user.name = name;
    user.age = parseInt(age, 10);
    user.registered = true;
    user.limit = (user.limit || 0) + 10; // Bonus pendaftaran
    user.exp = (user.exp || 0) + 50;
    db.save();

    let text = `┌───〔 🎉 *${toSmallCaps('pendaftaran sukses')}* 〕\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('nama')}:* ${name}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('umur')}:* ${age} tahun\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('bonus')}:* +10 Limit & +50 EXP\n`;
    text += `└────────────────────\n\n`;
    text += `_› Selamat datang di komunitas bot!_`;

    await m.reply(text.trim());
  }
};
