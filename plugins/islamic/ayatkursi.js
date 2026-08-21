import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'ayatkursi',
  aliases: ['kursi', 'ayat-kursi'],
  category: 'islamic',
  description: 'Menampilkan teks Arab, Latin, Terjemahan, dan Keutamaan Ayat Kursi',
  async run({ m }) {
    let text = `┌───〔 🕌 *${toSmallCaps('ayat kursi (qs. al-baqarah: 255)')}* 〕\n\n`;
    text += `اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ\n\n`;
    text += `*Latin:*\n_Allahu laa ilaaha illaa huwal hayyul qayyuum, laa ta'khudzuhu sinatuw-walaa naum, lahu maa fis-samaawaati wa maa fil-ardh, man dzalladzii yasyfa'u 'indahuu illaa bi-idznih, ya'lamu maa baina aidiihim wa maa khalfahum, wa laa yuhiithuuna bisyai-im-min 'ilmihii illaa bimaa syaa-a, wasi'a kursiyyuhus-samaawaati wal-ardh, wa laa ya-uuduhuu hifzhuhumaa, wa huwal 'aliyyul 'azhiim._\n\n`;
    text += `*Artinya:*\n"Allah, tidak ada tuhan selain Dia. Yang Mahahidup, Yang terus-menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang ada di hadapan mereka dan apa yang ada di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun tentang ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya (ilmu dan kekuasaan-Nya) meliputi langit dan bumi. Dan Dia tidak merasa berat memelihara keduanya, dan Dia Mahatinggi, Mahabesar."\n\n`;
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
