import interactive from '../../lib/interactive.js';
import config from '../../config/config.js';
import { toSmallCaps } from '../../utils/font.js';
import sharp from 'sharp';

export default {
  name: 'media',
  aliases: ['sendmedia', 'wamedia', 'tesmedia'],
  category: 'button',
  description: 'Pengujian pengiriman segala jenis tipe media WhatsApp & Business terbaru',
  async run({ sock, m, q, usedPrefix }) {
    const subType = (q || '').toLowerCase().trim();

    if (!subType) {
      return sock.sendButton(m.chat, {
        title: `📦 *${toSmallCaps('whatsapp & business media suite')}*`,
        body:
          `Pengujian *seluruh jenis format pesan dan media WhatsApp biasa maupun Business*:\n\n` +
          `1. 🎙️ *Voice Note / PTT:* Pesan suara dengan waveform\n` +
          `2. 📄 *Document:* Dokumen dengan thumbnail & custom name\n` +
          `3. 👤 *Contact (vCard):* Kontak individual / Multi-kontak\n` +
          `4. 📍 *Location:* Lokasi maps & Live location realtime\n` +
          `5. 📊 *Poll:* Polling voting single / multi-select\n` +
          `6. 👁️ *ViewOnce:* Foto/video sekali lihat\n` +
          `7. 🛍️ *Product Card:* Katalog produk WhatsApp Business\n` +
          `8. 🧾 *Order Receipt:* Nota tagihan & struk pesanan\n\n` +
          `_Pilih tombol di bawah untuk mencoba pengiriman jenis media:_`,
        footer: `© 2026 ${config.botName} • All Media Types`,
        buttons: [
          { name: 'quick_reply', params: { display_text: '🎙️ Voice Note (PTT)', id: `${usedPrefix}media ptt` } },
          { name: 'quick_reply', params: { display_text: '📄 Document Demo', id: `${usedPrefix}media doc` } },
          { name: 'quick_reply', params: { display_text: '👤 Contact vCard', id: `${usedPrefix}media contact` } },
          { name: 'quick_reply', params: { display_text: '📍 Maps Location', id: `${usedPrefix}media loc` } },
          { name: 'quick_reply', params: { display_text: '📊 Interactive Poll', id: `${usedPrefix}media poll` } },
          { name: 'quick_reply', params: { display_text: '🛍️ Business Product', id: `${usedPrefix}media product` } },
          { name: 'quick_reply', params: { display_text: '🧾 Business Order', id: `${usedPrefix}media order` } }
        ]
      }, m);
    }

    await m.react('⏳');

    // 1. Voice Note / PTT
    if (subType === 'ptt' || subType === 'audio') {
      const dummyAudioUrl = 'https://raw.githubusercontent.com/mdn/webaudio-examples/master/audio-analyser/viper.mp3';
      await sock.sendAudio(m.chat, dummyAudioUrl, {
        ptt: true,
        mimetype: 'audio/mp4'
      }, m);
      return await m.react('🎙️');
    }

    // 2. Document
    if (subType === 'doc' || subType === 'document') {
      const dummyDoc = Buffer.from('%PDF-1.4\n%...\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000010 00000 n\n0000000053 00000 n\n0000000102 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n178\n%%EOF');
      await sock.sendDocument(m.chat, dummyDoc, {
        fileName: 'Antigravity_Documentation_2026.pdf',
        mimetype: 'application/pdf',
        caption: '📄 _Dokumentasi Resmi Bot Antigravity 2026_',
        pageCount: 10
      }, m);
      return await m.react('📄');
    }

    // 3. Contact (vCard)
    if (subType === 'contact' || subType === 'vcard') {
      const ownerNum = (config.owners[0] || '6281234567890').replace(/[^0-9]/g, '');
      await sock.sendContact(m.chat, {
        name: config.ownerName || 'Antigravity Developer',
        number: ownerNum,
        org: config.botName || 'Antigravity Suite'
      }, m);
      return await m.react('👤');
    }

    // 4. Location
    if (subType === 'loc' || subType === 'location') {
      await sock.sendLocation(m.chat, {
        latitude: -6.200000,
        longitude: 106.816666,
        name: 'Monumen Nasional (Monas)',
        address: 'Gambir, Kecamatan Gambir, Kota Jakarta Pusat, DKI Jakarta'
      }, m);
      return await m.react('📍');
    }

    // 5. Poll
    if (subType === 'poll') {
      await sock.sendPoll(m.chat, {
        question: 'Bagaimana performa bot Antigravity menurut Anda?',
        options: [
          '⭐⭐⭐⭐⭐ Sangat Cepat & Lengkap',
          '⭐⭐⭐⭐ Bagus & Stabil',
          '⭐⭐⭐ Cukup Baik',
          '🛠️ Perlu Tambahan Fitur Baru'
        ],
        multiSelect: false
      }, m);
      return await m.react('📊');
    }

    // 6. ViewOnce
    if (subType === 'viewonce' || subType === 'vo') {
      const imgBuf = await sharp({
        create: {
          width: 500,
          height: 500,
          channels: 4,
          background: { r: 16, g: 185, b: 129, alpha: 1 }
        }
      }).png().toBuffer();

      await sock.sendViewOnce(m.chat, {
        image: imgBuf,
        caption: '👁️ _Ini adalah foto ViewOnce (sekali lihat)._'
      }, m);
      return await m.react('👁️');
    }

    // 7. WhatsApp Business Product
    if (subType === 'product') {
      const productImg = await sharp({
        create: {
          width: 600,
          height: 600,
          channels: 4,
          background: { r: 99, g: 102, b: 241, alpha: 1 }
        }
      }).jpeg().toBuffer();

      await sock.sendProduct(m.chat, {
        productId: 'antigravity_vip_prem',
        title: 'VIP Premium Access Bot (1 Bulan)',
        description: 'Akses unlimited AI reasoning, stiker tanpa batas, dan seluruh fitur bot VIP.',
        currencyCode: 'IDR',
        priceAmount1000: 25000000, // Rp 25.000
        retailerId: 'vip_01',
        url: 'https://antigravity.google',
        productImage: productImg,
        businessOwnerJid: sock.user?.id || m.chat
      }, m);
      return await m.react('🛍️');
    }

    // 8. WhatsApp Business Order Receipt
    if (subType === 'order') {
      await sock.sendOrder(m.chat, {
        orderTitle: 'Invoice #AGY-2026-8891',
        itemCount: 1,
        message: 'Pembelian VIP Premium Antigravity Bot 1 Bulan Berhasil!',
        totalAmount1000: 25000000,
        totalCurrencyCode: 'IDR'
      }, m);
      return await m.react('🧾');
    }

    await m.reply(`✕ Tipe media tidak dikenali. Ketik \`${usedPrefix}media\` untuk melihat daftar.`);
  }
};
