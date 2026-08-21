import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import os from 'os';
import { toSmallCaps } from '../../utils/font.js';

export default {
  name: 'tovn',
  aliases: ['toptt', 'vn', 'jadivn'],
  category: 'converter',
  description: 'Mengubah file video atau audio menjadi Voice Note (PTT) WhatsApp',
  async run({ sock, m, usedPrefix }) {
    const qMsg = m.quoted ? m.quoted : m;
    const isAudio = qMsg.type === 'audioMessage' || qMsg.msg?.mimetype?.startsWith('audio/');
    const isVideo = qMsg.type === 'videoMessage' || qMsg.msg?.mimetype?.startsWith('video/');

    if (!isAudio && !isVideo) {
      return m.reply(`🎙️ Reply video atau audio yang ingin diubah menjadi VN dengan \`${usedPrefix}tovn\`.`);
    }

    await m.react('⏳');

    try {
      const buffer = await qMsg.download();
      const tmpInput = path.join(os.tmpdir(), `in_${Date.now()}`);
      const tmpOutput = path.join(os.tmpdir(), `out_${Date.now()}.opus`);

      fs.writeFileSync(tmpInput, buffer);

      await new Promise((resolve, reject) => {
        ffmpeg(tmpInput)
          .toFormat('opus')
          .audioCodec('libopus')
          .audioBitrate('64k')
          .audioChannels(1)
          .on('end', resolve)
          .on('error', reject)
          .save(tmpOutput);
      });

      const outBuffer = fs.readFileSync(tmpOutput);
      try { fs.unlinkSync(tmpInput); fs.unlinkSync(tmpOutput); } catch {}

      await sock.sendMessage(m.chat, {
        audio: outBuffer,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      }, { quoted: m });

      await m.react('✅');
    } catch (err) {
      await m.react('❌');
      await m.reply(`✕ Gagal mengubah ke Voice Note: ${err.message}`);
    }
  }
};
