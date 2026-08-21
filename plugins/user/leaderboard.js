import { toSmallCaps, glyphs } from '../../utils/font.js';
import { formatNumber } from '../../utils/format.js';

export default {
  name: 'leaderboard',
  aliases: ['top', 'topuser', 'peringkat', 'lb'],
  category: 'user',
  description: 'Menampilkan peringkat Top Pengguna teratas berdasarkan Level dan EXP',
  async run({ m }) {
    const users = Object.entries(global.db?.data?.users || {}).map(([jid, data]) => ({
      jid,
      number: jid.split('@')[0],
      name: data.name || 'User',
      level: data.level || 1,
      exp: data.exp || 0,
      hit: data.hit || 0
    }));

    users.sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      return b.exp - a.exp;
    });

    const top10 = users.slice(0, 10);
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    let text = `┌───〔 🏆 *${toSmallCaps('top 10 pengguna teratas')}* 〕\n`;
    top10.forEach((u, i) => {
      text += `│ ${medals[i]} *${u.name.slice(0, 15)}* (@${u.number})\n`;
      text += `│    └ Level: ${u.level} | EXP: ${formatNumber(u.exp)} | Hit: ${formatNumber(u.hit)}\n`;
    });
    text += `└────────────────────`;

    const mentions = top10.map(u => u.jid);
    await m.reply(text.trim(), { mentions });
  }
};
