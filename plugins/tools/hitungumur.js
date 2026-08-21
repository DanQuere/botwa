import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'hitungumur',
  aliases: ['usia', 'umur', 'cekumur'],
  category: 'tools',
  description: 'Menghitung usia detail dalam tahun, bulan, dan hari berdasarkan tanggal lahir',
  async run({ m, q, usedPrefix }) {
    if (!q || !q.includes('-')) {
      return m.reply(`🎂 *Kalkulator Usia*\n\nFormat: \`${usedPrefix}hitungumur YYYY-MM-DD\`\n*Contoh:* \`${usedPrefix}hitungumur 2004-08-15\``);
    }

    const birth = new Date(q.trim());
    if (isNaN(birth.getTime())) {
      return m.reply('✕ Format tanggal tidak valid. Gunakan format `YYYY-MM-DD` (Tahun-Bulan-Tanggal).');
    }

    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffDays = Math.floor((now - birth) / (1000 * 60 * 60 * 24));

    let text = `┌───〔 🎂 *${toSmallCaps('detail usia')}* 〕\n`;
    text += `│ ${glyphs.arrow} *Tanggal Lahir:* ${birth.toLocaleDateString('id-ID')}\n`;
    text += `│ ${glyphs.arrow} *Usia Saat Ini:* ${years} Tahun ${months} Bulan ${days} Hari\n`;
    text += `│ ${glyphs.arrow} *Total Hari Hidup:* ~${diffDays} Hari\n`;
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
