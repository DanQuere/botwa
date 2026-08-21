import { chatAI } from '../../utils/scraper.js';

export default {
  name: 'ai',
  aliases: ['bot', 'tanya', 'gpt', 'chatgpt', 'gemini'],
  category: 'ai',
  description: 'Tanya jawab interaktif dengan Artificial Intelligence',
  async run({ m, q, usedPrefix, command }) {
    if (!q) {
      return m.reply(`❓ Silakan masukkan pertanyaan atau prompt Anda.\n*Contoh:* \`${usedPrefix + command} jelaskan apa itu Baileys WhatsApp bot\``);
    }

    await m.react('💭');
    const answer = await chatAI(q);
    await m.react('🤖');
    await m.reply(answer);
  }
};
