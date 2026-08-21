import { toSmallCaps, glyphs } from '../../utils/font.js';
import { formatNumber } from '../../utils/format.js';

export default {
  name: 'slot',
  aliases: ['jackpot', 'judi'],
  category: 'economy',
  description: 'Mesin slot jackpot kasino offline seru',
  async run({ m, q, user, db, usedPrefix }) {
    if (!user.economy) user.economy = { balance: 1000, bank: 0, diamonds: 0, gold: 0, fish: 0, ores: 0 };

    const bet = parseInt(q, 10) || 5000;
    if (bet <= 0) return m.reply(`🎰 Masukkan jumlah taruhan koin!\n*Contoh:* \`${usedPrefix}slot 5000\``);

    if ((user.economy.balance || 0) < bet) {
      return m.reply(`✕ Saldo uang tunai kamu tidak mencukupi (Rp ${formatNumber(user.economy.balance || 0)}). Ketik \`${usedPrefix}work\` untuk mencari uang.`);
    }

    const emojis = ['🍒', '🍋', '🍇', '🍉', '⭐', '💎', '7️⃣'];
    const r1 = emojis[Math.floor(Math.random() * emojis.length)];
    const r2 = emojis[Math.floor(Math.random() * emojis.length)];
    const r3 = emojis[Math.floor(Math.random() * emojis.length)];

    let win = false;
    let multiplier = 0;

    if (r1 === r2 && r2 === r3) {
      win = true;
      multiplier = r1 === '7️⃣' ? 10 : (r1 === '💎' ? 7 : 4);
    } else if (r1 === r2 || r2 === r3 || r1 === r3) {
      win = true;
      multiplier = 1.5;
    }

    let resultMsg = '';
    if (win) {
      const reward = Math.floor(bet * multiplier);
      user.economy.balance += (reward - bet);
      resultMsg = `🎉 *JACKPOT MENANG!* (+Rp ${formatNumber(reward)})`;
    } else {
      user.economy.balance -= bet;
      resultMsg = `😢 *KALAH!* (-Rp ${formatNumber(bet)})`;
    }
    db.save();

    let text = `┌───〔 🎰 *${toSmallCaps('mesin slot kasino')}* 〕\n`;
    text += `│  [ ${r1} | ${r2} | ${r3} ]\n`;
    text += `│\n`;
    text += `│ ${glyphs.arrow} ${resultMsg}\n`;
    text += `│ ${glyphs.arrow} *Sisa Saldo:* Rp ${formatNumber(user.economy.balance)}\n`;
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
