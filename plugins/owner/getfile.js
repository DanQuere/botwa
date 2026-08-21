import fs from 'fs';
import path from 'path';
import { toSmallCaps, glyphs } from '../../utils/font.js';
import { formatSize } from '../../utils/format.js';

export default {
  name: 'getfile',
  aliases: ['gf', 'getplugin', 'gp', 'readfile', 'rf', 'cat'],
  category: 'owner',
  description: 'Mengambil atau membaca isi file dari server (Owner Only)',
  ownerOnly: true,
  async run({ sock, m, args, usedPrefix, command }) {
    if (!args[0]) {
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('cara penggunaan')}* 〕\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} plugins/owner/savefile.js\`\n` +
        `│ ${glyphs.arrow} \`${usedPrefix + command} package.json\`\n` +
        `└────────────────────`
      );
    }

    const targetPathInput = args[0];
    const targetFilePath = path.resolve(process.cwd(), targetPathInput);
    const projectRoot = process.cwd();

    // Keamanan: Cek path traversal keluar root
    if (!targetFilePath.startsWith(projectRoot)) {
      return m.reply(`✕ *${toSmallCaps('akses ditolak')}:* ${toSmallCaps('tidak dapat membaca file di luar root proyek.')}`);
    }

    if (!fs.existsSync(targetFilePath)) {
      return m.reply(`✕ *${toSmallCaps('tidak ditemukan')}:* ${toSmallCaps('file tidak ditemukan di:')} \`${targetPathInput}\``);
    }

    const stats = fs.statSync(targetFilePath);
    if (stats.isDirectory()) {
      return m.reply(`✕ *${toSmallCaps('peringatan')}:* ${toSmallCaps('target adalah folder. gunakan')} \`${usedPrefix}ls ${targetPathInput}\` ${toSmallCaps('untuk melihat daftar isinya.')}`);
    }

    try {
      await m.react('📄');

      const fileName = path.basename(targetFilePath);
      const ext = path.extname(targetFilePath).toLowerCase();
      const relativePath = path.relative(process.cwd(), targetFilePath);

      // Daftar ekstensi teks yang umum
      const textExtensions = [
        '.js', '.mjs', '.cjs', '.ts', '.json', '.txt', '.md', '.html', 
        '.css', '.env', '.yaml', '.yml', '.sh', '.nix', '.xml', '.svg'
      ];

      const isTextFile = textExtensions.includes(ext);

      // Jika file teks dan ukurannya tidak terlalu panjang untuk teks WA (<= 4096 bytes)
      if (isTextFile && stats.size <= 4096) {
        const fileContent = fs.readFileSync(targetFilePath, 'utf-8');
        const header = 
          `┌───〔 📄 *${toSmallCaps(fileName)}* 〕\n` +
          `│ ${glyphs.arrow} *${toSmallCaps('path')}:* \`${relativePath}\`\n` +
          `│ ${glyphs.arrow} *${toSmallCaps('ukuran')}:* ${formatSize(stats.size)}\n` +
          `└────────────────────\n\n`;

        const lang = ext.replace('.', '') || '';
        await m.reply(header + '```' + lang + '\n' + fileContent + '\n```');
      } else {
        // Kirim sebagai dokumen WhatsApp jika file besar atau file biner
        const fileBuffer = fs.readFileSync(targetFilePath);
        
        let mimetype = 'application/octet-stream';
        if (ext === '.js' || ext === '.mjs') mimetype = 'application/javascript';
        else if (ext === '.json') mimetype = 'application/json';
        else if (ext === '.txt') mimetype = 'text/plain';
        else if (ext === '.md') mimetype = 'text/markdown';
        else if (ext === '.zip') mimetype = 'application/zip';
        else if (ext === '.png') mimetype = 'image/png';
        else if (ext === '.jpg' || ext === '.jpeg') mimetype = 'image/jpeg';
        else if (ext === '.mp3') mimetype = 'audio/mpeg';
        else if (ext === '.mp4') mimetype = 'video/mp4';

        await sock.sendMessage(m.chat, {
          document: fileBuffer,
          fileName: fileName,
          mimetype: mimetype,
          caption: 
            `┌───〔 📁 *${toSmallCaps('file server')}* 〕\n` +
            `│ ${glyphs.arrow} *${toSmallCaps('file')}:* \`${fileName}\`\n` +
            `│ ${glyphs.arrow} *${toSmallCaps('path')}:* \`${relativePath}\`\n` +
            `│ ${glyphs.arrow} *${toSmallCaps('ukuran')}:* ${formatSize(stats.size)}\n` +
            `└────────────────────`
        }, { quoted: m });
      }
    } catch (err) {
      await m.reply(`✕ *${toSmallCaps('gagal membaca file')}:* ${err.message}`);
    }
  }
};
