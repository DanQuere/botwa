import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'transfer',
  aliases: ['pay', 'kirimlimit', 'tf'],
  category: 'user',
  description: 'Mentransfer sisa limit ke pengguna lain',
  async run({ m, q, user, db, usedPrefix }) {
    let target = null;
    if (m.quoted) {
      target = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      target = m.mentionedJid[0];
    }

    const args = q.trim().split(/\s+/);
    const amountStr = args.find(a => !isNaN(parseInt(a, 10)) && !a.startsWith('@'));
    const amount = parseInt(amountStr, 10);

    if (!target || isNaN(amount) || amount <= 0) {
      return m.reply(`💸 *Transfer Limit*\n\nFormat: \`${usedPrefix}transfer @user <jumlah>\`\n*Contoh:* \`${usedPrefix}transfer @user 5\``);
    }

    if (target === m.sender) {
      return m.reply('✕ Kamu tidak bisa mentransfer limit ke dirimu sendiri.');
    }

    if ((user.limit || 0) < amount) {
      return m.reply(`✕ Limit kamu tidak mencukupi. Sisa limit: ${user.limit || 0}`);
    }

    const targetUser = db.getUser(target);
    user.limit -= amount;
    targetUser.limit = (targetUser.limit || 0) + amount;
    db.save();

    let text = `┌───〔 💸 *${toSmallCaps('transfer berhasil')}* 〕\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('pengirim')}:* @${m.senderNumber}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('penerima')}:* @${target.split('@')[0]}\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('jumlah')}:* ${amount} Limit\n`;
    text += `└────────────────────`;

    await m.reply(text.trim(), { mentions: [m.sender, target] });
  }
};
