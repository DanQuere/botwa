import { toSmallCaps } from '../../utils/font.js';

export default {
  name: 'group',
  aliases: ['grup', 'gc', 'groupopen', 'groupclose'],
  category: 'group',
  description: 'Membuka atau menutup grup (hanya admin yang dapat mengirim pesan)',
  groupOnly: true,
  adminOnly: true,
  async run({ sock, m, q, command, isBotAdmin, usedPrefix }) {
    if (!isBotAdmin) return m.reply('◈ Bot harus menjadi Admin grup untuk menjalankan perintah ini.');

    let mode = q?.toLowerCase() || '';
    if (command === 'groupopen') mode = 'open';
    if (command === 'groupclose') mode = 'close';

    if (mode === 'open' || mode === 'buka') {
      await sock.groupSettingUpdate(m.chat, 'not_announcement');
      await m.reply(`🔓 *${toSmallCaps('grup telah dibuka')}*\nSeluruh peserta sekarang dapat mengirim pesan.`);
    } else if (mode === 'close' || mode === 'tutup') {
      await sock.groupSettingUpdate(m.chat, 'announcement');
      await m.reply(`🔒 *${toSmallCaps('grup telah ditutup')}*\nHanya admin grup yang dapat mengirim pesan.`);
    } else {
      await m.reply(`⚙️ *Pengaturan Grup*\n\n• \`${usedPrefix}group open\` (Buka grup)\n• \`${usedPrefix}group close\` (Tutup grup)`);
    }
  }
};
