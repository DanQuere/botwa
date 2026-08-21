import { toSmallCaps, glyphs } from '../../utils/font.js';
import { formatNumber, formatDuration } from '../../utils/format.js';

const JOBS = [
  { job: 'Kurir Paket Kilat', pay: 15000 },
  { job: 'Kasir Supermarket', pay: 20000 },
  { job: 'Driver Ojek Online', pay: 25000 },
  { job: 'Programmer Freelance', pay: 40000 },
  { job: 'Barista Kedai Kopi', pay: 18000 },
  { job: 'Content Creator', pay: 30000 }
];

export default {
  name: 'work',
  aliases: ['kerja', 'bekerja'],
  category: 'economy',
  description: 'Bekerja sampingan untuk mendapatkan uang virtual',
  async run({ m, user, db }) {
    if (!user.economy) user.economy = { balance: 1000, bank: 0, diamonds: 0, gold: 0, fish: 0, ores: 0 };

    const COOLDOWN = 15 * 60 * 1000; // 15 menit
    const now = Date.now();
    const lastWork = user.lastWork || 0;

    if (now - lastWork < COOLDOWN) {
      const wait = formatDuration(COOLDOWN - (now - lastWork));
      return m.reply(`⏳ Kamu baru saja selesai bekerja. Tunggu *${wait}* untuk shift kerja berikutnya.`);
    }

    const job = JOBS[Math.floor(Math.random() * JOBS.length)];
    const bonus = Math.floor(Math.random() * 5000);
    const totalGaji = job.pay + bonus;

    user.economy.balance = (user.economy.balance || 0) + totalGaji;
    user.exp = (user.exp || 0) + 30;
    user.lastWork = now;
    db.save();

    let text = `┌───〔 💼 *${toSmallCaps('gaji kerja harian')}* 〕\n`;
    text += `│ ${glyphs.arrow} *Pekerjaan:* ${job.job}\n`;
    text += `│ ${glyphs.arrow} *Gaji Diterima:* Rp ${formatNumber(totalGaji)}\n`;
    text += `│ ${glyphs.arrow} *Total Uang Tunai:* Rp ${formatNumber(user.economy.balance)}\n`;
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
