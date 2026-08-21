import { toSmallCaps } from '../../utils/font.js';

export default {
  name: 'antilink',
  aliases: ['antilinkgc', 'antilinkwa'],
  category: 'group',
  description: 'Mengaktifkan atau menonaktifkan fitur Anti-Link WhatsApp di grup',
  groupOnly: true,
  adminOnly: true,
  async run({ m, q, db, usedPrefix }) {
    const group = db.getGroup(m.chat);
    const mode = (q || '').toLowerCase().trim();

    if (mode === 'on' || mode === 'enable' || mode === '1') {
      group.antilink = true;
      db.save();
      return await m.reply(`✓ *${toSmallCaps('anti-link grup diaktifkan')}* 🛡️\nMember yang mengirim link grup akan otomatis diperingatkan/dihapus.`);
    } else if (mode === 'off' || mode === 'disable' || mode === '0') {
      group.antilink = false;
      db.save();
      return await m.reply(`✓ *${toSmallCaps('anti-link grup dinonaktifkan')}*`);
    } else {
      const status = group.antilink ? 'AKTIF ✅' : 'NONAKTIF ❌';
      return await m.reply(`🛡️ *Status Anti-Link:* ${status}\n\nPenggunaan:\n• \`${usedPrefix}antilink on\` (Aktifkan)\n• \`${usedPrefix}antilink off\` (Matikan)`);
    }
  }
};
