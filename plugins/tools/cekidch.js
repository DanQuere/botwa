import { toSmallCaps, glyphs } from '../../utils/font.js';
import { sendButton } from '../../lib/interactive.js';
import config from '../../config/config.js';

function formatDate(timestamp) {
  if (!timestamp) return '—';
  const d = new Date(typeof timestamp === 'number' && timestamp < 1e12 ? timestamp * 1000 : Number(timestamp));
  if (isNaN(d.getTime())) return '—';
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())} WIB`;
}

function formatSubs(count) {
  if (!count || count === 0) return '0';
  const n = Number(count);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

export default {
  name: 'cekidch',
  aliases: ['idch', 'channelid', 'infoch', 'channelinfo', 'saluranid'],
  category: 'tools',
  description: 'Mengecek ID, link, dan informasi lengkap Saluran / Channel WhatsApp via link atau reply pesan saluran',
  async run({ sock, m, q, usedPrefix, command }) {
    let inputLink = (q || '').trim();
    let inviteCode = null;
    let targetJid = null;

    // 1. Cek apakah me-reply pesan yang diteruskan dari Saluran / Channel
    const forwardedNewsletter = m.quoted?.msg?.contextInfo?.forwardedNewsletterMessageInfo ||
                                m.msg?.contextInfo?.forwardedNewsletterMessageInfo ||
                                m.quoted?.msg?.contextInfo?.newsletterInfo;

    if (forwardedNewsletter?.newsletterJid) {
      targetJid = forwardedNewsletter.newsletterJid;
    }

    // 2. Cek apakah ada link saluran pada argumen atau teks yang di-reply
    const textToCheck = inputLink || (m.quoted?.text || '');
    const linkMatch = textToCheck.match(/https?:\/\/(?:www\.)?whatsapp\.com\/channel\/([a-zA-Z0-9_-]+)/i);

    if (linkMatch) {
      inviteCode = linkMatch[1];
    } else if (/^120363\d+@newsletter$/.test(inputLink)) {
      targetJid = inputLink;
    }

    if (!inviteCode && !targetJid) {
      return m.reply(
        `┌───〔 📡 *${toSmallCaps('cek id saluran whatsapp')}* 〕\n` +
        `│ ${glyphs.arrow} *Cara 1 (Pakai Link):*\n` +
        `│ \`${usedPrefix + command} https://whatsapp.com/channel/0029VbDeQqZ7NoZuRhK96V3S\`\n` +
        `│\n` +
        `│ ${glyphs.arrow} *Cara 2 (Reply Pesan Saluran):*\n` +
        `│ Cukup balas/reply pesan yang diteruskan dari saluran dengan ketik \`${usedPrefix + command}\`\n` +
        `└────────────────────`
      );
    }

    await m.react('🔎');

    try {
      let metadata = null;

      // Ambil metadata saluran via Baileys API
      if (inviteCode) {
        if (typeof sock.newsletterMetadata === 'function') {
          metadata = await sock.newsletterMetadata('invite', inviteCode);
        }
      } else if (targetJid) {
        if (typeof sock.newsletterMetadata === 'function') {
          metadata = await sock.newsletterMetadata('jid', targetJid);
        }
      }

      const chId = metadata?.id || targetJid || (forwardedNewsletter?.newsletterJid ? forwardedNewsletter.newsletterJid : '—');
      const chName = metadata?.name || forwardedNewsletter?.newsletterName || 'Saluran WhatsApp';
      const chSubs = metadata?.subscribers ?? metadata?.subscribers_count ?? metadata?.thread_metadata?.subscribers_count ?? 0;
      const chDesc = metadata?.description || metadata?.thread_metadata?.description?.text || '—';
      const chVerified = (metadata?.verification === 'VERIFIED' || metadata?.thread_metadata?.verification === 'VERIFIED') ? '✓ Terverifikasi (Verified)' : 'Belum Terverifikasi';
      const chCreated = formatDate(metadata?.creation_time || metadata?.thread_metadata?.creation_time);
      const chPicture = metadata?.preview || metadata?.picture || 'https://files.catbox.moe/lp9tpd.jpg';
      const chUrl = inviteCode ? `https://whatsapp.com/channel/${inviteCode}` : (metadata?.invite ? `https://whatsapp.com/channel/${metadata.invite}` : '');

      let caption = `┌───〔 📡 *${toSmallCaps('informasi saluran')}* 〕\n`;
      caption += `│ ${glyphs.arrow} *${toSmallCaps('nama')}:* ${chName}\n`;
      caption += `│ ${glyphs.arrow} *${toSmallCaps('id saluran')}:* \`${chId}\`\n`;
      caption += `│ ${glyphs.arrow} *${toSmallCaps('pengikut')}:* ${formatSubs(chSubs)} subscriber\n`;
      caption += `│ ${glyphs.arrow} *${toSmallCaps('status')}:* ${chVerified}\n`;
      caption += `│ ${glyphs.arrow} *${toSmallCaps('dibuat')}:* ${chCreated}\n`;
      caption += `└────────────────────\n\n`;

      if (chDesc && chDesc !== '—') {
        const cleanDesc = chDesc.length > 200 ? chDesc.slice(0, 197) + '...' : chDesc;
        caption += `📝 *${toSmallCaps('deskripsi')}:*\n_${cleanDesc}_\n\n`;
      }

      caption += `_› Gunakan ID di atas untuk fitur bot seperti \`.playch --idch ${chId} <lagu>\`_`;

      const buttons = [
        {
          name: 'cta_copy',
          params: {
            display_text: '📋 Salin ID Saluran',
            copy_code: chId
          }
        }
      ];

      if (chUrl) {
        buttons.push({
          name: 'cta_url',
          params: {
            display_text: '🔗 Buka Saluran',
            url: chUrl
          }
        });
      }

      try {
        await sendButton(sock, m.chat, {
          title: toSmallCaps('WhatsApp Channel Information'),
          body: caption.trim(),
          footer: 'Antigravity Newsletter Assistant • 2026',
          media: {
            image: chPicture
          },
          buttons
        }, m);
      } catch {
        // Fallback jika tidak mendukung button
        if (chPicture && typeof chPicture === 'string' && chPicture.startsWith('http')) {
          await sock.sendMessage(m.chat, {
            image: { url: chPicture },
            caption: caption.trim()
          }, { quoted: m });
        } else {
          await m.reply(caption.trim());
        }
      }

      await m.react('✅');
    } catch (err) {
      console.error('[CekIdCh Error]', err);
      await m.react('❌');
      await m.reply(
        `✕ Gagal mengambil informasi saluran.\n` +
        `Pastikan link atau pesan saluran valid: ${err.message}`
      );
    }
  }
};
