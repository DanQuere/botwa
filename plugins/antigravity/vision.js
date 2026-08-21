import { toSmallCaps, glyphs } from '../../utils/font.js';
import antigravity from '../../lib/antigravity.js';
import db from '../../database/index.js';

export default {
  name: 'agyvision',
  aliases: ['lihat', 'analisagambar', 'ocr', 'vision'],
  category: 'ai',
  description: 'Menganalisis gambar, diagram, tulisan/OCR, UI mockup, atau foto dengan Google Antigravity Vision',
  async run({ m, q, usedPrefix, command, isOwner }) {
    if (!isOwner && !db.data.settings.antigravityPublic) {
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('akses terbatas')}* 〕\n` +
        `│ ${glyphs.arrow} _${toSmallCaps('fitur vision antigravity saat ini hanya diizinkan untuk owner bot.')}_\n` +
        `└────────────────────`
      );
    }

    let imageBuffer = null;
    let mimeType = 'image/jpeg';

    if (m.type === 'imageMessage') {
      imageBuffer = await m.download();
      mimeType = m.msg?.mimetype || 'image/jpeg';
    } else if (m.quoted && (m.quoted.type === 'imageMessage' || m.quoted.msg?.mimetype?.startsWith('image/'))) {
      imageBuffer = await m.quoted.download();
      mimeType = m.quoted.msg?.mimetype || 'image/jpeg';
    }

    if (!imageBuffer) {
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('antigravity vision')}* 〕\n` +
        `│ ${glyphs.arrow} _${toSmallCaps('kirim gambar dengan caption atau reply gambar dengan:')}_\n` +
        `│ \`${usedPrefix + command} tolong baca dan jelaskan isi gambar ini\`\n` +
        `└────────────────────`
      );
    }

    await m.react('👁️');

    const prompt = q || (isOwner 
      ? 'Analisis dan jelaskan seluruh detail, kode, teks, arsitektur, dan objek pada gambar ini secara mendalam.'
      : 'Analisis dan jelaskan apa yang ada pada gambar ini dengan santun, ringkas, dan jelas.');

    try {
      const result = await antigravity.generateContent(m.sender, prompt, imageBuffer, mimeType, isOwner);

      await m.react('✦');

      let responseText = `┌───〔 ${glyphs.diamond} *${toSmallCaps('hasil analisis vision')}* 〕\n\n`;
      responseText += result.text;
      responseText += `\n\n└────────────────────\n_› ${toSmallCaps(`model: ${result.model} | token: ${result.usage.totalTokens}`)}_`;

      await m.reply(responseText);
    } catch (err) {
      await m.react('✕');
      await m.reply(`✕ *${toSmallCaps('gagal analisis vision')}:* ${err.message}`);
    }
  }
};
