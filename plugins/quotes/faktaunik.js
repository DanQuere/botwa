import { toSmallCaps } from '../../utils/font.js';

const FAKTA = [
  'Jantung udang terletak di dalam kepalanya.',
  'Madu murni alami adalah satu-satunya makanan yang tidak akan pernah basi atau membusuk.',
  'Sidik lidah manusia memiliki pola unik yang berbeda-beda untuk setiap orang di dunia, seperti halnya sidik jari.',
  'Secara biologis, pisang sebenarnya tergolong sebagai buah buni (berry), sedangkan stroberi bukan.',
  'Otak manusia menghasilkan daya listrik sekitar 12-25 watt saat terjaga, cukup untuk menyalakan lampu bohlam LED kecil.',
  'Burung kolibri adalah satu-satunya burung di dunia yang dapat terbang mundur dan melayang di udara.',
  'Gurita memiliki tiga buah jantung dan darahnya berwarna biru karena mengandung tembaga (hemosianin).'
];

export default {
  name: 'faktaunik',
  aliases: ['fakta', 'tahukahkamu'],
  category: 'quotes',
  description: 'Menampilkan fakta-fakta sains dan dunia yang mencengangkan',
  async run({ m }) {
    const pick = FAKTA[Math.floor(Math.random() * FAKTA.length)];
    let text = `┌───〔 💡 *${toSmallCaps('tahukah kamu?')}* 〕\n`;
    text += `│ "${pick}"\n`;
    text += `└────────────────────`;
    await m.reply(text.trim());
  }
};
