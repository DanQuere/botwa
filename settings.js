// VoIP WebRTC Relay Configuration for Cloud / Web clients
process.env.CALL_RELAY_PORT_MODE = 'web';
process.env.CALL_DISABLE_IPV6 = '1';

export const settings = {
  // Informasi Dasar Bot
  botName: 'Antigravity Bot',
  ownerName: 'Antigravity Owner',
  bannerPath: './assets/banner.jpg',
  
  // Daftar nomor owner bot (format internasional tanpa +, contoh: '6281234567890')
  owners: ['6283896757956', '26809672417297', '6282389924037'],

  // Prefix perintah (bisa berupa array karakter atau string)
  prefixes: ['.', '#', '!', '/', '?'],

  // Mode Autentikasi:
  // 'pairing' -> Login menggunakan Pairing Code 8 digit (direkomendasikan)
  // 'qr'      -> Login menggunakan QR Code di terminal
  authMode: 'pairing',

  // Nomor WhatsApp untuk pairing code (wajib diisi jika authMode = 'pairing', format: '6281234567890')
  pairingNumber: '6282389924037',

  // Lokasi penyimpanan session & database
  sessionDir: './sessions',
  databasePath: './database/db.json',

  // Metadata default untuk stiker WhatsApp (Watermark)
  sticker: {
    packname: 'Antigravity Bot',
    author: 'WhatsApp Bot 2026'
  },

  // Waktu jeda (cooldown / anti-spam) per user dalam milidetik (2500ms = 2.5 detik)
  cooldownMs: 2500,

  // Limit & User Management
  defaultLimit: 25,     // Limit harian untuk user Free
  premiumLimit: 1000,   // Limit untuk user Premium (atau unlimited)
  resetLimitHour: 0,    // Jam reset limit harian (0 = jam 00:00 tengah malam)

  // Auto-Clear Session (Membersihkan file junk pre-key session agar bot tetap ringan & stabil)
  autoClearSession: true,
  clearSessionIntervalMs: 6 * 60 * 60 * 1000, // Tiap 6 jam (dalam ms)

  // Pengaturan Perilaku Bot
  selfMode: false,   // Jika true, hanya owner yang bisa menjalankan command
  autoRead: false,   // Jika true, bot otomatis centang biru membaca pesan masuk
  autoTyping: false, // Jika true, bot menampilkan status mengetik sebelum merespons
  autoViewSw: true,  // Jika true, bot otomatis melihat status/story WhatsApp
  autoReactSw: true, // Jika true, bot otomatis memberi reaction emoji ke status/story WhatsApp
  swEmojis: ['🐔', '🗿', '🦄', '🤖', '👑', '🔥', '⚡', '🐧', '🦊'], // Emoji unik untuk auto-react story
  logLevel: 'info',  // Level logging: 'info', 'debug', 'warn', 'error'

  // Pesan Respon Sistem (Modern Small Caps & Minimalist Glyphs)
  messages: {
    wait: '✦ _ꜱᴇᴅᴀɴɢ ᴅɪᴘʀᴏꜱᴇꜱ, ᴍᴏʜᴏɴ ᴛᴜɴɢɢᴜ ꜱᴇʙᴇɴᴛᴀʀ..._',
    error: '✕ _ᴛᴇʀᴊᴀᴅɪ ᴋᴇꜱᴀʟᴀʜᴀɴ ꜱᴀᴀᴛ ᴍᴇᴍᴘʀᴏꜱᴇꜱ ᴘᴇʀɪɴᴛᴀʜ._',
    ownerOnly: '◈ _ᴀᴋꜱᴇꜱ ᴅɪᴛᴏʟᴀᴋ: ʜᴀɴʏᴀ ᴜɴᴛᴜᴋ ᴏᴡɴᴇʀ ʙᴏᴛ._',
    groupOnly: '◈ _ᴘᴇʀɪɴᴛᴀʜ ɪɴɪ ʜᴀɴʏᴀ ᴅᴀᴘᴀᴛ ᴅɪɢᴜɴᴀᴋᴀɴ ᴅɪ ᴅᴀʟᴀᴍ ɢʀᴜᴘ._',
    privateOnly: '◈ _ᴘᴇʀɪɴᴛᴀʜ ɪɴɪ ʜᴀɴʏᴀ ᴅᴀᴘᴀᴛ ᴅɪɢᴜɴᴀᴋᴀɴ ᴅɪ ᴘʀɪᴠᴀᴛᴇ ᴄʜᴀᴛ._',
    adminOnly: '◈ _ᴀᴋꜱᴇꜱ ᴅɪᴛᴏʟᴀᴋ: ʜᴀɴʏᴀ ᴜɴᴛᴜᴋ ᴀᴅᴍɪɴ ɢʀᴜᴘ._',
    botAdminOnly: '◈ _ʙᴏᴛ ʜᴀʀᴜꜱ ᴍᴇɴᴊᴀᴅɪ ᴀᴅᴍɪɴ ɢʀᴜᴘ ᴜɴᴛᴜᴋ ᴍᴇɴᴊᴀʟᴀɴᴋᴀɴ ꜰɪᴛᴜʀ ɪɴɪ._',
    cooldown: '◌ _ᴍᴏʜᴏɴ ᴛᴜɴɢɢᴜ ʙᴇʙᴇʀᴀᴘᴀ ꜱᴀᴀᴛ ꜱᴇʙᴇʟᴜᴍ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ᴘᴇʀɪɴᴛᴀʜ ᴋᴇᴍʙᴀʟɪ._',
    limitEmpty: '✕ _ʟɪᴍɪᴛ ʜᴀʀɪᴀɴ ᴋᴀᴍᴜ ꜱᴜᴅᴀʜ ʜᴀʙɪꜱ. ꜱɪʟᴀᴋᴀɴ ᴛᴜɴɢɢᴜ ʀᴇꜱᴇᴛ ʜᴀʀɪᴀɴ ᴀᴛᴀᴜ ᴜᴘɢʀᴀᴅᴇ ᴋᴇ ᴠɪᴘ ᴘʀᴇᴍɪᴜᴍ._'
  },

  // API Keys & Konfigurasi Eksternal
  api: {
    neoxr: {
      baseUrl: 'https://api.neoxr.eu/api',
      apiKey: 'daniel001'
    }
  },
  neoxrApiKey: 'daniel001'
};

// Aliases & Global definitions
export const config = settings;
global.settings = settings;
global.config = settings;

export default settings;
