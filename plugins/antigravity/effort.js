import { toSmallCaps, glyphs } from '../../utils/font.js';
import antigravity from '../../lib/antigravity.js';

export default {
  name: 'agyeffort',
  aliases: ['agyset', 'effort', 'seteffort', 'agyreasoning'],
  category: 'ai',
  description: 'Mengatur tingkat penalaran berpikir (Reasoning Effort) AI Antigravity: low | medium | high',
  async run({ m, q, usedPrefix, command }) {
    const session = antigravity.getSession(m.sender);

    if (!q || !['low', 'medium', 'high'].includes(q.toLowerCase().trim())) {
      const current = session.effort || 'medium';
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('reasoning effort ai')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('tingkat saat ini')}:* \`${current.toUpperCase()}\`\n` +
        `├────────────────────\n` +
        `│ *${toSmallCaps('pilihan tingkat penalaran')}:*\n` +
        `│ 1. \`${usedPrefix + command} low\` - ${toSmallCaps('cepat & hemat token (tugas ringan)')}\n` +
        `│ 2. \`${usedPrefix + command} medium\` - ${toSmallCaps('seimbang, cerdas & optimal (standar)')}\n` +
        `│ 3. \`${usedPrefix + command} high\` - ${toSmallCaps('penalaran mendalam, coding kompleks & debugging')}\n` +
        `└────────────────────`
      );
    }

    const level = q.toLowerCase().trim();
    antigravity.setEffort(m.sender, level);

    await m.react('✦');

    const descMap = {
      low: toSmallCaps('penalaran cepat & hemat waktu'),
      medium: toSmallCaps('penalaran seimbang & optimal untuk tugas umum'),
      high: toSmallCaps('penalaran mendalam, arsitektur kode & pemecahan masalah rumit')
    };

    const caption = 
      `┌───〔 ${glyphs.check} *${toSmallCaps('reasoning effort diperbarui')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('tingkat baru')}:* \`${level.toUpperCase()}\`\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('keterangan')}:* ${descMap[level]}\n` +
      `└────────────────────\n` +
      `_› ${toSmallCaps('perubahan langsung berlaku untuk percakapan berikutnya!')}_`;

    await m.reply(caption);
  }
};
