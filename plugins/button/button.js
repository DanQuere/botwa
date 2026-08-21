import interactive from '../../lib/interactive.js';
import config from '../../config/config.js';
import { toSmallCaps } from '../../utils/font.js';

export default {
  name: 'button',
  aliases: ['btn', 'tombol', 'tesbutton', 'testbtn', 'botactivated'],
  category: 'button',
  description: 'Pengujian pesan tombol interaktif WhatsApp Native Flow persis seperti bot viral',
  async run({ sock, m, usedPrefix }) {
    await m.react('✨');

    const bodyText = 
      `➤ *Support PG ( Sewa & Upgrade Premium Otomatis )*\n` +
      `➤ *Aman, Ringan & No Error*\n` +
      `➤ *Mudah Digunakan Oleh Semua User*\n\n` +
      `───────✧ *Bot Activated* ✧───────\n\n` +
      `*Created :* ${config.botName || 'Bot AI WhatsApp'}`;

    const bannerUrl = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80';

    await sock.sendButton(m.chat, {
      body: bodyText,
      footer: `© 2026 ${config.botName} • Native Flow Suite`,
      buttons: [
        {
          name: 'single_select',
          params: {
            title: '📑 ListBot',
            sections: [
              {
                title: '⚡ DAFTAR PERINTAH BOT',
                highlight_label: 'HOT',
                rows: [
                  {
                    header: 'All Menu',
                    title: '📜 Buka Menu Utama',
                    description: 'Menampilkan seluruh daftar command',
                    id: `${usedPrefix}menu`
                  },
                  {
                    header: 'Latency Speed',
                    title: '⚡ Cek Ping Kecepatan',
                    description: 'Melihat status server & respon bot',
                    id: `${usedPrefix}ping`
                  },
                  {
                    header: 'Antigravity AI',
                    title: '🧠 Tanya AI Gemini 3.7',
                    description: 'Chat asisten kecerdasan buatan',
                    id: `${usedPrefix}agy Halo Antigravity!`
                  },
                  {
                    header: 'Sticker Studio',
                    title: '🎨 Buat Stiker Baru',
                    description: 'Convert gambar/video jadi stiker',
                    id: `${usedPrefix}s`
                  }
                ]
              }
            ]
          }
        },
        {
          name: 'single_select',
          params: {
            title: '📑 SewaBot',
            sections: [
              {
                title: '💎 DAFTAR PAKET SEWA & VIP',
                highlight_label: 'VIP',
                rows: [
                  {
                    header: 'Paket 1 Bulan',
                    title: '👑 VIP Premium 30 Hari',
                    description: 'Unlimited limit & akses seluruh fitur',
                    id: `${usedPrefix}owner Halo kak mau sewa bot 1 bulan`
                  },
                  {
                    header: 'Paket Permanen',
                    title: '🚀 VIP Premium Permanen',
                    description: 'Akses VIP seumur hidup',
                    id: `${usedPrefix}owner Halo kak mau sewa bot permanen`
                  }
                ]
              }
            ]
          }
        },
        {
          name: 'quick_reply',
          params: {
            display_text: '↩️ Contact Owner',
            id: `${usedPrefix}owner`
          }
        },
        {
          name: 'cta_url',
          params: {
            display_text: '🌐 Website Official',
            url: 'https://whatsapp.com'
          }
        },
        {
          name: 'cta_copy',
          params: {
            display_text: '📋 Salin Token Bot',
            copy_code: 'ANTIGRAVITY-2026-TOKEN'
          }
        }
      ]
    }, m);
  }
};
