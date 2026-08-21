import config from '../../config/config.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'getidgc',
  aliases: ['idgc', 'getgc', 'infogc', 'copyidgc'],
  category: 'owner',
  description: 'Mengambil detail dan ID grup berdasarkan nomor urut dari .listgc atau nama grup',
  ownerOnly: true,
  async run({ sock, m, args, q, usedPrefix }) {
    await m.react('⏳');

    try {
      const allChats = await sock.groupFetchAllParticipating();
      const groups = Object.values(allChats);

      if (groups.length === 0) {
        return m.reply('✕ Bot belum bergabung di grup manapun.');
      }

      // Urutkan sama persis seperti .listgc
      groups.sort((a, b) => (b.participants?.length || 0) - (a.participants?.length || 0));

      let targetGroup = null;

      if (!q && m.isGroup) {
        // Jika tanpa argumen dan di dalam grup, ambil grup saat ini
        targetGroup = groups.find(g => g.id === m.chat) || { id: m.chat };
      } else if (!q) {
        return m.reply(
          `┌───〔 ℹ️ *CARA PENGGUNAAN GETIDGC* 〕\n` +
          `│ › *Berdasarkan Nomor:* \`${usedPrefix}getidgc 1\`\n` +
          `│ › *Berdasarkan Nama:* \`${usedPrefix}getidgc Mabar Game\`\n` +
          `│ › *Lihat Semua Nomor:* Ketik \`${usedPrefix}listgc\`\n` +
          `└────────────────────────`
        );
      } else if (/^\d+$/.test(q.trim())) {
        // Berdasarkan nomor urut (contoh: .getidgc 1)
        const index = parseInt(q.trim(), 10) - 1;
        if (index < 0 || index >= groups.length) {
          return m.reply(`✕ Nomor urut tidak valid. Pilih nomor antara 1 sampai ${groups.length}.\nKetik \`${usedPrefix}listgc\` untuk melihat daftar.`);
        }
        targetGroup = groups[index];
      } else if (q.includes('@g.us')) {
        // Berdasarkan ID langsung
        const cleanJid = q.trim();
        targetGroup = groups.find(g => g.id === cleanJid) || { id: cleanJid };
      } else {
        // Pencarian berdasarkan nama / subject grup
        const keyword = q.toLowerCase().trim();
        targetGroup = groups.find(g => (g.subject || '').toLowerCase().includes(keyword));
        if (!targetGroup) {
          return m.reply(`✕ Grup dengan kata kunci "${q}" tidak ditemukan.\nKetik \`${usedPrefix}listgc\` untuk melihat seluruh daftar.`);
        }
      }

      // Ambil metadata detail grup
      let meta = targetGroup;
      try {
        meta = await sock.groupMetadata(targetGroup.id);
      } catch {}

      const botNumber = (sock.user?.id || '').replace(/:\d+/, '').split('@')[0];
      const isBotAdmin = (meta.participants || []).some(p => 
        (p.id && p.id.startsWith(botNumber)) && (p.admin === 'admin' || p.admin === 'superadmin')
      );

      // Coba ambil invite link jika bot admin
      let inviteLink = '-';
      if (isBotAdmin) {
        try {
          const code = await sock.groupInviteCode(meta.id);
          inviteLink = `https://chat.whatsapp.com/${code}`;
        } catch {}
      }

      const totalMembers = meta.participants?.length || 0;
      const totalAdmins = (meta.participants || []).filter(p => p.admin === 'admin' || p.admin === 'superadmin').length;
      const creator = meta.owner ? `+${meta.owner.split('@')[0]}` : (meta.subjectOwner ? `+${meta.subjectOwner.split('@')[0]}` : '-');

      const createdDate = meta.creation ? new Date(meta.creation * 1000).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }) : '-';

      const detailText = 
        `┌───〔 📋 *${toSmallCaps('detail informasi grup')}* 〕\n` +
        `│ › *Nama Grup:* ${meta.subject || 'Tanpa Nama'}\n` +
        `│ › *ID Grup:* \`${meta.id}\`\n` +
        `│ › *Pembuat:* ${creator}\n` +
        `│ › *Dibuat:* ${createdDate}\n` +
        `│ › *Total Member:* ${totalMembers} Orang\n` +
        `│ › *Total Admin:* ${totalAdmins} Orang\n` +
        `│ › *Status Bot:* ${isBotAdmin ? '👑 Admin' : '👤 Member Biasa'}\n` +
        `│ › *Tautan:* ${inviteLink}\n` +
        `└────────────────────────\n\n` +
        `📌 *ID Siap Disalin:*\n` +
        `\`${meta.id}\`\n\n` +
        `🚀 *Contoh Perintah Kirim Story Grup (SWGC):*\n` +
        `\`${usedPrefix}swgc ${meta.id} Halo warga ${meta.subject || 'grup'}!\``;

      await m.react('✅');
      await m.reply(detailText.trim());
    } catch (err) {
      await m.react('❌');
      await m.reply(`✕ Gagal mengambil info grup: ${err.message}`);
    }
  }
};
