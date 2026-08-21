import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import os from 'os';
import { toSmallCaps } from '../../utils/font.js';

export default {
  name: 'toaudio',
  aliases: ['tomp3', 'mp3', 'getaudio'],
  category: 'converter',
  description: 'Mengekstrak audio dari video menjadi file lagu MP3',
  async run({ sock, m, usedPrefix }) {
    const qMsg = m.quoted ? m.quoted : m;
    const isVideo = qMsg.type === 'videoMessage' || qMsg.msg?.mimetype?.startsWith('video/');

    if (!isVideo) {
      return m.reply(`🎵 Reply video yang ingin diekstrak audionya dengan \`${usedPrefix}toaudio\`.`);
    }

    await m.react('⏳');

    try {
      const buffer = await qMsg.download();
      const tmpInput = path.join(os.tmpdir(), `in_${Date.now()}`);
      const tmpOutput = path.join(os.tmpdir(), `out_${Date.now()}.mp3`);

      fs.writeFileSync(tmpInput, buffer);

      await new Promise((resolve, reject) => {
        ffmpeg(tmpInput)
          .toFormat('mp3')
          .audioBitrate('128k')
          .on('end', resolve)
          .on('error', reject)
          .save(tmpOutput);
      });

      const outBuffer = fs.readFileSync(tmpOutput);
      try { fs.unlinkSync(tmpInput); fs.unlinkSync(tmpOutput); } catch {}

      await sock.sendMessage(m.chat, {
        audio: outBuffer,
        mimetype: 'audio/mp4',
        fileName: `audio_${Date.now()}.mp3`
      }, { quoted: m });

      await m.react('✅');
    } catch (err) {
      await m.react('❌');
      await m.reply(`✕ Gagal mengekstrak audio: ${err.message}`);
    }
  }
};
