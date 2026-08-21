import { toSmallCaps, glyphs } from '../../utils/font.js';

const KISAH_NABI = [
  { nama: 'Adam AS', kisah: 'Nabi pertama sekaligus manusia pertama yang diciptakan Allah SWT dari tanah dan diturunkan ke bumi bersama Hawa.' },
  { nama: 'Nuh AS', kisah: 'Diperintahkan membangun bahtera raksasa untuk menyelamatkan orang-orang beriman dan pasang-pasangan hewan dari banjir besar.' },
  { nama: 'Ibrahim AS', kisah: 'Bapak para Nabi (Khalilullah) yang selamat dari kobaran api Raja Namrud dan teladan ketaatan dalam berkurban.' },
  { nama: 'Musa AS', kisah: 'Nabi yang menerima Kitab Taurat di Bukit Sinai, berbicara langsung dengan Allah (Kalimullah), dan membelah Laut Merah dengan tongkatnya.' },
  { nama: 'Isa AS', kisah: 'Dilahirkan tanpa ayah dari Maryam, menerima Kitab Injil, dapat menyembuhkan orang sakit, dan diangkat ke langit oleh Allah SWT.' },
  { nama: 'Muhammad SAW', kisah: 'Khatamul Anbiya (Penutup para Nabi), menerima mukjizat terbesar Kitab Suci Al-Qur\'an, dan membawa ajaran Islam rahmatan lil \'alamin.' }
];

export default {
  name: 'kisahnabi',
  aliases: ['nabi', '25nabi'],
  category: 'islamic',
  description: 'Menampilkan ringkasan kisah dan mukjizat 25 Nabi & Rasul',
  async run({ m, q, usedPrefix }) {
    if (q) {
      const match = KISAH_NABI.find(n => n.nama.toLowerCase().includes(q.toLowerCase()));
      if (match) {
        let text = `┌───〔 🕌 *${toSmallCaps('kisah nabi ' + match.nama)}* 〕\n`;
        text += `│ "${match.kisah}"\n`;
        text += `└────────────────────`;
        return await m.reply(text.trim());
      }
    }

    let text = `┌───〔 🕌 *${toSmallCaps('kisah 25 nabi & rasul')}* 〕\n`;
    for (const n of KISAH_NABI) {
      text += `│ *• Nabi ${n.nama}*\n`;
      text += `│   └ ${n.kisah}\n│\n`;
    }
    text += `└────────────────────\n\n`;
    text += `_› Ketik \`${usedPrefix}kisahnabi <nama nabi>\` untuk membaca kisah nabi tertentu._`;

    await m.reply(text.trim());
  }
};
