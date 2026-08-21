import fs from 'fs';
import path from 'path';
import { toSmallCaps, glyphs } from '../../utils/font.js';
import { formatSize } from '../../utils/format.js';

export default {
  name: 'deletefile',
  aliases: ['df', 'delfile', 'delplugin', 'dp', 'rmfile', 'rm'],
  category: 'owner',
  description: 'Menghapus file atau folder dari server bot (Owner Only)',
  ownerOnly: true,
  async run({ m, args, usedPrefix, command }) {
    if (!args[0]) {
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('cara penggunaan')}* 〕\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} plugins/tools/sample.js\`\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} tmp/output.png\`\n` +
        `└────────────────────`
      );
    }

    const targetPathInput = args[0];
    const targetFilePath = path.resolve(process.cwd(), targetPathInput);
    const projectRoot = process.cwd();

    // Keamanan: Cek path traversal keluar root
    if (!targetFilePath.startsWith(projectRoot)) {
      return m.reply(`✕ *${toSmallCaps('akses ditolak')}:* ${toSmallCaps('tidak dapat menghapus file di luar root proyek.')}`);
    }

    // Proteksi file & direktori sistem utama
    const protectedPaths = [
      projectRoot,
      path.resolve(projectRoot, 'package.json'),
      path.resolve(projectRoot, 'package-lock.json'),
      path.resolve(projectRoot, 'index.js'),
      path.resolve(projectRoot, 'settings.js'),
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(projectRoot, '.git'),
      path.resolve(projectRoot, 'lib'),
      path.resolve(projectRoot, 'lib/handler.js'),
      path.resolve(projectRoot, 'lib/connection.js'),
      path.resolve(projectRoot, 'lib/serialize.js'),
      path.resolve(projectRoot, 'lib/store.js'),
      path.resolve(projectRoot, 'database'),
      path.resolve(projectRoot, 'sessions')
    ];

    if (protectedPaths.includes(targetFilePath)) {
      return m.reply(`✕ *${toSmallCaps('keamanan')}:* ${toSmallCaps('file atau folder sistem ini dilindungi dan tidak boleh dihapus.')}`);
    }

    if (!fs.existsSync(targetFilePath)) {
      return m.reply(`✕ *${toSmallCaps('tidak ditemukan')}:* ${toSmallCaps('file atau folder tidak ada di path:')} \`${targetPathInput}\``);
    }

    try {
      const stats = fs.statSync(targetFilePath);
      const isDirectory = stats.isDirectory();
      const relativePath = path.relative(process.cwd(), targetFilePath);
      const sizeStr = isDirectory ? toSmallCaps('folder') : formatSize(stats.size);

      if (isDirectory) {
        fs.rmSync(targetFilePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(targetFilePath);
      }

      await m.react('🗑️');

      const caption = 
        `┌───〔 ${glyphs.check} *${toSmallCaps('sukses hapus file')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('target')}:* \`${relativePath}\`\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('tipe')}:* ${isDirectory ? toSmallCaps('folder / direktori') : toSmallCaps('file')}\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('ukuran')}:* ${sizeStr}\n` +
        `└────────────────────\n` +
        `_› ${toSmallCaps('file berhasil dihapus dan otomatis di-unload dari memori.')}_`;

      await m.reply(caption);
    } catch (err) {
      await m.reply(`✕ *${toSmallCaps('gagal menghapus')}:* ${err.message}`);
    }
  }
};
