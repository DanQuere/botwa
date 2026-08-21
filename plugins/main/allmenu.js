import fs from 'fs';
import config from '../../config/config.js';
import db from '../../database/index.js';
import { formatDuration, formatNumber, getTimeGreeting, getWIBTime } from '../../utils/format.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'allmenu',
  aliases: ['allcommands', 'semuamenu', 'listall'],
  category: 'main',
  description: 'Menampilkan seluruh daftar perintah bot secara lengkap',
  async run({ sock, m, plugins, usedPrefix = '.', isOwner, isPremium, user }) {
    const uptime = formatDuration(process.uptime() * 1000);
    const totalCmds = db.data.stats.totalCommands || 0;

    // Group distinct plugins by category
    const categorized = {};
    const seenNames = new Set();

    for (const [name, plugin] of plugins.entries()) {
      const primaryName = plugin.name || name;
      if (seenNames.has(primaryName)) continue;
      seenNames.add(primaryName);

      const category = (plugin.category || 'other').toUpperCase();
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push({
        name: primaryName,
        desc: plugin.description || '',
        ownerOnly: !!plugin.ownerOnly,
        premiumOnly: !!plugin.premiumOnly,
        adminOnly: !!plugin.adminOnly,
        groupOnly: !!plugin.groupOnly
      });
    }

    const categoryIcons = {
      MAIN: '🏠',
      AI: '🤖',
      ANTIGRAVITY: '⚡',
      BUTTON: '🔘',
      DOWNLOADER: '📥',
      GROUP: '👥',
      GAME: '🎮',
      FUN: '🎉',
      TOOLS: '🛠️',
      USER: '📊',
      STICKER: '🖼️',
      ISLAMIC: '🕌',
      QUOTES: '📜',
      CONVERTER: '🔄',
      ECONOMY: '💰',
      MAKER: '🎨',
      OWNER: '👑',
      OTHER: '📁'
    };

    const statusLabel = isOwner ? toSmallCaps('owner') : (isPremium ? toSmallCaps('vip premium') : toSmallCaps('free user'));
    const limitLabel = (isOwner || isPremium) ? glyphs.infinite : `${user?.limit ?? 25}`;

    let menuText = `┌───〔 ${glyphs.diamond} *${toSmallCaps(config.botName + ' ALL MENU')}* 〕\n`;
    menuText += `│ ${glyphs.arrow} *${toSmallCaps('user')}:* ${m.pushName || 'User'}\n`;
    menuText += `│ ${glyphs.arrow} *${toSmallCaps('status')}:* ${statusLabel}\n`;
    menuText += `│ ${glyphs.arrow} *${toSmallCaps('limit')}:* ${limitLabel}\n`;
    menuText += `│ ${glyphs.arrow} *${toSmallCaps('total fitur')}:* ${seenNames.size} perintah\n`;
    menuText += `│ ${glyphs.arrow} *${toSmallCaps('uptime')}:* ${uptime}\n`;
    menuText += `│ ${glyphs.arrow} *${toSmallCaps('prefix')}:* [ ${config.prefixes.join(' ')} ]\n`;
    menuText += `└────────────────────\n\n`;

    const sortedCategories = Object.keys(categorized).sort();

    for (const cat of sortedCategories) {
      if (cat === 'OWNER' && !isOwner) continue;
      const icon = categoryIcons[cat] || '📁';
      menuText += `┌───〔 ${icon} *${toSmallCaps(cat)}* 〕\n`;
      for (const cmd of categorized[cat]) {
        const flag = cmd.ownerOnly ? ' ◈' : (cmd.premiumOnly ? ' ✦' : (cmd.adminOnly ? ' ◇' : (cmd.groupOnly ? ' ⌗' : '')));
        menuText += `│ ${glyphs.arrow} \`${usedPrefix}${cmd.name}\`${flag}\n`;
      }
      menuText += `└────────────────────\n\n`;
    }

    menuText += `_› ${toSmallCaps('keterangan simbol: ◈ owner | ✦ premium | ◇ admin | ⌗ grup')}_\n`;
    menuText += `_› ${toSmallCaps(`gunakan prefix ${usedPrefix} diikuti nama perintah.`)}_`;

    let bannerImage = config.bannerPath || './assets/banner.jpg';
    if (typeof bannerImage === 'string' && fs.existsSync(bannerImage)) {
      try { bannerImage = fs.readFileSync(bannerImage); } catch {}
    }

    try {
      await sock.sendMessage(m.chat, {
        image: bannerImage,
        caption: menuText.trim()
      }, { quoted: m });
    } catch {
      await m.reply(menuText.trim());
    }
  }
};
