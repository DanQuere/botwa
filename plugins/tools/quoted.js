export default {
  name: 'q',
  aliases: ['quoted', 'rtext'],
  category: 'tools',
  description: 'Mendapatkan raw text atau objek dari pesan yang direply',
  async run({ m }) {
    if (!m.quoted) {
      return m.reply('❌ Reply pesan yang ingin dilihat datanya.');
    }

    let detail = `💬 *Data Pesan Quoted*\n\n`;
    detail += `• *Pengirim:* @${m.quoted.senderNumber}\n`;
    detail += `• *Tipe Pesan:* ${m.quoted.type}\n`;
    detail += `• *ID Pesan:* ${m.quoted.key.id}\n`;
    if (m.quoted.text) {
      detail += `• *Teks:*\n${m.quoted.text}\n`;
    }

    await m.reply(detail, { mentions: [m.quoted.sender] });
  }
};
