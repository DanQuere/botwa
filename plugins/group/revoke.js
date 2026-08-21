import { toSmallCaps } from '../../utils/font.js';

export default {
  name: 'revoke',
  aliases: ['resetlink', 'tariklink'],
  category: 'group',
  description: 'Mereset dan membuat tautan link grup baru',
  groupOnly: true,
  adminOnly: true,
  async run({ sock, m, isBotAdmin }) {
    if (!isBotAdmin) return m.reply('◈ Bot harus menjadi Admin grup untuk menjalankan perintah ini.');

    try {
      const newCode = await sock.groupRevokeInvite(m.chat);
      await m.reply(`✓ *${toSmallCaps('link undangan grup berhasil direset')}*\n\nLink Baru: https://chat.whatsapp.com/${newCode}`);
    } catch (err) {
      await m.reply(`✕ Gagal mereset link grup: ${err.message}`);
    }
  }
};
