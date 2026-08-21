import { toSmallCaps } from '../../utils/font.js';

const PANTUN = [
  {
    jenis: 'Pantun Jenaka',
    isi: 'Pohon randu buahnya lebat,\nBurung terbang melayang-layang.\nPerut lapar kepala pusing berat,\nLihat dompet uangnya melayang.'
  },
  {
    jenis: 'Pantun Nasehat',
    isi: 'Jalan-jalan ke pasar minggu,\nJangan lupa membeli pepaya.\nBelajarlah tekun jangan ragu,\nAgar masa depanmu berjaya.'
  },
  {
    jenis: 'Pantun Cinta',
    isi: 'Dari mana datangnya lintah,\nDari sawah turun ke kali.\nDari mana datangnya cinta,\nDari mata turun ke hati.'
  },
  {
    jenis: 'Pantun Jenaka',
    isi: 'Kucing belang makan ikan asin,\nSambil duduk di atas bangku.\nKupikir kamu orangnya rajin,\nEh ternyata tukang tidur melulu.'
  }
];

export default {
  name: 'pantun',
  aliases: ['pantunlucu', 'pantunnasehat'],
  category: 'quotes',
  description: 'Mengirimkan berbagai jenis pantun jenaka, nasehat, dan cinta',
  async run({ m }) {
    const pick = PANTUN[Math.floor(Math.random() * PANTUN.length)];
    let text = `┌───〔 🎭 *${toSmallCaps(pick.jenis)}* 〕\n\n`;
    text += `${pick.isi}\n\n`;
    text += `└────────────────────`;
    await m.reply(text.trim());
  }
};
