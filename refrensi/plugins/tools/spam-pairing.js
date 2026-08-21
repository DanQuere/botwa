// Plugin: Spam Pairing WA
// Simulasi request pairing code ke nomor target
// Hanya untuk testing/edukasi di lingkungan sendiri

import axios from 'axios';

export default {
  name: 'spampairing',
  description: 'Spam pairing code ke nomor WA target',
  usage: '.spampairing <nomor> <jumlah>',
  async execute(m, { args, client }) {
    const target = args[0]?.replace(/[^0-9]/g, '');
    const count = parseInt(args[1]) || 5;

    if (!target) return m.reply('Nomor target mana? Jangan asal ketik, goblok.');

    const apiUrl = 'https://api.simulasispam.example.com/pairing'; // Ganti dengan API sendiri
    let sent = 0;

    m.reply(`Mulai spam pairing ke ${target} sebanyak ${count}x. Duduk manis, jangan panik.`);

    for (let i = 0; i < count; i++) {
      try {
        await axios.post(apiUrl, {
          phone: target,
          method: 'pairing_code',
          timestamp: Date.now()
        }, { timeout: 5000 });
        sent++;
        console.log(`[PAIRING] Request ${i + 1} terkirim`);
      } catch (e) {
        console.log(`[PAIRING] Gagal request ${i + 1}: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 1500)); // delay biar gak ketahuan
    }

    m.reply(`Selesai. ${sent}/${count} request pairing terkirim ke ${target}. Kalau nomornya aktif, HP dia bakal rame notif.`);
  }
};
