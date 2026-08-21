import { toSmallCaps, glyphs } from '../../utils/font.js';
import antigravity from '../../lib/antigravity.js';
import db from '../../database/index.js';

export default {
  name: 'agy',
  aliases: ['antigravitychat', 'askagy', 'tanya'],
  category: 'ai',
  description: 'Berinteraksi langsung dengan AI Google Antigravity (Teks & Multimodal Vision)',
  async run({ sock, m, q, usedPrefix, command, isOwner, isPremium, user }) {
    // Cek jika mode publik dimatikan (hanya owner)
    if (!isOwner && !db.data.settings.antigravityPublic) {
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('akses terbatas')}* 〕\n` +
        `│ ${glyphs.arrow} _${toSmallCaps('fitur antigravity saat ini hanya diizinkan untuk owner bot.')}_\n` +
        `└────────────────────`
      );
    }

    let prompt = q;
    let imageBuffer = null;
    let mimeType = 'image/jpeg';

    // 1. Cek apakah ada media gambar langsung pada pesan
    const isDirectImage = m.type === 'imageMessage';
    if (isDirectImage) {
      try {
        imageBuffer = await m.download();
        mimeType = m.msg?.mimetype || 'image/jpeg';
      } catch (e) {}
    }

    // 2. Cek apakah membalas (reply/quote) pesan gambar
    const isQuotedImage = m.quoted && (m.quoted.type === 'imageMessage' || m.quoted.msg?.mimetype?.startsWith('image/'));
    if (isQuotedImage) {
      try {
        imageBuffer = await m.quoted.download();
        mimeType = m.quoted.msg?.mimetype || 'image/jpeg';
      } catch (e) {}
    }

    if (!prompt && !imageBuffer) {
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps(isOwner ? 'antigravity full agent' : 'antigravity assistant')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('tanya teks')}:* \`${usedPrefix + command} <pertanyaan>\`\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('analisis foto')}:* Kirim / Balas foto dengan \`${usedPrefix + command} lihat foto ini\`\n` +
        `└────────────────────`
      );
    }

    // Default prompt jika hanya mengirim gambar tanpa teks
    if (!prompt && imageBuffer) {
      prompt = isOwner 
        ? 'Tolong analisis, jelaskan, dan deskripsikan gambar ini secara mendalam dan rinci beserta kode/solusi jika ada.'
        : 'Tolong jelaskan apa yang ada pada gambar ini secara ringkas dan ramah.';
    }

    await m.react('💭');

    try {
      const result = await antigravity.generateContent(m.sender, prompt, imageBuffer, mimeType, isOwner);

      await m.react('✦');

      let responseText = result.text;
      const roleBadge = isOwner ? toSmallCaps('owner agent mode') : toSmallCaps('assistant mode');
      const footer = 
        `\n\n┌───〔 ${glyphs.diamond} *${toSmallCaps(result.model)}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('role')}:* ${roleBadge}\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('token')}:* ${result.usage.totalTokens} (${toSmallCaps('in')}: ${result.usage.promptTokens}, ${toSmallCaps('out')}: ${result.usage.candidatesTokens})\n` +
        `└────────────────────`;

      await m.reply(responseText + footer);
    } catch (err) {
      await m.react('✕');

      if (err.message?.includes('AUTH_REQUIRED')) {
        return m.reply(
          `┌───〔 ✕ *${toSmallCaps('belum terotentikasi')}* 〕\n` +
          `│ ${glyphs.arrow} _${toSmallCaps('kamu belum memasukkan token / api key.')}_\n` +
          `│ ${glyphs.arrow} _${toSmallCaps(`ketik: ${usedPrefix}agylogin atau ${usedPrefix}agytoken <token>`)}_\n` +
          `└────────────────────`
        );
      }

      await m.reply(`✕ *${toSmallCaps('kesalahan antigravity')}:* ${err.message}`);
    }
  }
};
