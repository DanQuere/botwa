import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'groupinfo',
  aliases: ['infogrup', 'gcinfo'],
  category: 'group',
  description: 'Melihat rincian dan pengaturan grup saat ini',
  groupOnly: true,
  async run({ m, groupMetadata, participants, store }) {
    const adminJids = [];
    const admins = participants.filter(p => p.admin).map(p => {
      const pnJid = store?.resolveLidToPn(p.id, m.chat) || p.id;
      adminJids.push(pnJid);
      return `@${pnJid.split('@')[0].replace(/[^0-9]/g, '')}`;
    });

    const ownerPn = groupMetadata.owner ? (store?.resolveLidToPn(groupMetadata.owner, m.chat) || groupMetadata.owner) : '';
    const owner = ownerPn ? `@${ownerPn.split('@')[0].replace(/[^0-9]/g, '')}` : toSmallCaps('tidak diketahui');

    let info = `┌───〔 ${glyphs.diamond} *${toSmallCaps('informasi grup')}* 〕\n`;
    info += `│ ${glyphs.arrow} *${toSmallCaps('nama')}:* ${groupMetadata.subject}\n`;
    info += `│ ${glyphs.arrow} *${toSmallCaps('id')}:* ${groupMetadata.id}\n`;
    info += `│ ${glyphs.arrow} *${toSmallCaps('creator')}:* ${owner}\n`;
    info += `│ ${glyphs.arrow} *${toSmallCaps('anggota')}:* ${participants.length} ${toSmallCaps('member')}\n`;
    info += `│ ${glyphs.arrow} *${toSmallCaps('total admin')}:* ${admins.length} admin\n`;
    info += `│ ${glyphs.arrow} *${toSmallCaps('dibuat')}:* ${new Date(groupMetadata.creation * 1000).toLocaleDateString('id-ID')}\n`;
    info += `├────────────────────\n`;
    info += `│ ${glyphs.arrow} *${toSmallCaps('admin')}:* ${admins.join(', ')}\n`;
    if (groupMetadata.desc) {
      info += `│ ${glyphs.arrow} *${toSmallCaps('deskripsi')}:*\n│ ${groupMetadata.desc.split('\n').join('\n│ ')}\n`;
    }
    info += `└────────────────────`;

    await m.reply(info, {
      mentions: adminJids
    });
  }
};
