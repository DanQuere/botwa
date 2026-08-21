import { toSmallCaps, glyphs } from '../../utils/font.js';
import { formatNumber } from '../../utils/format.js';

export default {
  name: 'profile',
  aliases: ['me', 'profil', 'myprofile', 'dompet'],
  category: 'user',
  description: 'Menampilkan kartu profil dan status akun pengguna bot',
  async run({ sock, m, user, isOwner, isPremium }) {
    const targetJid = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender);
    const resolvedPn = global.store?.resolveLidToPn(targetJid) || targetJid;
    const targetNumber = resolvedPn.split('@')[0].replace(/[^0-9]/g, '');
    const isSelf = targetJid === m.sender;

    const statusLabel = isOwner ? '👑 Owner' : (isPremium ? '⭐ VIP Premium' : '🥉 Free User');
    const limitVal = (isOwner || isPremium) ? 'Tak Terbatas (∞)' : `${user.limit ?? 25}`;
    const expVal = `${formatNumber(user.exp || 0)} / ${formatNumber((user.level || 1) * 100)}`;
    const roleVal = user.role || 'Bronze 🥉';
    const hitVal = formatNumber(user.hit || 0);

    let text = `┌───〔 👤 *${toSmallCaps('profil pengguna')}* 〕\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('nama')}:* ${m.pushName || 'User'}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('nomor')}:* +${targetNumber}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('status')}:* ${statusLabel}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('role')}:* ${roleVal}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('level')}:* Level ${user.level || 1}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('exp')}:* ${expVal}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('sisa limit')}:* ${limitVal}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('total hit')}:* ${hitVal} command\n`;
    text += `└────────────────────`;

    // Coba ambil foto profil WhatsApp
    try {
      const ppUrl = await sock.profilePictureUrl(targetJid, 'image').catch(() => null);
      if (ppUrl) {
        return await sock.sendMessage(m.chat, {
          image: { url: ppUrl },
          caption: text.trim(),
          mentions: [targetJid]
        }, { quoted: m });
      }
    } catch (e) {}

    await m.reply(text.trim(), { mentions: [targetJid] });
  }
};
