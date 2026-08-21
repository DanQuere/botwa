import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';
import crypto from 'crypto';
import yts from 'yt-search';
import ffmpeg from 'fluent-ffmpeg';
import { getNeoxrPlay } from '../../utils/scraper.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';
import store from '../../lib/store.js';

export default {
  name: 'playcall',
  aliases: ['callplay', 'teleponlagu', 'callmusic', 'call'],
  category: 'downloader',
  description: 'Mencari lagu via Neoxr API dan langsung menelepon WhatsApp (Bisa di Private & Grup, dukung tag target)',
  async run({ sock, m, q, usedPrefix, command }) {
    if (!q && !m.mentionedJid?.length) {
      return m.reply(
        `┌───〔 📞 *${toSmallCaps('youtube play call')}* 〕\n` +
        `│ ${glyphs.arrow} *Di Private Chat:* \`${usedPrefix + command} <judul lagu>\`\n` +
        `│ ${glyphs.arrow} *Di Grup (Panggil Diri Sendiri):* \`${usedPrefix + command} <judul lagu>\`\n` +
        `│ ${glyphs.arrow} *Di Grup (Panggil Teman / Tag):* \`${usedPrefix + command} @user <judul lagu>\`\n` +
        `│ ${glyphs.arrow} *Contoh:* \`${usedPrefix + command} Komang Raim Laode\`\n` +
        `└────────────────────`
      );
    }

    await m.react('📞');

    let tmpMp3 = null;
    let tmpWav = null;

    try {
      // 1. Deteksi Target Panggilan (Bisa diri sendiri, nomor tertentu, atau user yang di-tag di grup)
      let query = q || '';
      let targetJid = m.sender;

      if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetJid = m.mentionedJid[0];
        // Hapus mention @xxx dari teks query
        query = query.replace(/@\d+/g, '').trim();
      } else if (m.quoted && m.quoted.sender) {
        // Jika me-reply chat seseorang
        targetJid = m.quoted.sender;
      }

      // Deteksi jika argumen pertama adalah nomor telepon (misal: .playcall 6281234567890 lagu)
      const firstArg = (query.split(/\s+/)[0] || '');
      if (/^\+?\d{9,16}$/.test(firstArg)) {
        targetJid = `${firstArg.replace(/\D/g, '')}@s.whatsapp.net`;
        query = query.slice(firstArg.length).trim();
      }

      if (!query) {
        return m.reply(`✕ Silakan masukkan judul lagu setelah mention/nomor target.\nContoh: \`${usedPrefix + command} @user Komang\``);
      }

      // 2. Ambil data audio YouTube menggunakan Neoxr API
      let data = null;
      try {
        data = await getNeoxrPlay(query);
      } catch (e) {
        const search = await yts(query);
        if (!search.videos.length) throw new Error('Lagu tidak ditemukan.');
        const vid = search.videos[0];
        data = await getNeoxrPlay(vid.url);
      }

      if (!data || !data.url) {
        throw new Error('Gagal mendapatkan tautan audio dari server Neoxr.');
      }

      // 3. Download audio stream ke temporary file
      const tmpDir = path.join(process.cwd(), 'temp');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const id = crypto.randomBytes(4).toString('hex');
      tmpMp3 = path.join(tmpDir, `call_${Date.now()}_${id}.mp3`);
      tmpWav = path.join(tmpDir, `call_${Date.now()}_${id}.wav`);

      const audioRes = await axios.get(data.url, {
        responseType: 'arraybuffer',
        timeout: 90000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      fs.writeFileSync(tmpMp3, Buffer.from(audioRes.data));

      // Konversi MP3 ke WAV 16000Hz 16-bit Mono (Format native WebRTC WhatsApp)
      await new Promise((resolve, reject) => {
        ffmpeg(tmpMp3)
          .toFormat('wav')
          .audioCodec('pcm_s16le')
          .audioChannels(1)
          .audioFrequency(16000)
          .on('end', resolve)
          .on('error', reject)
          .save(tmpWav);
      });

      // 4. Resolve nomor telepon asli (Bukan LID)
      const resolvedTargetJid = store.resolveLidToPn(targetJid) || targetJid;
      let targetNumber = resolvedTargetJid.split('@')[0].replace(/[^0-9]/g, '');
      if (targetNumber === '26809672417297') {
        targetNumber = '6283896757956';
      }

      // 5. Pastikan VoIP Client siap & terhubung
      if (!global.voipClient) {
        try {
          const { VoipClient } = await import('@whiskeysockets/baileys');
          if (VoipClient) {
            global.voipClient = new VoipClient();
            await global.voipClient.connectWithSocket(sock);
          }
        } catch (e) {
          console.error('[VoIP Error]', e);
        }
      }

      // Kirim status informasi lagu
      let infoText = `┌───〔 📞 *${toSmallCaps('panggilan suara whatsapp')}* 〕\n`;
      infoText += `│ ${glyphs.arrow} *${toSmallCaps('lagu')}:* ${data.title}\n`;
      infoText += `│ ${glyphs.arrow} *${toSmallCaps('channel')}:* ${data.channel || 'YouTube'}\n`;
      infoText += `│ ${glyphs.arrow} *${toSmallCaps('durasi')}:* ${data.duration || '-'}\n`;
      infoText += `│ ${glyphs.arrow} *${toSmallCaps('target panggilan')}:* @${targetNumber}\n`;
      infoText += `└────────────────────\n\n`;
      
      if (m.isGroup) {
        if (targetJid !== m.sender) {
          infoText += `_📞 Memanggil @${targetNumber} atas permintaan @${m.senderNumber}! Angkat telepon untuk mendengarkan lagu._`;
        } else {
          infoText += `_📞 Memanggil nomormu (+${targetNumber}) secara privat... Angkat telepon untuk mendengarkan lagu!_`;
        }
      } else {
        infoText += `_Sedang melakukan panggilan telepon WhatsApp... Angkat telepon untuk mendengarkan lagu!_`;
      }

      await sock.sendMessage(m.chat, {
        text: infoText.trim(),
        mentions: [targetJid, m.sender]
      }, { quoted: m });

      // 6. Eksekusi Panggilan Telepon WhatsApp
      let callSuccess = false;
      if (global.voipClient && typeof global.voipClient.call === 'function') {
        try {
          if (typeof global.voipClient.resetActiveCall === 'function') {
            global.voipClient.resetActiveCall();
          }

          // Durasi dinamis persis sepanjang lagu (+ 5 detik buffer)
          const songDurationMs = (data.durationSeconds && data.durationSeconds > 0)
            ? (data.durationSeconds * 1000 + 5000)
            : 300000;

          const call = await global.voipClient.call(targetNumber, {
            audioSource: tmpWav,
            durationMs: songDurationMs
          });

          callSuccess = true;

          call.on('connected', () => {
            sock.sendMessage(m.chat, {
              text: `✅ *PANGGILAN TERHUBUNG!*\nLagu *${data.title}* sedang diputar di panggilan telepon @${targetNumber}.`,
              mentions: [targetJid]
            });
          });

          call.on('ended', (reason) => {
            if (tmpWav && fs.existsSync(tmpWav)) {
              try { fs.unlinkSync(tmpWav); } catch {}
            }
            if (tmpMp3 && fs.existsSync(tmpMp3)) {
              try { fs.unlinkSync(tmpMp3); } catch {}
            }
            sock.sendMessage(m.chat, {
              text: `📵 *Panggilan @${targetNumber} berakhir:* ${reason || 'Selesai'}`,
              mentions: [targetJid]
            });
          });

          call.on('error', (err) => {
            console.error('[VoIP Call Error]', err);
          });
        } catch (callErr) {
          console.error('[VoIP Launch Error]', callErr);
        }
      }

      // 7. Kirim cadangan audio player ke chat agar semua anggota grup tetap bisa mendengarkan secara jernih
      const audioMp3Buffer = fs.readFileSync(tmpMp3);
      await sock.sendMessage(m.chat, {
        audio: audioMp3Buffer,
        mimetype: 'audio/mpeg',
        fileName: `${data.title.replace(/[\\/:*?"<>|]/g, '_')}.mp3`
      }, { quoted: m });

      await m.react('✅');
    } catch (err) {
      if (tmpMp3 && fs.existsSync(tmpMp3)) try { fs.unlinkSync(tmpMp3); } catch {}
      if (tmpWav && fs.existsSync(tmpWav)) try { fs.unlinkSync(tmpWav); } catch {}
      await m.react('❌');
      await m.reply(`✕ Gagal memproses playcall: ${err.message}`);
    }
  }
};
