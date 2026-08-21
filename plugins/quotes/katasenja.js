import { toSmallCaps } from '../../utils/font.js';

const SENJA = [
  'Senja selalu mengajarkan kita bahwa sesuatu yang indah tidak harus bertahan selamanya untuk dihargai.',
  'Secangkir kopi hangat dan jingganya langit senja adalah cara semesta menenangkan lelahnya hari.',
  'Senja mengajarkan bahwa kepergian bukanlah akhir yang menyedihkan, melainkan awal dari malam yang tenang.',
  'Jangan buru-buru berlari, nikmati jingga yang perlahan tenggelam bersama doa-doa baikmu.',
  'Ada rindu yang selalu terselip di antara aroma kopi dan redupnya sinar matahari senja.'
];

export default {
  name: 'katasenja',
  aliases: ['senja', 'kopi', 'puisisenja'],
  category: 'quotes',
  description: 'Kumpulan kata-kata puitis senja dan secangkir kopi',
  async run({ m }) {
    const pick = SENJA[Math.floor(Math.random() * SENJA.length)];
    let text = `┌───〔 🌇 *${toSmallCaps('kata puitis senja')}* 〕\n`;
    text += `│ "${pick}"\n`;
    text += `└────────────────────`;
    await m.reply(text.trim());
  }
};
