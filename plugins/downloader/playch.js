import yts from 'yt-search';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import os from 'os';
import ffmpeg from 'fluent-ffmpeg';
import { getNeoxrPlay } from '../../utils/scraper.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';
import config from '../../config/config.js';

export default {
  name: 'playch',
  aliases: ['pch', 'playsaluran', 'chplay'],
  category: 'downloader',
  description: 'Memutar audio YouTube langsung ke Saluran / Channel WhatsApp dalam format Opus VN',
  async run({ sock, m, q, usedPrefix, command }) {
    let raw = q || '';
    let targetChId = config?.channelId || config?.saluranId || '';

    const idchMatch = raw.match(/--idch\s+(\S+)/);
    if (idchMatch) {
      targetChId = idchMatch[1];
      raw = raw.replace(/--idch\s+\S+/, '').trim();
    }

    if (!raw) {
      return m.reply(
        `┌───〔 📡 *${toSmallCaps('play saluran whatsapp')}* 〕\n` +
        `│ ${glyphs.arrow} *Format:* \`${usedPrefix + command} <judul lagu>\`\n` +
        `│ ${glyphs.arrow} *Target Saluran Spesifik:* \`${usedPrefix + command} --idch <id_saluran> <judul>\`\n` +
        `│ ${glyphs.arrow} *Contoh:* \`${usedPrefix + command} Mahalini Sial\`\n` +
        `└────────────────────`
      );
    }

    if (!targetChId) {
      return m.reply(
        `✕ ID Saluran / Channel belum ditentukan.\n` +
        `Gunakan format: \`${usedPrefix + command} --idch 120363xxx@newsletter <judul>\``
      );
    }

    await m.react('⏳');

    try {
      const data = await getNeoxrPlay(raw);
      if (!data || !data.url) throw new Error('Gagal mengambil audio dari server.');

      await m.reply(`⏳ Sedang mengonversi dan mengirim lagu *${data.title}* ke Saluran...`);

      // Download MP3 ke temporary file
      const tmpInput = path.join(os.tmpdir(), `yt_${Date.now()}.mp3`);
      const tmpOutput = path.join(os.tmpdir(), `yt_${Date.now()}.opus`);

      const audioRes = await axios.get(data.url, { responseType: 'arraybuffer', timeout: 90000 });
      fs.writeFileSync(tmpInput, Buffer.from(audioRes.data));

      // Konversi ke format Opus OGG 48kHz mono untuk WhatsApp Voice Note
      await new Promise((resolve, reject) => {
        ffmpeg(tmpInput)
          .toFormat('ogg')
          .audioCodec('libopus')
          .audioBitrate('96k')
          .audioChannels(1)
          .audioFrequency(48000)
          .on('end', resolve)
          .on('error', reject)
          .save(tmpOutput);
      });

      const opusBuffer = fs.readFileSync(tmpOutput);
      try { fs.unlinkSync(tmpInput); fs.unlinkSync(tmpOutput); } catch {}

      // Kirim pesan audio VN ke Channel / Saluran
      await sock.sendMessage(targetChId, {
        audio: opusBuffer,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true,
        contextInfo: {
          externalAdReply: {
            title: data.title,
            body: `${data.channel || 'YouTube Music'} • ${data.duration || ''}`,
            thumbnailUrl: data.thumbnail,
            sourceUrl: data.url,
            mediaType: 1
          }
        }
      });

      await m.react('✅');
      await m.reply(`✓ *${toSmallCaps('lagu berhasil diposting ke saluran')}*!\nJudul: *${data.title}*\nSaluran: \`${targetChId}\``);
    } catch (err) {
      await m.react('❌');
      await m.reply(`✕ Gagal mengirim ke saluran: ${err.message}`);
    }
  }
};
