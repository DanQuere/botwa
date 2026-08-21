import db from '../../database/index.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'agymode',
  aliases: ['antigravitymode', 'setagymode'],
  category: 'owner',
  description: 'Mengatur mode akses Antigravity (Public Assistant Mode vs Owner Only)',
  ownerOnly: true,
  async run({ m, q, usedPrefix, command }) {
    if (!q || (!q.includes('public') && !q.includes('owner') && !q.includes('on') && !q.includes('off'))) {
      const current = db.data.settings.antigravityPublic ? toSmallCaps('public (mode asisten aktif)') : toSmallCaps('owner only (eksklusif owner)');
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('mode akses antigravity')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('status saat ini')}:* ${current}\n` +
        `├────────────────────\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} public\` - ${toSmallCaps('buka untuk publik (mode asisten)')}\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} owner\` - ${toSmallCaps('kunci hanya untuk owner')}\n` +
        `└────────────────────`
      );
    }

    const isPublic = q.toLowerCase().includes('public') || q.toLowerCase().includes('on');
    db.data.settings.antigravityPublic = isPublic;
    db.save();

    await m.react('✦');

    const statusStr = isPublic 
      ? toSmallCaps('publik diizinkan (mode asisten ramah & konsumsi limit)')
      : toSmallCaps('eksklusif hanya untuk owner bot');

    const caption = 
      `┌───〔 ${glyphs.check} *${toSmallCaps('pengaturan antigravity')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('mode baru')}:* ${statusStr}\n` +
      `└────────────────────`;

    await m.reply(caption);
  }
};
