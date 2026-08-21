import { jidNormalizedUser, generateWAMessage } from '@whiskeysockets/baileys';
import store from '../../lib/store.js';
import config from '../../config/config.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

// Cache data pending pemilihan grup
const pendingSwgc = new Map();

async function sendGroupStory(sock, targetGroupId, content, senderJid = '') {
  let lastError = null;

  // 1. Coba Native Baileys ourin-baileys groupStatusMessage
  try {
    const res = await sock.sendMessage(targetGroupId, { groupStatusMessage: content });
    if (res) return res;
  } catch (e) {
    lastError = e;
  }

  // 2. Coba relayMessage groupStatusMessageV2
  try {
    let baseContent = {};
    if (content.image) {
      baseContent = { image: content.image, caption: content.caption || '' };
    } else if (content.video) {
      baseContent = { video: content.video, caption: content.caption || '' };
    } else if (content.audio) {
      baseContent = { audio: content.audio, mimetype: content.mimetype || 'audio/mpeg', ptt: Boolean(content.ptt) };
    } else if (content.text) {
      baseContent = { text: content.text };
    }

    const userJid = sock.user?.id || sock.authState?.creds?.me?.id;
    const genMsg = await generateWAMessage(targetGroupId, baseContent, {
      userJid,
      upload: sock.waUploadToServer
    });

    const msgType = Object.keys(genMsg.message).find(k => k.endsWith('Message') && k !== 'senderKeyDistributionMessage');
    let mediaMessage = {};
    if (msgType) {
      mediaMessage[msgType] = genMsg.message[msgType];
      const newContextInfo = {
        isGroupStatus: true,
        statusSourceType: content.text ? 4 : (content.audio ? 3 : (content.video ? 1 : 0)),
        featureEligibilities: {
          canBeReshared: true,
          canReceiveMultiReact: false
        },
        statusAttributions: [{ type: 10 }],
        statusAudienceMetadata: { audienceType: 1 }
      };

      if (mediaMessage[msgType].contextInfo) {
        Object.assign(mediaMessage[msgType].contextInfo, newContextInfo);
      } else {
        mediaMessage[msgType].contextInfo = newContextInfo;
      }
    }

    const payload = {
      groupStatusMessageV2: {
        message: mediaMessage
      }
    };

    const messageId = genMsg.key.id;
    await sock.relayMessage(targetGroupId, payload, { messageId });
    return messageId;
  } catch (e) {
    lastError = e;
  }

  // 3. Fallback: Broadcast Status WhatsApp Tertarget (status@broadcast)
  try {
    let meta = null;
    try { meta = await sock.groupMetadata(targetGroupId); } catch {}
    if (!meta) meta = store.groupMetadata?.get(targetGroupId);

    const participantSet = new Set();
    if (meta?.participants) {
      for (const p of meta.participants) {
        const raw = jidNormalizedUser(p.id || '');
        if (raw) participantSet.add(raw);
        if (p.lid) participantSet.add(jidNormalizedUser(p.lid));
      }
    }
    if (senderJid) participantSet.add(jidNormalizedUser(senderJid));
    if (sock.user?.id) participantSet.add(jidNormalizedUser(sock.user.id));

    const statusJidList = Array.from(participantSet);
    if (statusJidList.length > 0) {
      await sock.sendMessage('status@broadcast', content, {
        broadcast: true,
        statusJidList
      });
      return true;
    }
  } catch (e) {
    lastError = e;
  }

  throw new Error(lastError?.message || 'Gagal mengirim group status story.');
}

export default {
  name: 'swgc',
  aliases: ['toswgc', 'upswgc', 'storygc', 'statusgc', 'upsw', 'swgcv2', 'swgcall'],
  category: 'owner',
  description: 'Upload status/story WhatsApp dengan border hijau khusus ke grup pilihan atau semua grup',
  ownerOnly: true,
  async run({ sock, m, args, q, usedPrefix, command }) {
    // 1. Eksekusi Konfirmasi (--confirm <id_gc>)
    if (args[0] === '--confirm' && args[1]) {
      const targetGroupId = args[1];
      const pendingData = pendingSwgc.get(m.sender);

      if (!pendingData) {
        return m.reply(`⚠️ Tidak ada data status pending. Silakan kirim ulang media + \`${usedPrefix + command}\`.`);
      }

      await m.react('⏳');

      try {
        let groupName = targetGroupId;
        try {
          const meta = await sock.groupMetadata(targetGroupId);
          groupName = meta.subject || groupName;
        } catch {}

        await sendGroupStory(sock, targetGroupId, pendingData.content, m.sender);
        pendingSwgc.delete(m.sender);

        await m.react('✅');
        let successText = `┌───〔 ✅ *${toSmallCaps('group story berhasil di-post')}* 〕\n`;
        successText += `│ ${glyphs.arrow} *${toSmallCaps('grup')}:* ${groupName}\n`;
        successText += `│ ${glyphs.arrow} *${toSmallCaps('tipe')}:* ${pendingData.mediaType}\n`;
        successText += `│ ${glyphs.arrow} *${toSmallCaps('status')}:* Terpasang di Story Grup WhatsApp (Border Hijau)\n`;
        successText += `└────────────────────`;
        return await m.reply(successText.trim());
      } catch (err) {
        await m.react('❌');
        return m.reply(`✕ Gagal posting story ke grup: ${err.message}`);
      }
    }

    // 2. Eksekusi Broadcast ke SEMUA grup (swgcall / .swgc all)
    const isAll = command === 'swgcall' || (args[0] && (args[0] || "").toLowerCase() === 'all');
    let targetGroupJid = null;
    let captionText = q;

    if (!isAll && args[0] && (args[0].endsWith('@g.us') || /^\d+-\d+@g\.us$/.test(args[0]))) {
      targetGroupJid = args[0];
      captionText = args.slice(1).join(' ').trim();
    } else if (m.isGroup && !isAll) {
      targetGroupJid = m.chat;
    }

    // 3. Ekstraksi Konten Media / Teks
    let content = null;
    let mediaType = 'Teks';

    if (m.quoted) {
      const qType = m.quoted.type;
      const mime = m.quoted.msg?.mimetype || '';

      if (qType === 'imageMessage' || mime.startsWith('image/')) {
        const buffer = await m.quoted.download();
        content = { image: buffer, caption: captionText || m.quoted.text || '' };
        mediaType = 'Gambar 📸';
      } else if (qType === 'videoMessage' || mime.startsWith('video/')) {
        const buffer = await m.quoted.download();
        content = { video: buffer, caption: captionText || m.quoted.text || '' };
        mediaType = 'Video 🎬';
      } else if (qType === 'audioMessage' || mime.startsWith('audio/')) {
        const buffer = await m.quoted.download();
        content = { audio: buffer, mimetype: 'audio/mp4', ptt: true };
        mediaType = 'Voice Note 🎙️';
      }
    }

    if (!content) {
      const mime = m.msg?.mimetype || '';
      if (m.type === 'imageMessage' || mime.startsWith('image/')) {
        const buffer = await m.download();
        content = { image: buffer, caption: captionText || '' };
        mediaType = 'Gambar 📸';
      } else if (m.type === 'videoMessage' || mime.startsWith('video/')) {
        const buffer = await m.download();
        content = { video: buffer, caption: captionText || '' };
        mediaType = 'Video 🎬';
      } else if (m.type === 'audioMessage' || mime.startsWith('audio/')) {
        const buffer = await m.download();
        content = { audio: buffer, mimetype: 'audio/mp4', ptt: true };
        mediaType = 'Voice Note 🎙️';
      }
    }

    if (!content && captionText && captionText.trim()) {
      const bgColors = ['#0f172a', '#1e293b', '#312e81', '#1e1b4b', '#134e4a', '#701a75', '#4c0519', '#128C7E'];
      const randomBg = bgColors[Math.floor(Math.random() * bgColors.length)];
      content = {
        text: captionText.trim(),
        backgroundColor: randomBg,
        font: 1
      };
      mediaType = 'Teks 📝';
    }

    if (!content) {
      return m.reply(
        `┌───〔 📢 *${toSmallCaps('cara posting story grup (swgc)')}* 〕\n` +
        `│ ${glyphs.arrow} *Story Teks:* \`${usedPrefix + command} Halo semua warga grup!\`\n` +
        `│ ${glyphs.arrow} *Story Gambar/Video:* Kirim/Reply media dengan caption \`${usedPrefix + command}\`\n` +
        `│ ${glyphs.arrow} *Story Audio/VN:* Reply audio dengan \`${usedPrefix + command}\`\n` +
        `│ ${glyphs.arrow} *Posting ke Semua Grup:* \`${usedPrefix + command} all <teks/media>\`\n` +
        `│ ${glyphs.arrow} *Target ID Spesifik:* \`${usedPrefix + command} <id_grup> <teks/media>\`\n` +
        `└────────────────────`
      );
    }

    // 4. Jika target grup sudah jelas (diketik di dalam grup atau ditentukan langsung)
    if (targetGroupJid) {
      await m.react('⏳');
      try {
        let groupName = targetGroupJid;
        try {
          const meta = await sock.groupMetadata(targetGroupJid);
          groupName = meta.subject || groupName;
        } catch {}

        await sendGroupStory(sock, targetGroupJid, content, m.sender);
        await m.react('✅');

        let successText = `┌───〔 ✅ *${toSmallCaps('group story berhasil di-post')}* 〕\n`;
        successText += `│ ${glyphs.arrow} *${toSmallCaps('grup')}:* ${groupName}\n`;
        successText += `│ ${glyphs.arrow} *${toSmallCaps('tipe')}:* ${mediaType}\n`;
        successText += `│ ${glyphs.arrow} *${toSmallCaps('status')}:* Terpasang di Story Grup WhatsApp\n`;
        successText += `└────────────────────`;
        return await m.reply(successText.trim());
      } catch (err) {
        await m.react('❌');
        return m.reply(`✕ Gagal posting status ke grup: ${err.message}`);
      }
    }

    // 5. Jika broadcast ke SEMUA grup (all)
    if (isAll) {
      await m.react('⏳');
      try {
        const allChats = await sock.groupFetchAllParticipating();
        const groups = Object.entries(allChats);

        if (groups.length === 0) {
          return m.reply('✕ Bot belum bergabung di grup manapun.');
        }

        let success = 0;
        let failed = 0;

        for (const [id, meta] of groups) {
          try {
            await sendGroupStory(sock, id, content, m.sender);
            success++;
          } catch (e) {
            failed++;
          }
          await new Promise(r => setTimeout(r, 600)); // Delay aman
        }

        await m.react('✅');
        let report = `┌───〔 📢 *${toSmallCaps('broadcast swgc selesai')}* 〕\n`;
        report += `│ ${glyphs.arrow} *${toSmallCaps('total grup')}:* ${groups.length}\n`;
        report += `│ ${glyphs.arrow} *${toSmallCaps('berhasil')}:* ${success} ✅\n`;
        report += `│ ${glyphs.arrow} *${toSmallCaps('gagal')}:* ${failed} ❌\n`;
        report += `│ ${glyphs.arrow} *${toSmallCaps('tipe media')}:* ${mediaType}\n`;
        report += `└────────────────────`;
        return await m.reply(report.trim());
      } catch (err) {
        await m.react('❌');
        return m.reply(`✕ Gagal broadcast swgc: ${err.message}`);
      }
    }

    // 6. Jika dipanggil dari Private Chat tanpa ID grup: Munculkan pilihan grup
    try {
      const allChats = await sock.groupFetchAllParticipating();
      const groupList = Object.entries(allChats);

      if (groupList.length === 0) {
        return m.reply('✕ Bot belum bergabung di grup manapun.');
      }

      // Simpan data pending
      pendingSwgc.set(m.sender, {
        content,
        mediaType,
        timestamp: Date.now()
      });

      const groupRows = groupList.map(([id, meta]) => ({
        title: meta.subject || 'Grup WhatsApp',
        description: id,
        id: `${usedPrefix}swgc --confirm ${id}`
      }));

      // Kirim pesan interaktif single-select button jika didukung
      const buttonSuccess = await sock.sendMessage(m.chat, {
        text: `📋 *${toSmallCaps('pilih grup tujuan untuk post story')}*\n\n` +
          `› Media: *${mediaType}*\n` +
          `› Total Grup: *${groupList.length} Grup*\n\n` +
          `_Pilih grup dari menu di bawah atau ketik:_ \`${usedPrefix}swgc <id_grup>\``,
        interactiveButtons: [
          {
            name: 'single_select',
            buttonParamsJson: JSON.stringify({
              title: '🏠 Pilih Grup Tujuan',
              sections: [
                {
                  title: 'Daftar Grup yang Diikuti Bot',
                  rows: groupRows.slice(0, 10)
                }
              ]
            })
          }
        ]
      }, { quoted: m }).catch(() => null);

      if (!buttonSuccess) {
        let listText = `┌───〔 📋 *${toSmallCaps('pilih id grup untuk story')}* 〕\n`;
        groupList.slice(0, 15).forEach(([id, meta], i) => {
          listText += `│ ${i + 1}. *${meta.subject || 'Grup'}*\n`;
          listText += `│    › ID: \`${id}\`\n`;
        });
        listText += `└────────────────────\n\n`;
        listText += `_› Untuk mengirim, ketik:_ \`${usedPrefix}swgc --confirm <id_grup>\`\n`;
        listText += `_› Atau kirim ke semua grup:_ \`${usedPrefix}swgc all\``;
        await m.reply(listText.trim());
      }
    } catch (err) {
      await m.reply(`✕ Gagal mengambil daftar grup: ${err.message}`);
    }
  }
};
