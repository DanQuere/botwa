import { toSmallCaps } from '../../utils/font.js';

const MOTIVATION = [
  'Jangan menunggu kesempatan datang, ciptakanlah kesempatan itu dengan usaha dan doa.',
  'Kegagalan bukanlah akhir dari segalanya, melainkan awal dari keberhasilan yang tertunda.',
  'Masa depan adalah milik mereka yang percaya pada keindahan mimpi-mimpi mereka.',
  'Disiplin adalah jembatan antara tujuan dan pencapaian nyata.',
  'Lakukan apa yang bisa kamu lakukan dengan apa yang kamu miliki, di manapun kamu berada.',
  'Satu-satunya batasan untuk meraih mimpi kita adalah keragu-raguan kita hari ini.',
  'Jangan bandingkan prosesmu dengan orang lain. Bunga tidak mekar bersamaan, namun semuanya tetap indah.',
  'Rasa lelahmu hari ini adalah investasi masa depanmu yang cerah.'
];

export default {
  name: 'motivasi',
  aliases: ['motivasihidup', 'quotesmotivasi', 'semangat'],
  category: 'quotes',
  description: 'Mengirimkan kata-kata motivasi hidup dan penyemangat hari',
  async run({ m }) {
    const pick = MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)];
    let text = `┌───〔 💡 *${toSmallCaps('kata motivasi')}* 〕\n`;
    text += `│ "${pick}"\n`;
    text += `└────────────────────`;
    await m.reply(text.trim());
  }
};
