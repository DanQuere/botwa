import { toSmallCaps, glyphs } from '../../utils/font.js';

// In-memory math sessions: chatJid -> { question, answer, timeout, exp }
const mathSessions = new Map();

export default {
  name: 'math',
  aliases: ['matematika', 'kuismath', 'hitung'],
  category: 'game',
  description: 'Kuis matematika berhitung cepat dengan hadiah EXP dan Limit',
  async run({ sock, m, q, usedPrefix, user, db }) {
    const chat = m.chat;

    // Cek jawaban
    if (mathSessions.has(chat)) {
      const session = mathSessions.get(chat);
      const userAnswer = parseInt(q || m.text, 10);

      if (!isNaN(userAnswer) && userAnswer === session.answer) {
        clearTimeout(session.timeoutId);
        mathSessions.delete(chat);

        user.exp = (user.exp || 0) + session.exp;
        user.limit = (user.limit || 0) + 1;
        db.save();

        let winText = `🎉 *Benar! Jawabanmu Tepat!*\n`;
        winText += `Jawaban: *${session.answer}*\n`;
        winText += `🎁 *Hadiah:* +${session.exp} EXP & +1 Limit!\n`;
        winText += `Ketik \`${usedPrefix}math\` untuk soal berikutnya.`;
        return await m.reply(winText);
      } else if (q && !isNaN(parseInt(q, 10))) {
        return await m.reply('✕ Jawaban salah! Coba hitung lagi.');
      }
    }

    if (mathSessions.has(chat)) {
      const s = mathSessions.get(chat);
      return m.reply(`⏳ Masih ada soal aktif di chat ini:\n*${s.question}* = ?\n\nJawab dengan mengetik angkanya langsung.`);
    }

    // Buat soal baru
    const modes = ['+', '-', '*'];
    const op = modes[Math.floor(Math.random() * modes.length)];
    let n1 = Math.floor(Math.random() * 50) + 10;
    let n2 = Math.floor(Math.random() * 40) + 1;
    let expReward = 30;

    if (op === '*') {
      n1 = Math.floor(Math.random() * 15) + 2;
      n2 = Math.floor(Math.random() * 12) + 2;
      expReward = 50;
    }

    let ans = 0;
    if (op === '+') ans = n1 + n2;
    else if (op === '-') ans = n1 - n2;
    else if (op === '*') ans = n1 * n2;

    const questionStr = `${n1} ${op === '*' ? '×' : op} ${n2}`;

    const timeoutId = setTimeout(() => {
      if (mathSessions.has(chat)) {
        mathSessions.delete(chat);
        sock.sendMessage(chat, { text: `⏱️ *Waktu Habis!*\nSoal: *${questionStr}*\nJawaban yang benar adalah: *${ans}*` });
      }
    }, 45000); // 45 detik

    mathSessions.set(chat, {
      question: questionStr,
      answer: ans,
      exp: expReward,
      timeoutId
    });

    let text = `┌───〔 🧮 *${toSmallCaps('kuis matematika')}* 〕\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('soal')}:* ${questionStr} = ?\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('waktu')}:* 45 Detik\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('hadiah')}:* +${expReward} EXP & +1 Limit\n`;
    text += `└────────────────────\n\n`;
    text += `_› Balas / ketik angka jawaban yang benar!_`;

    await m.reply(text.trim());
  }
};
