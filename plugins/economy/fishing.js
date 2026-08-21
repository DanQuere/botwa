import { toSmallCaps, glyphs } from '../../utils/font.js';
import { formatNumber, formatDuration } from '../../utils/format.js';

export default {
  name: 'fishing',
  aliases: ['mancing', 'fish'],
  category: 'economy',
  description: 'Memancing ikan segar di danau/laut virtual',
  async run({ m, user, db }) {
    if (!user.economy) user.economy = { balance: 1000, bank: 0, diamonds: 0, gold: 0, fish: 0, ores: 0 };

    const COOLDOWN = 5 * 60 * 1000; // 5 menit
    const now = Date.now();
    const lastFish = user.lastFish || 0;

    if (now - lastFish < COOLDOWN) {
      const wait = formatDuration(COOLDOWN - (now - lastFish));
      return m.reply(`⏳ Umpanmu habis, tunggu *${wait}* sebelum memancing lagi.`);
    }

    const fishTypes = ['Ikan Nila', 'Ikan Gurame', 'Ikan Lele', 'Ikan Tuna', 'Ikan Salmon'];
    const count = Math.floor(Math.random() * 6) + 2;
    const chosen = fishTypes[Math.floor(Math.random() * fishTypes.length)];
    const expGain = 20;

    user.economy.fish = (user.economy.fish || 0) + count;
    user.exp = (user.exp || 0) + expGain;
    user.lastFish = now;
    db.save();

    let text = `┌───〔 🎣 *${toSmallCaps('hasil memancing')}* 〕\n`;
    text += `│ ${glyphs.arrow} 🐟 *Tangkapan:* +${count} Ekor (${chosen})\n`;
    text += `│ ${glyphs.arrow} ⚡ *EXP:* +${expGain} EXP\n`;
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
