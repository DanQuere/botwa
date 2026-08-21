import axios from 'axios';
import { createImageSticker } from '../../lib/sticker.js';
import config from '../../config/config.js';

export default {
  name: 'emojimix',
  aliases: ['emix', 'mixemoji', 'mix'],
  category: 'sticker',
  description: 'Menggabungkan 2 emoji menjadi satu stiker unik (Google Emoji Kitchen)',
  async run({ sock, m, q }) {
    if (!q) {
      return m.reply(
        `┌───〔 🤖 *EMOJI MIXER* 〕\n` +
        `│ › Gabungkan dua emoji menjadi stiker:\n` +
        `│ › Contoh: \`.emojimix 🤖 + 🔥\`\n` +
        `│ › Atau: \`.emojimix 🐱 🚀\`\n` +
        `└────────────────────────`
      );
    }

    const emojis = Array.from(q.match(/\p{Extended_Pictographic}/gu) || []);
    if (emojis.length < 2) {
      return m.reply('✕ Masukkan minimal 2 emoji yang valid. Contoh: `.emojimix 🤖 🔥`');
    }

    const e1 = emojis[0];
    const e2 = emojis[1];

    await m.react('⏳');

    try {
      const url = `https://emojik.vercel.app/s/${encodeURIComponent(e1)}_${encodeURIComponent(e2)}?size=512`;
      const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
      const imgBuffer = Buffer.from(res.data);

      const stickerBuffer = await createImageSticker(imgBuffer, {
        packname: `Emoji Mix: ${e1} + ${e2}`,
        author: config.sticker?.author || 'Antigravity Bot',
        type: 'contain'
      });

      await sock.sendMessage(m.chat, {
        sticker: stickerBuffer
      }, { quoted: m });

      await m.react('✨');
    } catch (err) {
      await m.react('❌');
      await m.reply(`✕ Kombinasi emoji ${e1} + ${e2} tidak didukung atau server sibuk.`);
    }
  }
};
