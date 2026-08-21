import interactive from '../../lib/interactive.js';
import config from '../../config/config.js';
import { toSmallCaps } from '../../utils/font.js';

export default {
  name: 'listmsg',
  aliases: ['menulist', 'listmenu', 'teslist'],
  category: 'button',
  description: 'Pengujian pesan List Dropdown Menu interaktif WhatsApp',
  async run({ sock, m, usedPrefix }) {
    await m.react('📋');

    await sock.sendList(m.chat, {
      title: `📋 *${toSmallCaps('daftar menu interaktif')}*`,
      text: 
        `Halo *${m.pushName || 'User'}*!\n\n` +
        `Silakan tekan tombol di bawah ini untuk melihat daftar pilihan menu dan kategori bot yang tersedia secara terstruktur.`,
      footer: `© 2026 ${config.botName} • Native Flow Lists`,
      buttonText: '📂 Buka Menu Pilihan',
      sections: [
        {
          title: '🔥 KATEGORI UTAMA (MAIN)',
          highlight_label: 'RECOMMENDED',
          rows: [
            {
              header: 'Status & Ping',
              title: '⚡ Cek Ping Bot',
              description: 'Melihat kecepatan respon server & Baileys socket',
              id: `${usedPrefix}ping`
            },
            {
              header: 'Informasi Akun',
              title: '👤 Profil Pengguna',
              description: 'Melihat sisa limit, role level, dan status VIP',
              id: `${usedPrefix}profile`
            }
          ]
        },
        {
          title: '🤖 KECERDASAN BUATAN (AI)',
          highlight_label: 'SMART',
          rows: [
            {
              header: 'Gemini 3.7 Flash',
              title: '🧠 Antigravity Chat',
              description: 'AI chat interaktif dengan kemampuan coding & reasoning',
              id: `${usedPrefix}agy Halo Antigravity!`
            }
          ]
        },
        {
          title: '🎨 STICKER & MEDIA CREATOR',
          highlight_label: 'CREATIVE',
          rows: [
            {
              header: 'Image & Video to Sticker',
              title: '✨ Buat Stiker Baru',
              description: 'Mengubah media menjadi stiker WhatsApp berkualitas',
              id: `${usedPrefix}s`
            }
          ]
        }
      ]
    }, m);
  }
};
