import { toSmallCaps, glyphs } from '../../utils/font.js';
import antigravity from '../../lib/antigravity.js';

export default {
  name: 'agystatus',
  aliases: ['statusagy', 'agyinfo', 'status', 'agystate'],
  category: 'ai',
  description: 'Melihat status otentikasi Google Antigravity, sesi OAuth, dan pemakaian token',
  async run({ m, usedPrefix }) {
    await m.react('ℹ️');

    const session = antigravity.getSession(m.sender);
    const hasToken = Boolean(session.isLoggedIn && (session.token || session.oauth));
    const authStatus = hasToken ? toSmallCaps('terotentikasi ✓') : toSmallCaps('belum login ✕');
    
    let authTypeLabel = toSmallCaps('tidak ada');
    if (session.authType === 'oauth' || session.oauth) {
      authTypeLabel = 'Google OAuth 2.0 (Official Antigravity)';
    } else if (session.authType === 'apikey') {
      authTypeLabel = 'Google AI Studio API Key';
    } else if (session.token) {
      authTypeLabel = 'Custom Token';
    }

    const maskedToken = session.token 
      ? session.token.slice(0, 8) + '...' + session.token.slice(-4) 
      : toSmallCaps('belum ada token');

    const memoryTurns = Math.floor(session.history.length / 2);

    const caption = 
      `┌───〔 ${glyphs.diamond} *${toSmallCaps('antigravity agent status')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('status')}:* ${authStatus}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('metode login')}:* ${authTypeLabel}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('token')}:* \`${maskedToken}\`\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('model saat ini')}:* \`${session.model}\`\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('effort level')}:* \`${session.effort || 'medium'}\`\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('memori konteks')}:* ${memoryTurns} ${toSmallCaps('percakapan')}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('total token')}:* ${session.usage.totalTokens}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('total request')}:* ${session.usage.totalRequests}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('system instruction')}:* ${toSmallCaps(session.systemInstruction ? 'kustom aktif' : 'standar')}\n` +
      `└────────────────────\n` +
      (hasToken 
        ? `_› ${toSmallCaps(`ketik ${usedPrefix}agylogout jika ingin keluar / ganti akun.`)}_`
        : `_› ${toSmallCaps(`ketik ${usedPrefix}login untuk mendapatkan link otorisasi Google OAuth.`)}_`);

    await m.reply(caption);
  }
};

