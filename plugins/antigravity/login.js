import { toSmallCaps, glyphs } from '../../utils/font.js';
import antigravity from '../../lib/antigravity.js';

export default {
  name: 'agylogin',
  aliases: ['login', 'agyauth', 'auth', 'oauth', 'googlelogin'],
  category: 'ai',
  description: 'Mendapatkan link otentikasi resmi Google Antigravity (Google OAuth 2.0 PKCE)',
  async run({ m, q, usedPrefix, command }) {
    await m.react('🔑');

    // Jika user langsung memasukkan token/kode di belakang perintah (contoh: /login 4/0A... atau /login AIzaSy...)
    if (q && q.trim()) {
      try {
        const result = await antigravity.login(m.sender, q.trim());
        const session = result.session;
        const masked = q.trim().slice(0, 8) + '...' + q.trim().slice(-4);
        const authTypeLabel = result.type === 'oauth' ? 'Google OAuth 2.0 (Official Antigravity)' : 'Google AI Studio Key';

        const caption = 
          `┌───〔 ${glyphs.check} *${toSmallCaps('antigravity terhubung')}* 〕\n` +
          `│ ${glyphs.arrow} *${toSmallCaps('metode')}:* ${authTypeLabel}\n` +
          `│ ${glyphs.arrow} *${toSmallCaps('status')}:* ${toSmallCaps('sesi aktif & siap digunakan')}\n` +
          `│ ${glyphs.arrow} *${toSmallCaps('token')}:* \`${masked}\`\n` +
          `│ ${glyphs.arrow} *${toSmallCaps('model')}:* \`${session.model}\`\n` +
          `└────────────────────\n` +
          `_› ${toSmallCaps(`mulai obrolan dengan mengetik: ${usedPrefix}agy <pertanyaan>`)}_\n` +
          `_› ${toSmallCaps('atau kirim pesan langsung di DM tanpa command!')}_`;

        return m.reply(caption);
      } catch (err) {
        return m.reply(`✕ *${toSmallCaps('gagal login')}:* ${err.message}`);
      }
    }

    // Generate dynamic Google OAuth 2.0 PKCE URL untuk user JID ini
    const oauthUrl = antigravity.getOAuthUrl(m.sender);

    const caption = 
      `┌───〔 🔑 *${toSmallCaps('google antigravity login')}* 〕\n` +
      `│ Select login method:\n` +
      `│  > 1. Google OAuth\n` +
      `│   [Use arrow keys to navigate, Enter to select]\n` +
      `│\n` +
      `│ 🔗 *Tautan Otentikasi Google Antigravity:*\n` +
      `│ ${oauthUrl}\n` +
      `│\n` +
      `│ 📋 *Langkah Aktivasi Sesi:*\n` +
      `│ 1. Buka tautan otorisasi di atas melalui peramban/browser.\n` +
      `│ 2. Login dengan akun Google kamu lalu klik *Izinkan / Continue*.\n` +
      `│ 3. Salin *Authorization Code* (\`4/0A...\`) yang muncul di halaman callback.\n` +
      `│ 4. Kirim kode ke bot untuk verifikasi:\n` +
      `│    \`${usedPrefix}token <kode>\` atau \`${usedPrefix}agytoken <kode>\`\n` +
      `│\n` +
      `│ 💡 *Alternatif API Key (Google AI Studio):*\n` +
      `│ Buat API Key di: https://aistudio.google.com/app/apikey\n` +
      `│ Lalu kirim: \`${usedPrefix}token AIzaSy...\`\n` +
      `└────────────────────\n` +
      `_› ${toSmallCaps('setelah login, bot dapat dijalankan di mana saja (panel/vps/hosting) tanpa error!')}_`;

    await m.reply(caption);
  }
};

