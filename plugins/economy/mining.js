import { toSmallCaps, glyphs } from '../../utils/font.js';
import { formatNumber, formatDuration } from '../../utils/format.js';

export default {
  name: 'mining',
  aliases: ['tambang', 'nambang'],
  category: 'economy',
  description: 'Menambang mineral, emas, dan berlian di gua virtual',
  async run({ m, user, db }) {
    if (!user.economy) user.economy = { balance: 1000, bank: 0, diamonds: 0, gold: 0, fish: 0, ores: 0 };

    const COOLDOWN = 10 * 60 * 1000; // 10 menit
    const now = Date.now();
    const lastMine = user.lastMine || 0;

    if (now - lastMine < COOLDOWN) {
      const wait = formatDuration(COOLDOWN - (now - lastMine));
      return m.reply(`⏳ Kamu masih kelelahan menambang.\nIstirahat dulu selama *${wait}*.`);
    }

    const ores = Math.floor(Math.random() * 15) + 5;
    const gold = Math.random() > 0.4 ? Math.floor(Math.random() * 5) + 1 : 0;
    const diamond = Math.random() > 0.8 ? 1 : 0;
    const expGain = 35;

    user.economy.ores = (user.economy.ores || 0) + ores;
    user.economy.gold = (user.economy.gold || 0) + gold;
    user.economy.diamonds = (user.economy.diamonds || 0) + diamond;
    user.exp = (user.exp || 0) + expGain;
    user.lastMine = now;
    db.save();

    let text = `┌───〔 ⛏️ *${toSmallCaps('hasil penambangan')}* 〕\n`;
    text += `│ ${glyphs.arrow} 🪨 *Batu Mineral:* +${ores}\n`;
    if (gold > 0) text += `│ ${glyphs.arrow} 🪙 *Emas Murni:* +${gold} Gram\n`;
    if (diamond > 0) text += `│ ${glyphs.arrow} 💎 *Berlian:* +${diamond} Biji (Langka!)\n`;
    text += `│ ${glyphs.arrow} ⚡ *EXP:* +${expGain} EXP\n`;
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
