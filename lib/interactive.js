import {
  proto,
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  generateWAMessage
} from '@whiskeysockets/baileys';
import axios from 'axios';
import fs from 'fs';
import crypto from 'crypto';
import logger from '../utils/logger.js';
import config from '../config/config.js';
import { createSticker } from './sticker.js';

/**
 * Normalizes input buffer or URL into a Buffer
 */
async function toBuffer(input) {
  if (Buffer.isBuffer(input)) return input;
  if (typeof input === 'string') {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const res = await axios.get(input, { responseType: 'arraybuffer', timeout: 30000 });
      return Buffer.from(res.data);
    }
    if (fs.existsSync(input)) {
      return await fs.promises.readFile(input);
    }
  }
  return input;
}

/**
 * Formats button definition into standard NativeFlowMessage button format
 */
export function formatNativeButton(btn) {
  // 1. Direct native button format
  if (btn.name && (btn.buttonParamsJson || btn.params)) {
    return {
      name: btn.name,
      buttonParamsJson: typeof btn.buttonParamsJson === 'string'
        ? btn.buttonParamsJson
        : JSON.stringify(btn.params || {})
    };
  }

  const type = (btn.type || btn.name || '').toLowerCase();
  const text = btn.text || btn.display_text || btn.title || btn.label || '';
  const id = btn.id || btn.command || text;

  // 2. Quick Reply
  if (type === 'reply' || type === 'quick_reply' || !type) {
    return {
      name: 'quick_reply',
      buttonParamsJson: JSON.stringify({
        display_text: text,
        id: id
      })
    };
  }

  // 3. CTA URL
  if (type === 'url' || type === 'cta_url') {
    return {
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: text,
        url: btn.url || btn.link || 'https://whatsapp.com',
        merchant_url: btn.merchant_url || btn.url || 'https://whatsapp.com'
      })
    };
  }

  // 4. CTA Phone Call
  if (type === 'call' || type === 'cta_call') {
    return {
      name: 'cta_call',
      buttonParamsJson: JSON.stringify({
        display_text: text,
        phone_number: btn.phone || btn.phone_number || btn.number || ''
      })
    };
  }

  // 5. CTA Copy Text / Coupon Code
  if (type === 'copy' || type === 'cta_copy') {
    return {
      name: 'cta_copy',
      buttonParamsJson: JSON.stringify({
        display_text: text,
        id: id,
        copy_code: btn.code || btn.copy_code || btn.text || ''
      })
    };
  }

  // 6. CTA Reminder
  if (type === 'reminder' || type === 'cta_reminder') {
    return {
      name: 'cta_reminder',
      buttonParamsJson: JSON.stringify({
        display_text: text,
        id: id
      })
    };
  }

  // 7. Single Select / Menu List
  if (type === 'list' || type === 'single_select') {
    return {
      name: 'single_select',
      buttonParamsJson: JSON.stringify({
        title: btn.title || text || 'Pilih Menu',
        sections: btn.sections || []
      })
    };
  }

  // 8. Address / Shipping
  if (type === 'address' || type === 'address_message') {
    return {
      name: 'address_message',
      buttonParamsJson: JSON.stringify({
        mode: btn.mode || 'shipping'
      })
    };
  }

  // 9. Webview
  if (type === 'webview' || type === 'open_webview') {
    return {
      name: 'open_webview',
      buttonParamsJson: JSON.stringify({
        title: text,
        url: btn.url || ''
      })
    };
  }

  // Fallback as quick reply
  return {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
      display_text: text || 'Pilih',
      id: id || 'select'
    })
  };
}

/**
 * Builds Native Flow Interactive Message (Buttons, CTA, Lists, Media Headers)
 */
export async function buildInteractiveMessage(sock, jid, options = {}) {
  const {
    title = '',
    subtitle = '',
    body = '',
    footer = '',
    buttons = [],
    media = null,
    contextInfo = {}
  } = options;

  const headerObj = {};
  if (title) headerObj.title = title;
  if (subtitle) headerObj.subtitle = subtitle;

  if (media && sock) {
    headerObj.hasMediaAttachment = true;
    try {
      if (media.image) {
        const buf = await toBuffer(media.image);
        const prepared = await prepareWAMessageMedia({ image: buf }, { upload: sock.waUploadToServer });
        headerObj.imageMessage = prepared.imageMessage;
      } else if (media.video) {
        const buf = await toBuffer(media.video);
        const prepared = await prepareWAMessageMedia({ video: buf }, { upload: sock.waUploadToServer });
        headerObj.videoMessage = prepared.videoMessage;
      } else if (media.document) {
        const buf = await toBuffer(media.document);
        const prepared = await prepareWAMessageMedia({
          document: buf,
          mimetype: media.mimetype || 'application/pdf',
          fileName: media.fileName || 'document.pdf'
        }, { upload: sock.waUploadToServer });
        headerObj.documentMessage = prepared.documentMessage;
      }
    } catch (err) {
      logger.warn(`[Interactive] Gagal mempersiapkan media header: ${err.message}`);
      headerObj.hasMediaAttachment = false;
    }
  } else {
    headerObj.hasMediaAttachment = false;
  }

  const formattedButtons = Array.isArray(buttons)
    ? buttons.map(b => formatNativeButton(b))
    : [];

  const interactiveMessage = proto.Message.InteractiveMessage.create({
    header: proto.Message.InteractiveMessage.Header.create(headerObj),
    body: proto.Message.InteractiveMessage.Body.create({ text: body || '' }),
    footer: proto.Message.InteractiveMessage.Footer.create({ text: footer || '' }),
    contextInfo: contextInfo || {},
    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
      buttons: formattedButtons
    })
  });

  const msg = generateWAMessageFromContent(jid, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage
      }
    }
  }, {});

  return msg;
}

/**
 * Builds Multi-Card Carousel Interactive Message
 */
export async function buildCarouselMessage(sock, jid, options = {}) {
  const {
    body = '',
    footer = '',
    cards = [],
    contextInfo = {}
  } = options;

  const cardMessages = [];

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const headerObj = {
      title: card.title || '',
      hasMediaAttachment: false
    };

    if (card.media && sock) {
      headerObj.hasMediaAttachment = true;
      try {
        if (card.media.image) {
          const buf = await toBuffer(card.media.image);
          const prepared = await prepareWAMessageMedia({ image: buf }, { upload: sock.waUploadToServer });
          headerObj.imageMessage = prepared.imageMessage;
        } else if (card.media.video) {
          const buf = await toBuffer(card.media.video);
          const prepared = await prepareWAMessageMedia({ video: buf }, { upload: sock.waUploadToServer });
          headerObj.videoMessage = prepared.videoMessage;
        }
      } catch (err) {
        headerObj.hasMediaAttachment = false;
      }
    }

    const cardButtons = Array.isArray(card.buttons)
      ? card.buttons.map(b => formatNativeButton(b))
      : [];

    const cardProto = proto.Message.InteractiveMessage.create({
      header: proto.Message.InteractiveMessage.Header.create(headerObj),
      body: proto.Message.InteractiveMessage.Body.create({ text: card.body || card.description || '' }),
      footer: proto.Message.InteractiveMessage.Footer.create({ text: card.footer || '' }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
        buttons: cardButtons
      })
    });

    cardMessages.push(cardProto);
  }

  const interactiveMessage = proto.Message.InteractiveMessage.create({
    body: proto.Message.InteractiveMessage.Body.create({ text: body || '' }),
    footer: proto.Message.InteractiveMessage.Footer.create({ text: footer || '' }),
    contextInfo: contextInfo || {},
    carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.create({
      cards: cardMessages
    })
  });

  const msg = generateWAMessageFromContent(jid, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage
      }
    }
  }, {});

  return msg;
}

/**
 * High-Level Media & Message Senders
 */

export async function sendButton(sock, jid, options = {}, quoted = null) {
  const msg = await buildInteractiveMessage(sock, jid, options);
  return await sock.relayMessage(jid, msg.message, {
    messageId: msg.key.id,
    quoted: quoted || undefined
  });
}

export async function sendCarousel(sock, jid, options = {}, quoted = null) {
  const msg = await buildCarouselMessage(sock, jid, options);
  return await sock.relayMessage(jid, msg.message, {
    messageId: msg.key.id,
    quoted: quoted || undefined
  });
}

export async function sendList(sock, jid, options = {}, quoted = null) {
  const {
    title = '',
    text = '',
    footer = '',
    buttonText = 'Buka Menu 📋',
    sections = []
  } = options;

  // Modern Native Flow Single Select list button
  return await sendButton(sock, jid, {
    title,
    body: text,
    footer,
    buttons: [
      {
        name: 'single_select',
        params: {
          title: buttonText,
          sections: sections
        }
      }
    ]
  }, quoted);
}

export async function sendImage(sock, jid, bufferOrUrl, caption = '', quoted = null, options = {}) {
  const buf = await toBuffer(bufferOrUrl);
  return await sock.sendMessage(jid, {
    image: buf,
    caption: caption || '',
    ...options
  }, { quoted: quoted || undefined });
}

export async function sendVideo(sock, jid, bufferOrUrl, caption = '', quoted = null, options = {}) {
  const buf = await toBuffer(bufferOrUrl);
  return await sock.sendMessage(jid, {
    video: buf,
    caption: caption || '',
    ...options
  }, { quoted: quoted || undefined });
}

export async function sendAudio(sock, jid, bufferOrUrl, options = {}, quoted = null) {
  const buf = await toBuffer(bufferOrUrl);
  const { ptt = false, mimetype = 'audio/mp4', waveform = null } = options;
  return await sock.sendMessage(jid, {
    audio: buf,
    mimetype,
    ptt,
    ...(waveform ? { waveform } : {}),
    ...options
  }, { quoted: quoted || undefined });
}

export async function sendDocument(sock, jid, bufferOrUrl, options = {}, quoted = null) {
  const buf = await toBuffer(bufferOrUrl);
  const {
    fileName = 'document.pdf',
    mimetype = 'application/pdf',
    caption = '',
    pageCount = null,
    jpegThumbnail = null
  } = options;

  return await sock.sendMessage(jid, {
    document: buf,
    fileName,
    mimetype,
    caption,
    ...(pageCount ? { pageCount } : {}),
    ...(jpegThumbnail ? { jpegThumbnail } : {}),
    ...options
  }, { quoted: quoted || undefined });
}

export async function sendSticker(sock, jid, bufferOrUrl, quoted = null, options = {}) {
  let buf = await toBuffer(bufferOrUrl);
  // If not already webp, convert it
  if (!buf.toString('hex').startsWith('52494646')) {
    buf = await createSticker(buf, options);
  }
  return await sock.sendMessage(jid, {
    sticker: buf,
    ...options
  }, { quoted: quoted || undefined });
}

export async function sendContact(sock, jid, contactData, quoted = null) {
  const {
    name = 'Contact',
    number = '',
    org = config.botName || 'Antigravity Bot'
  } = contactData;

  const cleanNum = String(number).replace(/[^0-9]/g, '');
  const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${org};\nTEL;type=CELL;type=VOICE;waid=${cleanNum}:+${cleanNum}\nEND:VCARD`;

  return await sock.sendMessage(jid, {
    contacts: {
      displayName: name,
      contacts: [{ vcard }]
    }
  }, { quoted: quoted || undefined });
}

export async function sendContacts(sock, jid, contactsArray = [], quoted = null) {
  const contacts = contactsArray.map(c => {
    const cleanNum = String(c.number || '').replace(/[^0-9]/g, '');
    const name = c.name || `+${cleanNum}`;
    const org = c.org || config.botName || 'Antigravity Bot';
    return {
      vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nORG:${org};\nTEL;type=CELL;type=VOICE;waid=${cleanNum}:+${cleanNum}\nEND:VCARD`
    };
  });

  return await sock.sendMessage(jid, {
    contacts: {
      displayName: `${contactsArray.length} Kontak`,
      contacts
    }
  }, { quoted: quoted || undefined });
}

export async function sendLocation(sock, jid, locationData = {}, quoted = null) {
  const {
    latitude = -6.200000,
    longitude = 106.816666,
    name = 'Lokasi',
    address = 'Indonesia',
    jpegThumbnail = null
  } = locationData;

  return await sock.sendMessage(jid, {
    location: {
      degreesLatitude: latitude,
      degreesLongitude: longitude,
      name,
      address,
      ...(jpegThumbnail ? { jpegThumbnail } : {})
    }
  }, { quoted: quoted || undefined });
}

export async function sendLiveLocation(sock, jid, liveData = {}, quoted = null) {
  const {
    latitude = -6.200000,
    longitude = 106.816666,
    accuracyInMeters = 0,
    speedInMps = 0,
    degreesClockwiseFromMagneticNorth = 0,
    caption = '',
    sequenceNumber = 1,
    timeOffset = 86400
  } = liveData;

  return await sock.sendMessage(jid, {
    liveLocation: {
      degreesLatitude: latitude,
      degreesLongitude: longitude,
      accuracyInMeters,
      speedInMps,
      degreesClockwiseFromMagneticNorth,
      caption,
      sequenceNumber,
      timeOffset
    }
  }, { quoted: quoted || undefined });
}

export async function sendPoll(sock, jid, pollData = {}, quoted = null) {
  const {
    question = 'Pertanyaan Poll',
    options = ['Pilihan 1', 'Pilihan 2'],
    multiSelect = false
  } = pollData;

  return await sock.sendMessage(jid, {
    poll: {
      name: question,
      values: options,
      selectableCount: multiSelect ? options.length : 1
    }
  }, { quoted: quoted || undefined });
}

export async function sendReaction(sock, jid, key, emoji = '👍') {
  return await sock.sendMessage(jid, {
    react: {
      text: emoji,
      key
    }
  });
}

export async function sendViewOnce(sock, jid, mediaData = {}, quoted = null) {
  const { image, video, audio, caption = '' } = mediaData;
  const viewOnceContent = {};

  if (image) {
    const buf = await toBuffer(image);
    viewOnceContent.image = buf;
    if (caption) viewOnceContent.caption = caption;
  } else if (video) {
    const buf = await toBuffer(video);
    viewOnceContent.video = buf;
    if (caption) viewOnceContent.caption = caption;
  } else if (audio) {
    const buf = await toBuffer(audio);
    viewOnceContent.audio = buf;
    viewOnceContent.mimetype = 'audio/mp4';
    viewOnceContent.ptt = true;
  }

  return await sock.sendMessage(jid, {
    viewOnceMessage: {
      message: viewOnceContent
    }
  }, { quoted: quoted || undefined });
}

export async function sendProduct(sock, jid, productData = {}, quoted = null) {
  const {
    productId = 'prod_1',
    title = 'Produk Antigravity',
    description = 'Deskripsi Produk',
    currencyCode = 'IDR',
    priceAmount1000 = 50000000,
    retailerId = 'antigravity_01',
    url = 'https://antigravity.google',
    productImage = null,
    businessOwnerJid = sock.user?.id || jid
  } = productData;

  let imageMessage = null;
  if (productImage && sock) {
    try {
      const buf = await toBuffer(productImage);
      const prepared = await prepareWAMessageMedia({ image: buf }, { upload: sock.waUploadToServer });
      imageMessage = prepared.imageMessage;
    } catch {}
  }

  const productMessage = {
    product: {
      productImage: imageMessage || undefined,
      productId,
      title,
      description,
      currencyCode,
      priceAmount1000,
      retailerId,
      url,
      productImageCount: 1
    },
    businessOwnerJid
  };

  return await sock.sendMessage(jid, {
    productMessage
  }, { quoted: quoted || undefined });
}

export async function sendOrder(sock, jid, orderData = {}, quoted = null) {
  const {
    orderId = crypto.randomBytes(8).toString('hex'),
    orderTitle = 'Pesanan Bot Antigravity',
    itemCount = 1,
    status = 1,
    surface = 1,
    message = 'Terima kasih atas pesanan Anda!',
    orderToken = crypto.randomBytes(16).toString('hex'),
    totalAmount1000 = 50000000,
    totalCurrencyCode = 'IDR'
  } = orderData;

  const orderMessage = {
    orderId,
    orderTitle,
    itemCount,
    status,
    surface,
    message,
    orderToken,
    totalAmount1000,
    totalCurrencyCode
  };

  return await sock.sendMessage(jid, {
    orderMessage
  }, { quoted: quoted || undefined });
}

export async function sendAlbum(sock, jid, mediaList = [], caption = '', quoted = null) {
  if (!Array.isArray(mediaList) || mediaList.length === 0) return null;

  const results = [];
  for (let i = 0; i < mediaList.length; i++) {
    const item = mediaList[i];
    const isFirst = i === 0;
    const itemCaption = isFirst ? caption : '';

    if (item.image) {
      const sent = await sendImage(sock, jid, item.image, itemCaption, quoted);
      results.push(sent);
    } else if (item.video) {
      const sent = await sendVideo(sock, jid, item.video, itemCaption, quoted);
      results.push(sent);
    }
  }

  return results;
}

export default {
  formatNativeButton,
  buildInteractiveMessage,
  buildCarouselMessage,
  sendInteractiveMessage: sendButton,
  sendButton,
  sendCarousel,
  sendList,
  sendImage,
  sendVideo,
  sendAudio,
  sendDocument,
  sendSticker,
  sendContact,
  sendContacts,
  sendLocation,
  sendLiveLocation,
  sendPoll,
  sendReaction,
  sendViewOnce,
  sendProduct,
  sendOrder,
  sendAlbum
};
