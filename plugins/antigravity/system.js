import { toSmallCaps, glyphs } from '../../utils/font.js';
import antigravity from '../../lib/antigravity.js';

export default {
  name: 'agysystem',
  aliases: ['system', 'prompt', 'agyprompt'],
  category: 'ai',
  description: 'Mengatur persona atau developer system instruction khusus untuk Antigravity',
  async run({ m, q, usedPrefix, command }) {
    if (!q) {
      const session = antigravity.getSession(m.sender);
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('system instruction')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('saat ini')}:*\n` +
        `│ _${session.systemInstruction || toSmallCaps('standar')}_\n` +
        `├────────────────────\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('format ubah')}:* \`${usedPrefix + command} <instruksi_anda>\`\n` +
        `└────────────────────`
      );
    }

    await m.react('✦');

    antigravity.setSystem(m.sender, q);

    const caption = 
      `┌───〔 ${glyphs.check} *${toSmallCaps('system instruction diperbarui')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('instruksi baru')}:*\n` +
      `│ _${q}_\n` +
      `└────────────────────`;

    await m.reply(caption);
  }
};
