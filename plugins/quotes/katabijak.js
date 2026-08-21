import { toSmallCaps } from '../../utils/font.js';

const BIJAK = [
  { quote: 'Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia.', author: 'Nelson Mandela' },
  { quote: 'Hidup yang tidak pernah dipertaruhkan tidak akan pernah dimenangkan.', author: 'Sutan Sjahrir' },
  { quote: 'Kebahagiaan terbesar dalam hidup adalah keyakinan bahwa kita dicintai apa adanya.', author: 'Victor Hugo' },
  { quote: 'Orang yang tidak pernah membuat kesalahan adalah orang yang tidak pernah mencoba sesuatu yang baru.', author: 'Albert Einstein' },
  { quote: 'Kekuatan tidak datang dari kemampuan fisik, tetapi dari kemauan yang gigih.', author: 'Mahatma Gandhi' },
  { quote: 'Bermimpilah setinggi langit. Jika engkau jatuh, engkau akan jatuh di antara bintang-bintang.', author: 'Ir. Soekarno' }
];

export default {
  name: 'katabijak',
  aliases: ['bijak', 'quotesbijak'],
  category: 'quotes',
  description: 'Menampilkan kata-kata bijak penuh makna dari para tokoh dunia',
  async run({ m }) {
    const pick = BIJAK[Math.floor(Math.random() * BIJAK.length)];
    let text = `┌───〔 📜 *${toSmallCaps('kata bijak tokoh')}* 〕\n`;
    text += `│ "${pick.quote}"\n`;
    text += `│\n`;
    text += `│ 👤 — *${pick.author}*\n`;
    text += `└────────────────────`;
    await m.reply(text.trim());
  }
};
