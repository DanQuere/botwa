import { toSmallCaps, glyphs } from '../../utils/font.js';

const DOA_LIST = [
  {
    judul: 'Doa Sebelum Makan',
    arab: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
    latin: 'Allahumma baarik lanaa fiimaa razaqtanaa wa qinaa \'adzaaban-naar.',
    arti: 'Ya Allah, berkahilah kami dalam rezeki yang telah Engkau berikan kepada kami dan peliharalah kami dari siksa api neraka.'
  },
  {
    judul: 'Doa Sesudah Makan',
    arab: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    latin: 'Alhamdulillaahil-ladzii ath\'amanaa wa saqaanaa wa ja\'alanaa muslimiin.',
    arti: 'Segala puji bagi Allah yang telah memberi makan dan minum kepada kami serta menjadikan kami termasuk orang-orang yang berserah diri.'
  },
  {
    judul: 'Doa Sebelum Tidur',
    arab: 'بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ',
    latin: 'Bismikallaahumma ahyaa wa amuut.',
    arti: 'Dengan nama-Mu ya Allah, aku hidup dan aku mati.'
  },
  {
    judul: 'Doa Bangun Tidur',
    arab: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    latin: 'Alhamdulillaahil-ladzii ahyaanaa ba\'da maa amaatanaa wa ilaihin-nusyuur.',
    arti: 'Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami dan kepada-Nya lah kami dibangkitkan.'
  },
  {
    judul: 'Doa Kedua Orang Tua',
    arab: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    latin: 'Rabbighfir lii wa liwaalidayya warhamhumaa kamaa rabbayaanii shaghiiraa.',
    arti: 'Wahai Tuhanku, ampunilah aku dan kedua orang tuaku, dan sayangilah mereka berdua sebagaimana mereka telah mendidikku di waktu kecil.'
  }
];

export default {
  name: 'doaharian',
  aliases: ['doa', 'kumpurandoa'],
  category: 'islamic',
  description: 'Menampilkan kumpulan doa-doa harian mustajab lengkap teks Arab dan artinya',
  async run({ m, q, usedPrefix }) {
    let text = `┌───〔 🕌 *${toSmallCaps('kumpulan doa harian')}* 〕\n\n`;

    for (const d of DOA_LIST) {
      text += `*• ${d.judul}*\n`;
      text += `${d.arab}\n`;
      text += `_Latin: ${d.latin}_\n`;
      text += `_Arti: "${d.arti}"_\n\n`;
    }
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
