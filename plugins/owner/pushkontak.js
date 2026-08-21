import { toSmallCaps, glyphs } from '../../utils/font.js';
import { delay } from '../../utils/format.js';

export default {
  name: 'pushkontak',
  aliases: ['pushcontact', 'savekontak'],
  category: 'owner',
  description: 'Mengirimkan pesan perkenalan sekaligus menyimpan kontak member grup secara bertahap',
  ownerOnly: true,
  groupOnly: true,
  async run({ sock, m, q, participants, usedPrefix }) {
    if (!q) {
      return m.reply(`📢 *Push Kontak Grup*\n\nFormat: \`${usedPrefix}pushkontak <pesan perkenalan>\`\n*Contoh:* \`${usedPrefix}pushkontak Halo, save nomor saya ya!\``);
    }

    const members = participants.filter(p => p.id && !p.id.includes(sock.user?.id?.split(':')[0]));

    await m.reply(`⏳ Memulai push kontak ke *${members.length} anggota grup* dengan jeda aman 3 detik per pesan...`);

    let sent = 0;
    for (const p of members) {
      try {
        const jid = p.id.split(':')[0] + '@s.whatsapp.net';
        await sock.sendMessage(jid, { text: q.trim() });
        sent++;
        await delay(3000); // 3 detik delay agar aman anti-banned
      } catch (e) {}
    }

    let text = `┌───〔 ✅ *${toSmallCaps('push kontak selesai')}* 〕\n`;
    text += `│ ${glyphs.arrow} *Terkirim:* ${sent} / ${members.length} Member\n`;
    text += `└────────────────────`;

    await m.reply(text.trim());
  }
};
