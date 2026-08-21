import db from '../../database/index.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'agychat',
  aliases: ['autoai', 'aichat', 'antigravitychatmode'],
  category: 'ai',
  description: 'Mengatur mode Auto-Chat AI (Bisa ngobrol langsung di DM tanpa perlu ketik .agy / tanpa command)',
  async run({ m, q, usedPrefix, command, isOwner }) {
    if (!q || (!q.includes('on') && !q.includes('off') && !q.includes('enable') && !q.includes('disable'))) {
      const current = (db.data.settings.autoAiChat ?? true) ? toSmallCaps('aktif (on)') : toSmallCaps('nonaktif (off)');
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('auto-chat ai mode')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('status saat ini')}:* ${current}\n` +
        `├────────────────────\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} on\` - ${toSmallCaps('aktifkan (chat langsung tanpa .agy)')}\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} off\` - ${toSmallCaps('matikan (harus pakai awalan .agy)')}\n` +
        `└────────────────────\n` +
        `_› ${toSmallCaps('saat aktif, kamu cukup kirim pesan atau gambar biasa di dm untuk ngobrol dengan ai!')}_`
      );
    }

    if (!isOwner) {
      return m.reply(
        `┌───〔 ✕ *${toSmallCaps('akses ditolak')}* 〕\n` +
        `│ ${glyphs.arrow} _${toSmallCaps('hanya owner bot yang dapat mengubah pengaturan auto-chat ai.')}_\n` +
        `└────────────────────`
      );
    }

    const state = q.toLowerCase().includes('on') || q.toLowerCase().includes('enable');
    db.data.settings.autoAiChat = state;
    db.save();

    await m.react('✦');

    const statusStr = state 
      ? toSmallCaps('diaktifkan (bisa chat langsung tanpa prefix di dm & mention di grup)')
      : toSmallCaps('dinonaktifkan (harus menggunakan .agy)');

    const caption = 
      `┌───〔 ${glyphs.check} *${toSmallCaps('pengaturan auto-chat ai')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('mode baru')}:* ${statusStr}\n` +
      `└────────────────────`;

    await m.reply(caption);
  }
};
