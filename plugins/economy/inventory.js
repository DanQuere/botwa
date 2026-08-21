import { toSmallCaps, glyphs } from '../../utils/font.js';
import { formatNumber } from '../../utils/format.js';

export default {
  name: 'inventory',
  aliases: ['inv', 'tas', 'dompetku'],
  category: 'economy',
  description: 'Melihat saldo koin, tabungan bank, dan isi tas inventaris',
  async run({ m, user }) {
    if (!user.economy) {
      user.economy = {
        balance: 1000,
        bank: 0,
        diamonds: 0,
        gold: 0,
        fish: 0,
        ores: 0
      };
    }

    const eco = user.economy;

    let text = `┌───〔 🎒 *${toSmallCaps('tas & inventaris')}* 〕\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('pemilik')}:* ${m.pushName || 'Player'}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('uang tunai')}:* 💵 Rp ${formatNumber(eco.balance || 0)}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('saldo bank')}:* 🏦 Rp ${formatNumber(eco.bank || 0)}\n`;
    text += `│\n`;
    text += `│ *Barang Tambang & Tangkapan:*\n`;
    text += `│ 💎 *Berlian:* ${formatNumber(eco.diamonds || 0)} biji\n`;
    text += `│ 🪙 *Emas murni:* ${formatNumber(eco.gold || 0)} gram\n`;
    text += `│ 🪨 *Batu mineral:* ${formatNumber(eco.ores || 0)} biji\n`;
    text += `│ 🐟 *Ikan segar:* ${formatNumber(eco.fish || 0)} ekor\n`;
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
