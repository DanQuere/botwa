import fs from 'fs';
import config from '../../config/config.js';
import db from '../../database/index.js';
import {
  toSmallCaps,
  glyphs,
  renderHeader,
  renderRow,
  renderFooter
} from '../../utils/font.js';
import {
  formatUptime,
  formatNumber,
  getTimeGreeting,
  getWIBTime,
  getIndonesianDate
} from '../../utils/format.js';
import { sendButton } from '../../lib/interactive.js';

export default {
  name: 'menu',
  aliases: ['help', 'start', 'bot'],
  category: 'main',
  description: 'Menampilkan dashboard menu utama dengan tombol interaktif dan banner',
  async run({ sock, m, args, q, usedPrefix, plugins, handler, isOwner, isPremium, user }) {
    await m.react('✦');

    // Categorize plugins
    const categorized = {};
    const seenNames = new Set();
    const pluginsMap = plugins || handler?.plugins || new Map();

    for (const [cmdName, plugin] of pluginsMap.entries()) {
      const primaryName = plugin?.name || cmdName;
      if (!primaryName || seenNames.has(primaryName)) continue;
      seenNames.add(primaryName);

      const cat = (plugin?.category || 'other').toUpperCase();
      if (!categorized[cat]) categorized[cat] = [];
      categorized[cat].push({
        name: primaryName,
        desc: plugin?.description || '',
        ownerOnly: !!plugin?.ownerOnly,
        premiumOnly: !!plugin?.premiumOnly,
        adminOnly: !!plugin?.adminOnly,
        groupOnly: !!plugin?.groupOnly
      });
    }

    const totalFeatures = seenNames.size;
    const userDb = user || db.getUser(m.sender);
    const uptimeStr = formatUptime(process.uptime());
    const greeting = getTimeGreeting();
    const timeWIB = getWIBTime();
    const dateToday = getIndonesianDate();
    const totalUsers = Object.keys(db.data.users || {}).length;
    const totalGroups = Object.keys(db.data.groups || {}).length;
    let bannerImage = config.bannerPath || './assets/banner.jpg';
    if (typeof bannerImage === 'string' && fs.existsSync(bannerImage)) {
      try { bannerImage = fs.readFileSync(bannerImage); } catch {}
    }

    const isOwnerUser = isOwner ?? (handler?.isOwner ? handler.isOwner(m.sender, m.senderNumber, m, sock) : false);
    const userStatus = isOwnerUser ? 'Owner' : (userDb.premium ? 'VIP' : 'Free');
    const limitStatus = isOwnerUser || userDb.premium ? 'Unlimited' : `${userDb.limit ?? 25}`;

    // Category glyphs & descriptions
    const categoryDescriptions = {
      MAIN: 'Menu utama dan informasi bot',
      AI: 'Kecerdasan buatan dan asisten AI',
      DOWNLOADER: 'Pengunduh media TikTok, YouTube, dsb',
      GROUP: 'Pengelolaan dan administrasi grup',
      GAME: 'Game interaktif, kuis, dan teka-teki',
      FUN: 'Hiburan seru, kerang ajaib, dan lelucon',
      CEK: 'Cek khodam, aura, sifat, dan keberuntungan',
      TOOLS: 'Alat bantu, kalkulator, dan konverter',
      ISLAMIC: 'Doa harian, niat sholat, dan asmaul husna',
      QUOTES: 'Kata motivasi, bijak, dan pantun',
      CONVERTER: 'Konversi audio, video, dan gambar',
      ECONOMY: 'Simulasi kerja, tambang, dan inventaris',
      MAKER: 'Pembuat struk, QR code, dan sertifikat',
      USER: 'Profil akun, rank, dan transfer limit',
      STICKER: 'Pembuat dan editor stiker WhatsApp',
      ANIME: 'Info anime, waifu, dan manga',
      RANDOM: 'Pesan acak, fakta unik, dan quotes',
      OWNER: 'Pengaturan dan kontrol khusus owner'
    };

    // JIKA USER MEMINTA KATEGORI SPESIFIK (Contoh: .menu game, .menu ai, atau klik dari button list)
    if (q) {
      let cleanQuery = q.trim()
        .replace(/^[.#/!?]/, '')
        .replace(/^menu\s+/i, '')
        .replace(/\s+menu$/i, '')
        .trim()
        .toUpperCase();

      const catKey = Object.keys(categorized).find(k => (
        k === cleanQuery ||
        k.toLowerCase() === cleanQuery.toLowerCase() ||
        k.startsWith(cleanQuery) ||
        cleanQuery.startsWith(k)
      ));

      if (catKey && categorized[catKey]) {
        let subMenu = `┌───〔 *${toSmallCaps(catKey + ' MENU')}* 〕\n`;
        subMenu += `│ › *${toSmallCaps('total')}:* ${categorized[catKey].length} Fitur\n`;
        subMenu += `│ › *${toSmallCaps('prefix')}:* \`${usedPrefix}\`\n`;
        subMenu += `└────────────────────\n\n`;

        for (const cmd of categorized[catKey]) {
          const flag = cmd.ownerOnly ? ' ◈' : (cmd.premiumOnly ? ' ✦' : (cmd.adminOnly ? ' ◇' : (cmd.groupOnly ? ' ⌗' : '')));
          subMenu += `› \`${usedPrefix}${cmd.name}\`${flag}\n`;
          if (cmd.desc) {
            subMenu += `  _${toSmallCaps(cmd.desc)}_\n`;
          }
        }

        subMenu += `\n_Keterangan: ◈ Owner | ✦ Premium | ◇ Admin | ⌗ Grup_`;

        const isInteractive = m.type === 'interactiveResponseMessage' || m.type === 'listResponseMessage';

        try {
          return await sock.sendMessage(m.chat, {
            image: bannerImage,
            caption: subMenu.trim()
          }, (m.isChannel || isInteractive) ? {} : { quoted: m });
        } catch (err) {
          try {
            return await sock.sendMessage(m.chat, {
              image: bannerImage,
              caption: subMenu.trim()
            });
          } catch {
            return await m.reply(subMenu.trim());
          }
        }
      }
    }

    // DASHBOARD MENU UTAMA (Simple, Minimalist, No Spam Emojis)
    let bodyText = `*${toSmallCaps('selamat ' + greeting)}*, ${m.pushName || 'User'}\n\n`;
    bodyText += `┌───〔 *${toSmallCaps('informasi pengguna')}* 〕\n`;
    bodyText += `│ › *${toSmallCaps('nama')}:* ${m.pushName || 'User'}\n`;
    bodyText += `│ › *${toSmallCaps('status')}:* ${userStatus}\n`;
    bodyText += `│ › *${toSmallCaps('limit')}:* ${limitStatus}\n`;
    bodyText += `│ › *${toSmallCaps('level')}:* Level ${userDb.level || 1} (${formatNumber(userDb.exp || 0)} EXP)\n`;
    bodyText += `└────────────────────\n\n`;

    bodyText += `┌───〔 *${toSmallCaps('informasi bot')}* 〕\n`;
    bodyText += `│ › *${toSmallCaps('nama bot')}:* ${config.botName || 'Antigravity'}\n`;
    bodyText += `│ › *${toSmallCaps('owner')}:* ${config.ownerName || 'Owner'}\n`;
    bodyText += `│ › *${toSmallCaps('mode')}:* ${config.selfMode ? 'Self' : 'Public'}\n`;
    bodyText += `│ › *${toSmallCaps('total fitur')}:* ${totalFeatures} Perintah\n`;
    bodyText += `│ › *${toSmallCaps('total user')}:* ${formatNumber(totalUsers)} User\n`;
    bodyText += `│ › *${toSmallCaps('aktif')}:* ${uptimeStr}\n`;
    bodyText += `│ › *${toSmallCaps('waktu')}:* ${timeWIB} WIB\n`;
    bodyText += `└────────────────────\n\n`;

    bodyText += `_Silakan pilih menu kategori pada tombol list di bawah ini._`;

    // Buat sections untuk Single Select Button List dengan id & row_id lengkap
    const categoryRows = Object.keys(categorized).map(cat => ({
      header: 'Kategori',
      title: `${cat.toUpperCase()} MENU`,
      description: categoryDescriptions[cat] || `${categorized[cat].length} Perintah`,
      id: `${usedPrefix}menu ${cat.toLowerCase()}`,
      row_id: `${usedPrefix}menu ${cat.toLowerCase()}`
    }));

    const listSections = [
      {
        title: 'KATEGORI MENU',
        rows: categoryRows
      },
      {
        title: 'MENU PINTAS',
        rows: [
          {
            header: 'Pintas',
            title: 'Semua Perintah',
            description: 'Menampilkan seluruh daftar fitur lengkap',
            id: `${usedPrefix}allmenu`,
            row_id: `${usedPrefix}allmenu`
          },
          {
            header: 'Pintas',
            title: 'Profil Saya',
            description: 'Cek kartu profil, level, dan saldo',
            id: `${usedPrefix}profile`,
            row_id: `${usedPrefix}profile`
          },
          {
            header: 'Pintas',
            title: 'Aturan Bot',
            description: 'Panduan dan ketentuan pemakaian bot',
            id: `${usedPrefix}rules`,
            row_id: `${usedPrefix}rules`
          },
          {
            header: 'Pintas',
            title: 'Status Sistem',
            description: 'Cek RAM, CPU, dan spesifikasi server',
            id: `${usedPrefix}runtime`,
            row_id: `${usedPrefix}runtime`
          }
        ]
      }
    ];

    // Coba kirimkan dengan format Interactive Button List + Foto Header
    try {
      await sendButton(sock, m.chat, {
        title: toSmallCaps(config.botName || 'Antigravity Bot'),
        subtitle: 'Official WhatsApp Assistant',
        body: bodyText.trim(),
        footer: 'Antigravity Assistant • 2026',
        media: {
          image: bannerImage
        },
        buttons: [
          {
            name: 'single_select',
            params: {
              title: '☰ Buka Daftar Kategori',
              sections: listSections
            }
          },
          {
            name: 'quick_reply',
            params: {
              display_text: 'Semua Menu',
              id: `${usedPrefix}allmenu`
            }
          },
          {
            name: 'quick_reply',
            params: {
              display_text: 'Profil Akun',
              id: `${usedPrefix}profile`
            }
          }
        ]
      }, m);
    } catch (err) {
      // Fallback jika WhatsApp client tidak mendukung native flow interactive buttons:
      let fallbackText = bodyText + `\n\n┌───〔 *${toSmallCaps('daftar kategori')}* 〕\n`;
      for (const cat of Object.keys(categorized)) {
        fallbackText += `│ › \`${usedPrefix}menu ${cat.toLowerCase()}\` (${categorized[cat].length})\n`;
      }
      fallbackText += `└────────────────────\n\n`;
      fallbackText += `_Ketik \`${usedPrefix}allmenu\` untuk melihat seluruh perintah._`;

      await sock.sendMessage(m.chat, {
        image: bannerImage,
        caption: fallbackText.trim()
      }, { quoted: m });
    }
  }
};
