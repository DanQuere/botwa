import config from '../../config/config.js';
import { toSmallCaps, glyphs } from '../../utils/font.js';

export default {
  name: 'menucat',
  aliases: [
    'category', 'kategori',
    'aimenu', 'toolsmenu', 'gamemenu', 'funmenu',
    'groupmenu', 'islamicmenu', 'quotesmenu', 'convertermenu',
    'economymenu', 'makermenu', 'ownermenu', 'usermenu', 'stickermenu', 'downloadermenu'
  ],
  category: 'main',
  description: 'Menampilkan daftar perintah dalam kategori tertentu',
  async run({ sock, m, q, command, plugins, usedPrefix = '.', isOwner }) {
    let rawQuery = q || '';
    if (!rawQuery && command && command.endsWith('menu') && command !== 'menu' && command !== 'allmenu') {
      rawQuery = command.replace(/menu$/i, '');
    }
    if (!rawQuery) {
      return m.reply(`📂 *Pilih Kategori Menu*\n\nContoh: \`${usedPrefix}menucat fun\` atau \`${usedPrefix}menucat tools\`\nKetik \`${usedPrefix}menu\` untuk melihat seluruh daftar kategori.`);
    }

    let cleanQuery = rawQuery.trim().replace(/^[.#/!?]/, '').replace(/^menu\s+/i, '').replace(/\s+menu$/i, '').trim().toUpperCase();
    const categorized = {};
    const seenNames = new Set();

    for (const [name, plugin] of plugins.entries()) {
      const primaryName = plugin.name || name;
      if (seenNames.has(primaryName)) continue;
      seenNames.add(primaryName);

      const category = (plugin.category || 'other').toUpperCase();
      if (!categorized[category]) categorized[category] = [];
      categorized[category].push({
        name: primaryName,
        desc: plugin.description || '',
        ownerOnly: !!plugin.ownerOnly,
        premiumOnly: !!plugin.premiumOnly,
        adminOnly: !!plugin.adminOnly,
        groupOnly: !!plugin.groupOnly
      });
    }

    const catKey = Object.keys(categorized).find(k => (
      k === cleanQuery ||
      k.toLowerCase() === cleanQuery.toLowerCase() ||
      k.startsWith(cleanQuery) ||
      cleanQuery.startsWith(k)
    ));

    if (!catKey || !categorized[catKey]) {
      const available = Object.keys(categorized).map(c => `• ${c.toLowerCase()}`).join('\n');
      return m.reply(`✕ Kategori *${rawQuery}* tidak ditemukan.\n\n*Kategori Tersedia:*\n${available}`);
    }

    if (catKey === 'OWNER' && !isOwner) {
      return m.reply(config.messages.ownerOnly);
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

    const icon = categoryIcons[catKey] || '📁';
    let text = `┌───〔 ${icon} *${toSmallCaps(catKey + ' MENU')}* 〕\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('total fitur')}:* ${categorized[catKey].length} perintah\n`;
    text += `│ ${glyphs.arrow} *${toSmallCaps('prefix')}:* \`${usedPrefix}\`\n`;
    text += `└────────────────────\n\n`;

    for (const cmd of categorized[catKey]) {
      const flag = cmd.ownerOnly ? ' ◈' : (cmd.premiumOnly ? ' ✦' : (cmd.adminOnly ? ' ◇' : (cmd.groupOnly ? ' ⌗' : '')));
      text += `│ ${glyphs.arrow} \`${usedPrefix}${cmd.name}\`${flag}\n`;
      if (cmd.desc) {
        text += `│   └ _${toSmallCaps(cmd.desc)}_\n`;
      }
    }
    text += `└────────────────────\n\n`;
    text += `_› ${toSmallCaps('keterangan simbol: ◈ owner | ✦ premium | ◇ admin | ⌗ grup')}_`;

    await m.reply(text.trim());
  }
};
