import fs from 'fs';
import path from 'path';
import syntaxError from 'syntax-error';
import { toSmallCaps, glyphs } from '../../utils/font.js';
import { formatSize } from '../../utils/format.js';

export default {
  name: 'savefile',
  aliases: ['sf', 'svf', 'saveplugin', 'sp'],
  category: 'owner',
  description: 'Menyimpan kode, file teks, atau media ke dalam sistem bot (Owner Only)',
  ownerOnly: true,
  async run({ m, args, q, usedPrefix, command }) {
    if (!args[0]) {
      return m.reply(
        `┌───〔 ${glyphs.diamond} *${toSmallCaps('cara penggunaan')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('reply kode / teks')}:*\n` +
        `│   \`${usedPrefix + command} plugins/owner/test.js\`\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('reply media / file')}:*\n` +
        `│   \`${usedPrefix + command} database/backup.zip\`\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('langsung dengan teks')}:*\n` +
        `│   \`${usedPrefix + command} file.txt Halo Dunia\`\n` +
        `└────────────────────`
      );
    }

    const targetPathInput = args[0];
    const targetFilePath = path.resolve(process.cwd(), targetPathInput);
    const projectRoot = process.cwd();

    // Keamanan: cegah path traversal berbahaya keluar dari root project
    if (!targetFilePath.startsWith(projectRoot)) {
      return m.reply(`✕ *${toSmallCaps('akses ditolak')}:* ${toSmallCaps('tidak dapat menulis file di luar root proyek.')}`);
    }

    let contentToSave = null;
    let isBinary = false;

    // 1. Cek jika reply ke media / dokumen / audio / gambar / video
    if (m.quoted && typeof m.quoted.download === 'function' && (m.quoted.type !== 'conversation' && m.quoted.type !== 'extendedTextMessage')) {
      try {
        const buffer = await m.quoted.download();
        if (buffer && buffer.length > 0) {
          contentToSave = buffer;
          isBinary = true;
        }
      } catch {}
    }

    // 2. Jika bukan media buffer, cek jika reply ke pesan teks
    if (!contentToSave && m.quoted && m.quoted.text) {
      contentToSave = m.quoted.text;
    }

    // 3. Jika tidak reply, cek jika ada isi teks di argumen setelah path
    if (!contentToSave && args.length > 1) {
      contentToSave = q.slice(targetPathInput.length).trim();
    }

    if (!contentToSave) {
      return m.reply(`✕ *${toSmallCaps('gagal')}:* ${toSmallCaps('harap reply pesan berisi kode/media atau sertakan konten teks setelah nama file.')}`);
    }

    // Jika file .js dan isinya berupa string, lakukan pengecekan syntax error sebelum disimpan
    if (targetFilePath.endsWith('.js') && typeof contentToSave === 'string') {
      const err = syntaxError(contentToSave, targetPathInput, {
        sourceType: 'module',
        allowAwaitOutsideFunction: true,
        ecmaVersion: 2024
      });
      if (err) {
        return m.reply(
          `┌───〔 ${glyphs.cross} *${toSmallCaps('syntax error detected')}* 〕\n` +
          `│ ${glyphs.arrow} *${toSmallCaps('file')}:* ${targetPathInput}\n` +
          `│ ${glyphs.arrow} *${toSmallCaps('error')}:*\n` +
          `│ \`\`\`${err.toString()}\`\`\`\n` +
          `└────────────────────\n` +
          `_› ${toSmallCaps('perbaiki kesalahan sintaks sebelum disimpan.')}_`
        );
      }
    }

    try {
      const parentDir = path.dirname(targetFilePath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      const isNew = !fs.existsSync(targetFilePath);
      fs.writeFileSync(targetFilePath, contentToSave);

      const stats = fs.statSync(targetFilePath);
      const relativePath = path.relative(process.cwd(), targetFilePath);

      await m.react('✅');

      const caption = 
        `┌───〔 ${glyphs.check} *${toSmallCaps('sukses simpan file')}* 〕\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('lokasi')}:* \`${relativePath}\`\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('ukuran')}:* ${formatSize(stats.size)}\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('status')}:* ${isNew ? toSmallCaps('file baru dibuat') : toSmallCaps('file diperbarui')}\n` +
        `│ ${glyphs.arrow} *${toSmallCaps('tipe')}:* ${isBinary ? toSmallCaps('binary / media') : toSmallCaps('teks / source code')}\n` +
        `└────────────────────\n` +
        `_› ${toSmallCaps('file tersimpan dan otomatis dimuat oleh hot reload.')}_`;

      await m.reply(caption);
    } catch (err) {
      await m.reply(`✕ *${toSmallCaps('gagal menyimpan file')}:* ${err.message}`);
    }
  }
};
