import fs from 'fs';
import path from 'path';
import { toSmallCaps, glyphs } from '../../utils/font.js';
import { formatSize } from '../../utils/format.js';

export default {
  name: 'listfiles',
  aliases: ['ls', 'dir', 'listfile', 'tree', 'listplugin', 'lp'],
  category: 'owner',
  description: 'Melihat daftar file dan folder dalam server (Owner Only)',
  ownerOnly: true,
  async run({ m, args, usedPrefix }) {
    const targetDirInput = args[0] || '.';
    const targetDirPath = path.resolve(process.cwd(), targetDirInput);
    const projectRoot = process.cwd();

    // Keamanan: Cek path traversal keluar root
    if (!targetDirPath.startsWith(projectRoot)) {
      return m.reply(`✕ *${toSmallCaps('akses ditolak')}:* ${toSmallCaps('tidak dapat mengakses direktori di luar root proyek.')}`);
    }

    if (!fs.existsSync(targetDirPath)) {
      return m.reply(`✕ *${toSmallCaps('tidak ditemukan')}:* ${toSmallCaps('folder tidak ditemukan di:')} \`${targetDirInput}\``);
    }

    const stats = fs.statSync(targetDirPath);
    if (!stats.isDirectory()) {
      return m.reply(`✕ *${toSmallCaps('bukan direktori')}:* \`${targetDirInput}\` ${toSmallCaps('adalah file. gunakan')} \`${usedPrefix}gf ${targetDirInput}\` ${toSmallCaps('untuk membacanya.')}`);
    }

    try {
      await m.react('📁');

      const items = fs.readdirSync(targetDirPath);
      const relativePath = path.relative(process.cwd(), targetDirPath) || './';

      if (items.length === 0) {
        return m.reply(`┌───〔 📁 *${toSmallCaps('folder kosong')}* 〕\n│ ${glyphs.arrow} \`${relativePath}\`\n└────────────────────`);
      }

      // Pisahkan folder dan file
      const dirEntries = [];
      const fileEntries = [];

      for (const item of items) {
        if (item === '.git' || item === 'node_modules') {
          dirEntries.push({ name: item, isDir: true, size: 0 });
          continue;
        }

        try {
          const itemPath = path.join(targetDirPath, item);
          const itemStat = fs.statSync(itemPath);
          if (itemStat.isDirectory()) {
            dirEntries.push({ name: item, isDir: true, size: 0 });
          } else {
            fileEntries.push({ name: item, isDir: false, size: itemStat.size });
          }
        } catch {}
      }

      dirEntries.sort((a, b) => a.name.localeCompare(b.name));
      fileEntries.sort((a, b) => a.name.localeCompare(b.name));

      let resultText = 
        `┌───〔 📂 *${toSmallCaps('file explorer')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('direktori')}:* \`${relativePath}\`\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('total item')}:* ${items.length}\n` +
        `├────────────────────\n`;

      for (const dir of dirEntries) {
        resultText += `│ 📁 *${dir.name}/*\n`;
      }

      for (const file of fileEntries) {
        resultText += `│ 📄 ${file.name} \`(${formatSize(file.size)})\`\n`;
      }

      resultText += 
        `└────────────────────\n` +
        `_› ${toSmallCaps(`gunakan ${usedPrefix}gf <path> untuk baca file`)}_\n` +
        `_› ${toSmallCaps(`gunakan ${usedPrefix}sf <path> untuk simpan file`)}_`;

      await m.reply(resultText);
    } catch (err) {
      await m.reply(`✕ *${toSmallCaps('gagal membaca folder')}:* ${err.message}`);
    }
  }
};
