import interactive from '../../lib/interactive.js';
import config from '../../config/config.js';
import { toSmallCaps } from '../../utils/font.js';

export default {
  name: 'carousel',
  aliases: ['carosel', 'slide', 'kartu', 'tescarousel'],
  category: 'button',
  description: 'Pengujian pesan carousel geser (cards) interaktif WhatsApp',
  async run({ sock, m, usedPrefix }) {
    await m.react('🎠');

    const imgAi = 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80';
    const imgSticker = 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&auto=format&fit=crop&q=80';
    const imgTools = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80';

    await sock.sendCarousel(m.chat, {
      body: 
        `🚀 *${toSmallCaps('whatsapp interactive carousel')}*\n\n` +
        `Pengujian tampilan *Carousel Card Interaktif*.\n` +
        `Geser kartu ke samping (swipe) untuk menjelajahi menu dan klik tombol aksi pada masing-masing kartu!`,
      footer: `© 2026 ${config.botName} • Geser ke samping ➡️`,
      cards: [
        {
          title: '🤖 Antigravity AI Suite',
          body: 'Asisten AI tercanggih dengan dukungan Gemini 3.7 Flash High Reasoning.',
          footer: 'Tier: Standard & Pro AI',
          media: { image: imgAi },
          buttons: [
            {
              name: 'quick_reply',
              params: {
                display_text: '💬 Mulai Chat AI',
                id: `${usedPrefix}agy Halo Antigravity!`
              }
            }
          ]
        },
        {
          title: '🎨 Sticker Studio Pro',
          body: 'Konversi stiker static, animated video/GIF, stiker bulat, dan meme teks.',
          footer: 'Sharp + FFmpeg High Speed',
          media: { image: imgSticker },
          buttons: [
            {
              name: 'quick_reply',
              params: {
                display_text: '✨ Buat Stiker (.s)',
                id: `${usedPrefix}s`
              }
            }
          ]
        },
        {
          title: '🛠️ Developer Tools',
          body: 'Peralatan inspeksi pesan WhatsApp, QR generator, dan translator.',
          footer: 'Modular ES Modules',
          media: { image: imgTools },
          buttons: [
            {
              name: 'quick_reply',
              params: {
                display_text: '⚡ Ping Kecepatan',
                id: `${usedPrefix}ping`
              }
            }
          ]
        }
      ]
    }, m);
  }
};
