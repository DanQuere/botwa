import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'timer',
  aliases: ['remind', 'pengingat', 'alarm'],
  category: 'tools',
  description: 'Mengatur alarm pengingat waktu dalam hitungan detik/menit/jam',
  async run({ sock, m, q, usedPrefix }) {
    if (!q) {
      return m.reply(`⏱️ *Timer Pengingat*\n\nFormat: \`${usedPrefix}timer <durasi> <pesan>\`\n*Contoh:* \`${usedPrefix}timer 10s Minum air\` atau \`${usedPrefix}timer 5m Rapat online\``);
    }

    const match = q.match(/^(\d+)(s|m|h)?\s*(.*)$/i);
    if (!match) {
      return m.reply('✕ Format waktu tidak valid. Gunakan format seperti `10s`, `5m`, atau `1h`.');
    }

    const num = parseInt(match[1], 10);
    const unit = (match[2] || 's').toLowerCase();
    const reminderMsg = match[3] || 'Waktu timer telah habis!';

    let durationMs = num * 1000;
    if (unit === 'm') durationMs = num * 60 * 1000;
    if (unit === 'h') durationMs = num * 60 * 60 * 1000;

    if (durationMs > 24 * 60 * 60 * 1000) {
      return m.reply('✕ Maksimal durasi timer adalah 24 jam.');
    }

    await m.reply(`⏱️ *Timer disetel:* ${num} ${unit === 'm' ? 'Menit' : (unit === 'h' ? 'Jam' : 'Detik')}\nPengingat: "${reminderMsg}"`);

    setTimeout(async () => {
      let text = `┌───〔 ⏰ *${toSmallCaps('alarm pengingat')}* 〕\n`;
      text += `│ ${glyphs.arrow} *${toSmallCaps('untuk')}:* @${m.senderNumber}\n`;
      text += `│ ${glyphs.arrow} *${toSmallCaps('pesan')}:* ${reminderMsg}\n`;
      text += `└────────────────────`;

      await sock.sendMessage(m.chat, {
        text: text.trim(),
        mentions: [m.sender]
      }, { quoted: m });
    }, durationMs);
  }
};
