# 🤖 WhatsApp Bot Baileys 7.0.0-rc14 (ESM Modular 2026)

Bot WhatsApp modern, modular, dan siap production yang dibangun menggunakan **Node.js (v18 - v22)** dan **`@whiskeysockets/baileys` v7.0.0-rc.14**.

---

## 🌟 Fitur Unggulan Terbaru (2026 Edition)

### 1. 🎨 Sticker Studio Pro (Sharp + FFmpeg + WebpMux)
- **Universal Media to Sticker (`.s` / `.sticker`)**: Mendukung foto langsung/quoted, video, GIF, dokumen gambar, ViewOnce, dan URL web.
- **Watermark & EXIF Editor (`.wm` / `.swm` / `.take`)**: Ganti nama packname & author stiker secara instan.
- **Sticker to Image (`.toimg` / `.topng`)**: Konversi stiker statis/animasi menjadi foto PNG beresolusi tinggi.
- **Sticker to Video / GIF (`.tovideo` / `.togif`)**: Konversi stiker animasi menjadi video MP4 (H.264 kompatibel penuh) atau animasi GIF.
- **Meme Sticker Generator (`.smeme`)**: Buat stiker meme dengan teks atas dan bawah berformat font Impact tebal bergaris tepi (stroke).
- **Circle Sticker Maker (`.scircle`)**: Buat stiker bulat/lingkaran dengan background transparan.
- **Emoji Mixer (`.emojimix`)**: Gabungkan dua emoji menjadi stiker unik via Google Emoji Kitchen.
- **Text to Sticker (`.attp` / `.ttp`)**: Buat stiker teks berwarna dan bergaya modern.

### 2. 🔘 Interactive Buttons, Carousel & Lists (WhatsApp Native Flow 2026)
- **Tombol Interaktif Modern (`.button`)**:
  - `quick_reply`: Tombol respon cepat / trigger perintah bot.
  - `cta_url`: Tombol tautan langsung ke browser/website.
  - `cta_call`: Tombol panggilan telepon langsung ke kontak/CS.
  - `cta_copy`: Tombol salin kode/voucher/skrip ke clipboard pengguna.
  - `cta_reminder`: Tombol pengingat jadwal / reminder.
- **Multi-Card Carousel Messages (`.carousel`)**: Pesan kartu horizontal yang dapat digeser (swipe) dengan gambar, judul, deskripsi, dan tombol aksi mandiri di setiap kartu (hingga 10 kartu).
- **Interactive List Selector (`.listmsg`)**: Menu dropdown bertingkat dengan header, baris, deskripsi, dan badge sorotan (`HOT`, `NEW`, `VIP`).

### 3. 📦 Dukungan Lengkap Segala Media WhatsApp & Business (`.media`)
- **🎙️ Voice Note / PTT**: Pesan suara audio dengan visual waveform audio player.
- **📄 Document**: Pengiriman file/dokumen dengan kustomisasi nama file, thumbnail, ekstensi, dan page count.
- **👤 Contact (vCard)**: Pengiriman kartu kontak perorangan atau multi-kontak vCard 3.0.
- **📍 Location & Live Location**: Lokasi maps statis dan live location realtime dengan akurasi & kecepatan.
- **📊 Interactive Poll**: Polling voting single-select maupun multi-select.
- **👁️ ViewOnce Media**: Pengiriman foto, video, dan voice note sekali lihat.
- **🛍️ WhatsApp Business Product Card**: Katalog produk lengkap dengan harga, mata uang, gambar produk, dan retailer ID.
- **🧾 WhatsApp Business Order Receipt**: Nota tagihan dan struk belanja interaktif.
- **🖼️ Media Album**: Pengelompokan pengiriman multi-foto/video dalam satu album pesan.

### 4. 🧠 Integrasi Antigravity AI Engine (Gemini 3.7 & Claude)
- Mendukung model Gemini 3.7 Flash High Reasoning, Gemini Pro, Claude Sonnet, Google OAuth 2.0 PKCE, Vision AI, dan Auto AI Chat.

---

## 📁 Struktur Direktori

```text
├── settings.js              # File konfigurasi utama (Bot Name, Owner, Prefix, Pairing/QR, dsb.)
├── config/
│   └── config.js            # Re-export settings.js untuk backward-compatibility
├── database/
│   ├── index.js             # Manager database JSON terisolasi
│   ├── db.json              # Data persistensi pengguna, grup, statistik
│   └── antigravity_sessions.json # Sesi AI Antigravity
├── lib/
│   ├── connection.js        # Inisialisasi socket Baileys, Pairing & QR, Reconnect
│   ├── handler.js           # Plugin loader, command router, permissions, cooldown
│   ├── interactive.js       # Builder & sender tombol Native Flow, Carousel, List & Business Media
│   ├── serialize.js         # Serialisasi pesan, ekstraksi teks, helper reply & react, LID resolving
│   ├── store.js             # Cache kontak, metadata grup, dan mapping LID <-> PNJID
│   ├── sticker.js           # Engine stiker Sharp + FFmpeg + WebpMux (Sticker, Meme, Circle, Video)
│   ├── antigravity.js       # Engine AI Antigravity, OAuth PKCE, Token Manager
│   └── uploader.js          # Helper upload file/buffer ke CDN
├── utils/
│   ├── cleaner.js           # Auto-cleaner pre-key sessions
│   ├── font.js              # Typography Small Caps & Glyphs
│   ├── format.js            # Utility durasi, ukuran file, format angka
│   ├── logger.js            # Pino logger
│   └── scraper.js           # Scraper TikTok, YouTube, AI
├── plugins/
│   ├── ai/                  # AI chat plugins
│   ├── antigravity/         # Antigravity suite plugins
│   ├── button/              # Button, Carousel, ListMsg, Media, InfoButton (Dedicated Category)
│   ├── downloader/          # TikTok, YouTube downloader
│   ├── group/               # Group administration plugins
│   ├── main/                # Menu, ping, speed, owner, profile
│   ├── owner/               # Owner controls & settings
│   ├── sticker/             # Sticker, SWM, ToImg, ToVideo, SMeme, SCircle, EmojiMix, ATTP
│   └── tools/               # QR, Translate, Quoted, Inspect
├── sessions/                # Sesi kredensial WhatsApp
├── index.js                 # Entry point bot
├── package.json             # Dependencies & skrip npm
└── README.md                # Dokumentasi bot
```

---

## 🚀 Panduan Instalasi & Menjalankan Bot

### 1. Prasyarat Sistem
- **Node.js**: Versi `18.x`, `20.x`, atau `22.x`
- **FFmpeg & ImageMagick / LibWebP**: Sudah terpasang di sistem.

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Bot
Buka `settings.js` dan sesuaikan nomor WhatsApp Anda:
```javascript
export const settings = {
  botName: 'Antigravity Bot',
  ownerName: 'Owner',
  owners: ['6281234567890'],
  authMode: 'pairing', // 'pairing' atau 'qr'
  pairingNumber: '6281234567890',
  ...
};
```

### 4. Menjalankan Bot
```bash
npm start
```

---

## 🛠️ Panduan Membuat Fitur / Plugin Baru

Setiap fitur ditaruh dalam satu file di folder `/plugins/<kategori>/<nama_fitur>.js`. Hot Reload aktif otomatis!

### Contoh 1: Plugin dengan Tombol Interaktif (Native Flow Buttons)
```javascript
export default {
  name: 'contohbutton',
  category: 'tools',
  description: 'Contoh plugin dengan tombol',
  async run({ sock, m, usedPrefix }) {
    await sock.sendButton(m.chat, {
      title: 'Judul Pesan',
      body: 'Ini adalah isi pesan dengan tombol.',
      footer: '© 2026 Antigravity Bot',
      buttons: [
        { name: 'quick_reply', params: { display_text: '⚡ Cek Ping', id: `${usedPrefix}ping` } },
        { name: 'cta_url', params: { display_text: '🌐 Kunjungi Web', url: 'https://whatsapp.com' } },
        { name: 'cta_copy', params: { display_text: '📋 Salin Kode', copy_code: 'KODE-123' } }
      ]
    }, m);
  }
};
```

### Contoh 2: Plugin dengan Carousel Swipeable Cards
```javascript
export default {
  name: 'contohcarousel',
  category: 'tools',
  description: 'Contoh plugin dengan kartu carousel',
  async run({ sock, m, usedPrefix }) {
    await sock.sendCarousel(m.chat, {
      body: 'Pilih paket di bawah:',
      footer: 'Geser ke samping ➡️',
      cards: [
        {
          title: 'Paket Basic',
          body: 'Fitur dasar bot WhatsApp',
          footer: 'Gratis',
          buttons: [{ name: 'quick_reply', params: { display_text: 'Pilih Basic', id: `${usedPrefix}menu` } }]
        },
        {
          title: 'Paket VIP',
          body: 'Unlimited AI & Stiker tanpa batas',
          footer: 'Premium',
          buttons: [{ name: 'quick_reply', params: { display_text: 'Beli VIP', id: `${usedPrefix}owner` } }]
        }
      ]
    }, m);
  }
};
```

### Contoh 3: Plugin Pembuatan Stiker Kustom
```javascript
import { createSticker } from '../../lib/sticker.js';

export default {
  name: 'mycustomsticker',
  category: 'sticker',
  description: 'Membuat stiker kustom',
  async run({ sock, m }) {
    const buffer = await m.quoted?.download() || await m.download();
    if (!buffer) return m.reply('Kirim/reply media gambar/video!');

    const sticker = await createSticker(buffer, {
      packname: 'My Custom Pack',
      author: 'My Name',
      type: 'crop' // 'crop' | 'full' | 'circle'
    });

    await sock.sendMessage(m.chat, { sticker }, { quoted: m });
  }
};
```

---

## 📜 Lisensi
MIT License © 2026 Antigravity Team
