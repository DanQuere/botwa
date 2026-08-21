import { toSmallCaps } from '../../utils/font.js';

export default {
  name: 'setppbot',
  aliases: ['setbotpp', 'setprofilepic'],
  category: 'owner',
  description: 'Mengubah foto profil akun WhatsApp bot dari media gambar',
  ownerOnly: true,
  async run({ sock, m, usedPrefix }) {
    const qMsg = m.quoted ? m.quoted : m;
    const isImage = qMsg.type === 'imageMessage' || qMsg.msg?.mimetype?.startsWith('image/');

    if (!isImage) {
      return m.reply(`🖼️ Reply foto yang ingin dijadikan profil bot dengan \`${usedPrefix}setppbot\`.`);
    }

    await m.react('⏳');

    try {
      const buffer = await qMsg.download();
      const botJid = sock.user?.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : sock.user?.id;

      await sock.updateProfilePicture(botJid, buffer);
      await m.react('✅');
      await m.reply(`✓ *${toSmallCaps('foto profil bot berhasil diperbarui!')}*`);
    } catch (err) {
      await m.react('❌');
      await m.reply(`✕ Gagal mengubah foto profil: ${err.message}`);
    }
  }
};
