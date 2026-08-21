import { toSmallCaps, glyphs } from '../../utils/font.js';

const SHOLAT_LIST = [
  {
    nama: 'Subuh (2 Rakaat)',
    arab: 'أُصَلِّى فَرْضَ الصُّبْحِ رَكْعَتَيْنِ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
    latin: "Ushalli fardhash-shubhi rak'ataini mustaqbilal qiblati adaa-an lillaahi ta'aala.",
    arti: 'Aku niat sholat fardhu Subuh dua rakaat menghadap kiblat karena Allah Ta\'ala.'
  },
  {
    nama: 'Dzuhur (4 Rakaat)',
    arab: 'أُصَلِّى فَرْضَ الظُّهْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
    latin: "Ushalli fardhazh-zhuhri arba'a raka'aatin mustaqbilal qiblati adaa-an lillaahi ta'aala.",
    arti: 'Aku niat sholat fardhu Dzuhur empat rakaat menghadap kiblat karena Allah Ta\'ala.'
  },
  {
    nama: 'Ashar (4 Rakaat)',
    arab: 'أُصَلِّى فَرْضَ الْعَصْرِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
    latin: "Ushalli fardhal 'ashri arba'a raka'aatin mustaqbilal qiblati adaa-an lillaahi ta'aala.",
    arti: 'Aku niat sholat fardhu Ashar empat rakaat menghadap kiblat karena Allah Ta\'ala.'
  },
  {
    nama: 'Maghrib (3 Rakaat)',
    arab: 'أُصَلِّى فَرْضَ الْمَغْرِبِ ثَلاَثَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
    latin: "Ushalli fardhal maghribi tsalaatsa raka'aatin mustaqbilal qiblati adaa-an lillaahi ta'aala.",
    arti: 'Aku niat sholat fardhu Maghrib tiga rakaat menghadap kiblat karena Allah Ta\'ala.'
  },
  {
    nama: 'Isya (4 Rakaat)',
    arab: 'أُصَلِّى فَرْضَ الْعِشَاءِ أَرْبَعَ رَكَعَاتٍ مُسْتَقْبِلَ الْقِبْلَةِ أَدَاءً لِلَّهِ تَعَالَى',
    latin: "Ushalli fardhal 'isyaa-i arba'a raka'aatin mustaqbilal qiblati adaa-an lillaahi ta'aala.",
    arti: 'Aku niat sholat fardhu Isya empat rakaat menghadap kiblat karena Allah Ta\'ala.'
  }
];

export default {
  name: 'niatsholat',
  aliases: ['sholatfardhu', 'niatshalat'],
  category: 'islamic',
  description: 'Menampilkan niat 5 waktu sholat fardhu beserta tulisan Arab, Latin, dan Terjemahannya',
  async run({ m, q }) {
    let text = `┌───〔 🕌 *${toSmallCaps('niat 5 waktu sholat fardhu')}* 〕\n\n`;

    for (const s of SHOLAT_LIST) {
      text += `*• Sholat ${s.nama}*\n`;
      text += `${s.arab}\n`;
      text += `_Latin: ${s.latin}_\n`;
      text += `_Arti: "${s.arti}"_\n\n`;
    }
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
