import {
  jidNormalizedUser,
  downloadContentFromMessage,
  proto,
  areJidsSameUser,
  extractMessageContent
} from '@whiskeysockets/baileys';
import store from './store.js';
import settings from '../settings.js';
import { toSmallCaps } from '../utils/font.js';
import interactive from './interactive.js';
import { createSticker } from './sticker.js';

export function serialize(sock, m) {
  if (!m) return m;

  // Key attributes
  if (m.key) {
    m.id = m.key.id;
    m.isBaileys = m.id?.startsWith('BAE5') || m.id?.startsWith('3EB0') || m.id?.length === 22;
    m.fromMe = m.key.fromMe || false;
    m.chat = m.key.remoteJid || '';
    m.isGroup = m.chat.endsWith('@g.us');
    m.isChannel = m.chat.endsWith('@newsletter');
    m.isNewsletter = m.isChannel;

    // Tangkap mapping LID jika WhatsApp menyertakan remoteJidAlt / senderPn
    const altJid = m.key.remoteJidAlt || m.key.senderPn || m.key.participant || m.participant;
    if (altJid && typeof altJid === 'string' && altJid.endsWith('@s.whatsapp.net') && m.chat.endsWith('@lid')) {
      const normLid = jidNormalizedUser(m.chat);
      const normPn = jidNormalizedUser(altJid);
      store.lidMap.set(normLid, normPn);
      store.lidMap.set(normPn, normLid);
    }
    
    // Modern Baileys 7.x / WA 2026 sender & LID resolution
    const rawSender = m.fromMe
      ? (sock?.user?.id || sock?.authState?.creds?.me?.id || (store.myNumber ? `${store.myNumber}@s.whatsapp.net` : m.chat))
      : (m.isGroup ? (m.key.participant || m.participant || m.chat) : (altJid?.endsWith('@s.whatsapp.net') ? altJid : m.chat));
      
    const rawNormalized = jidNormalizedUser(rawSender || '');
    
    // Pastikan LID selalu di-resolve menjadi Phone Number JID (@s.whatsapp.net)
    const resolvedPn = store.resolveLidToPn(rawNormalized, m.chat, sock);
    m.sender = (resolvedPn && resolvedPn.endsWith('@s.whatsapp.net')) 
      ? resolvedPn 
      : (rawNormalized.endsWith('@s.whatsapp.net') ? rawNormalized : resolvedPn);
    m.senderPn = m.sender;
    m.senderNumber = m.sender.split('@')[0].replace(/[^0-9]/g, '');
  }

  if (m.message) {
    // Unwrap pesan bersarang (viewOnce, ephemeral, dsb.)
    m.message = extractMessageContent(m.message);
    m.type = Object.keys(m.message)[0];
    m.msg = m.message[m.type];

    // Extract text / body from all message types (including native buttons & carousels)
    let extractedText = '';
    if (m.type === 'conversation') {
      extractedText = m.message.conversation;
    } else if (m.type === 'extendedTextMessage') {
      extractedText = m.message.extendedTextMessage?.text;
    } else if (m.type === 'imageMessage') {
      extractedText = m.message.imageMessage?.caption;
    } else if (m.type === 'videoMessage') {
      extractedText = m.message.videoMessage?.caption;
    } else if (m.type === 'documentMessage') {
      extractedText = m.message.documentMessage?.caption;
    } else if (m.type === 'templateButtonReplyMessage') {
      extractedText = m.message.templateButtonReplyMessage?.selectedId || m.message.templateButtonReplyMessage?.selectedDisplayText;
    } else if (m.type === 'buttonsResponseMessage') {
      extractedText = m.message.buttonsResponseMessage?.selectedButtonId || m.message.buttonsResponseMessage?.selectedDisplayText;
    } else if (m.type === 'listResponseMessage') {
      extractedText = m.message.listResponseMessage?.singleSelectReply?.selectedRowId || m.message.listResponseMessage?.title;
    } else if (m.type === 'interactiveResponseMessage') {
      const nativeFlow = m.message.interactiveResponseMessage?.nativeFlowResponseMessage;
      const nativeParams = nativeFlow?.paramsJson;
      if (nativeParams) {
        try {
          const parsed = typeof nativeParams === 'string' ? JSON.parse(nativeParams) : nativeParams;
          extractedText = (
            parsed.id ||
            parsed.row_id ||
            parsed.selected_row_id ||
            parsed.selected_id ||
            parsed.selectedId ||
            parsed.command ||
            parsed.value ||
            parsed.text ||
            parsed.title ||
            ''
          );
        } catch {
          extractedText = String(nativeParams);
        }
      }
      if (!extractedText && m.message.interactiveResponseMessage?.body?.text) {
        extractedText = m.message.interactiveResponseMessage.body.text;
      }
    } else if (m.type === 'pollCreationMessage' || m.type === 'pollCreationMessageV3') {
      extractedText = m.msg?.name || '';
    } else if (m.type === 'orderMessage') {
      extractedText = m.msg?.orderTitle || '';
    }

    m.text = (extractedText || '').trim();

    // Extract mentions & resolve any LID mentions to Phone Number JID
    const rawMentions = m.msg?.contextInfo?.mentionedJid || [];
    m.mentionedJid = rawMentions.map(mention => store.resolveLidToPn(mention, m.chat, sock));

    // Parse quoted message
    const quoted = m.msg?.contextInfo?.quotedMessage;
    if (quoted) {
      const qContent = extractMessageContent(quoted);
      const qType = Object.keys(qContent)[0];
      const qMsg = qContent[qType];
      
      const qParticipant = m.msg.contextInfo.participant;
      const qSenderRaw = jidNormalizedUser(qParticipant || '');
      const qSenderPn = store.resolveLidToPn(qSenderRaw, m.chat);

      m.quoted = {
        key: {
          remoteJid: m.chat,
          fromMe: areJidsSameUser(qSenderPn, sock.user?.id),
          id: m.msg.contextInfo.stanzaId,
          participant: qParticipant
        },
        message: qContent,
        type: qType,
        msg: qMsg,
        sender: qSenderPn,
        senderPn: qSenderPn,
        senderNumber: qSenderPn.replace(/[^0-9]/g, ''),
        isBaileys: (m.msg.contextInfo.stanzaId?.startsWith('BAE5') || m.msg.contextInfo.stanzaId?.startsWith('3EB0')),
        text: (
          qType === 'conversation' ? qMsg :
          qType === 'extendedTextMessage' ? qMsg?.text :
          qType === 'imageMessage' ? qMsg?.caption :
          qType === 'videoMessage' ? qMsg?.caption :
          qType === 'documentMessage' ? qMsg?.caption :
          ''
        ) || '',
        download: async () => {
          const streamType = qType.replace('Message', '');
          const stream = await downloadContentFromMessage(qMsg, streamType);
          let buffer = Buffer.from([]);
          for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
          }
          return buffer;
        }
      };
    } else {
      m.quoted = null;
    }

    // Media download helper
    m.download = async () => {
      if (!m.msg) return null;
      const streamType = m.type.replace('Message', '');
      const stream = await downloadContentFromMessage(m.msg, streamType);
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }
      return buffer;
    };
  }

  // Push name
  m.pushName = m.pushName || store.getName(m.sender) || '';
  m.font = toSmallCaps;

  // Basic Response helpers
  m.reply = async (text, options = {}) => {
    const isNewsletter = m.chat.endsWith('@newsletter');
    return await sock.sendMessage(m.chat, {
      text: typeof text === 'string' ? text : JSON.stringify(text, null, 2),
      ...options
    }, isNewsletter ? {} : { quoted: m });
  };

  m.styledReply = async (text, options = {}) => {
    const styledText = typeof text === 'string' ? toSmallCaps(text) : text;
    return await m.reply(styledText, options);
  };

  m.react = async (emoji) => {
    try {
      return await sock.sendMessage(m.chat, {
        react: {
          text: emoji,
          key: m.key
        }
      });
    } catch {}
  };

  // Interactive & Media Response Helpers directly bound to m
  m.replyButton = async (options = {}) => {
    return await interactive.sendButton(sock, m.chat, options, m);
  };

  m.replyCarousel = async (options = {}) => {
    return await interactive.sendCarousel(sock, m.chat, options, m);
  };

  m.replyList = async (options = {}) => {
    return await interactive.sendList(sock, m.chat, options, m);
  };

  m.replyImage = async (bufferOrUrl, caption = '', options = {}) => {
    return await interactive.sendImage(sock, m.chat, bufferOrUrl, caption, m, options);
  };

  m.replyVideo = async (bufferOrUrl, caption = '', options = {}) => {
    return await interactive.sendVideo(sock, m.chat, bufferOrUrl, caption, m, options);
  };

  m.replyAudio = async (bufferOrUrl, options = {}) => {
    return await interactive.sendAudio(sock, m.chat, bufferOrUrl, options, m);
  };

  m.replyDocument = async (bufferOrUrl, options = {}) => {
    return await interactive.sendDocument(sock, m.chat, bufferOrUrl, options, m);
  };

  m.replySticker = async (bufferOrUrl, options = {}) => {
    return await interactive.sendSticker(sock, m.chat, bufferOrUrl, m, options);
  };

  m.replyContact = async (contactData) => {
    return await interactive.sendContact(sock, m.chat, contactData, m);
  };

  m.replyContacts = async (contactsArray) => {
    return await interactive.sendContacts(sock, m.chat, contactsArray, m);
  };

  m.replyLocation = async (locationData) => {
    return await interactive.sendLocation(sock, m.chat, locationData, m);
  };

  m.replyPoll = async (pollData) => {
    return await interactive.sendPoll(sock, m.chat, pollData, m);
  };

  m.replyProduct = async (productData) => {
    return await interactive.sendProduct(sock, m.chat, productData, m);
  };

  m.replyOrder = async (orderData) => {
    return await interactive.sendOrder(sock, m.chat, orderData, m);
  };

  return m;
}

export default serialize;
