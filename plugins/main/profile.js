import db from '../../database/index.js';
import settings from '../../settings.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'profile',
  aliases: ['me', 'profil', 'limit', 'status', 'myinfo'],
  category: 'main',
  description: 'Melihat profil akun, level, status premium, dan sisa limit Anda',
  async run({ m }) {
    const targetJid = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender);
    const targetUser = db.getUser(targetJid);
    const targetNumber = targetJid.split('@')[0].replace(/[^0-9]/g, '');

    const isTargetOwner = db.isOwner(targetNumber) || settings.owners.some(num => num.replace(/[^0-9]/g, '') === targetNumber);
    const isTargetPremium = isTargetOwner || (targetUser.premium && targetUser.premiumTime > Date.now());

    let statusText = toSmallCaps('free user');
    if (isTargetOwner) {
      statusText = toSmallCaps('bot owner');
    } else if (isTargetPremium) {
      statusText = toSmallCaps('vip premium');
    }

    const limitText = (isTargetOwner || isTargetPremium) ? glyphs.infinite : `${targetUser.limit} / ${settings.defaultLimit || 25}`;

    const currentExp = targetUser.exp || 0;
    const currentLevel = targetUser.level || 1;
    const maxExp = currentLevel * 100;
    const rankRole = isTargetOwner ? toSmallCaps('owner') : toSmallCaps(targetUser.role || db.calculateRole(targetUser));

    let expiryRow = '';
    if (targetUser.premium && targetUser.premiumTime > 0) {
      const now = Date.now();
      const sisaHari = Math.ceil((targetUser.premiumTime - now) / (1000 * 60 * 60 * 24));
      const expFormatted = new Date(targetUser.premiumTime).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      expiryRow = `│ ${glyphs.arrow} *${toSmallCaps('expired')}:* ${expFormatted} (${sisaHari} ${toSmallCaps('hari')})\n`;
    }

    const card = 
      `┌───〔 ${glyphs.diamond} *${toSmallCaps('user profile')}* 〕\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('nama')}:* ${targetUser.name || 'User'}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('nomor')}:* +${targetNumber}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('status')}:* ${statusText}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('limit')}:* ${limitText}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('rank')}:* ${rankRole}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('level')}:* ${currentLevel}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('exp')}:* ${currentExp} / ${maxExp}\n` +
      `│ ${glyphs.arrow} *${toSmallCaps('total hit')}:* ${targetUser.hit || 0}\n` +
      expiryRow +
      `└────────────────────\n` +
      `_› ${toSmallCaps('reset limit harian setiap 24 jam.')}_`;

    await m.reply(card, {
      mentions: [targetJid]
    });
  }
};
