import { toSmallCaps, glyphs } from '../../utils/font.js';
import antigravity from '../../lib/antigravity.js';

export default {
  name: 'agyusage',
  aliases: ['usage', 'agyquota', 'tokens'],
  category: 'ai',
  description: 'Melihat statistik konsumsi token dan kuota Antigravity',
  async run({ m }) {
    await m.react('📊');

    const session = antigravity.getSession(m.sender);
    const usage = session.usage || {};

    const lastTime = usage.lastRequestTime
      ? new Date(usage.lastRequestTime).toLocaleString('id-ID')
      : toSmallCaps('belum ada permintaan');

    const caption = 
      `┌───〔 ${glyphs.diamond} *${toSmallCaps('antigravity token usage')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('model aktif')}:* \`${session.model}\`\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('total request')}:* ${usage.totalRequests || 0}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('prompt tokens')}:* ${usage.promptTokens || 0}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('output tokens')}:* ${usage.candidatesTokens || 0}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('total tokens')}:* ${usage.totalTokens || 0}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('terakhir aktif')}:* ${lastTime}\n` +
      `└────────────────────`;

    await m.reply(caption);
  }
};
