import { toSmallCaps } from '../../utils/font.js';

export default {
  name: 'setdesc',
  aliases: ['setdescription', 'deskripsi', 'setdescgc'],
  category: 'group',
  description: 'Mengubah deskripsi grup WhatsApp',
  groupOnly: true,
  adminOnly: true,
  async run({ sock, m, q, isBotAdmin, usedPrefix }) {
    if (!isBotAdmin) return m.reply('◈ Bot harus menjadi Admin grup untuk menjalankan perintah ini.');
    const desc = q || m.quoted?.text;
    if (!desc) return m.reply(`📝 Masukkan atau reply teks deskripsi grup baru.\n*Contoh:* \`${usedPrefix}setdesc Selamat datang di grup kami! Harap patuhi rules.\``);

    try {
      await sock.groupUpdateDescription(m.chat, desc.trim());
      await m.reply(`✓ *${toSmallCaps('deskripsi grup berhasil diperbarui')}*`);
    } catch (err) {
      await m.reply(`✕ Gagal memperbarui deskripsi: ${err.message}`);
    }
  }
};
