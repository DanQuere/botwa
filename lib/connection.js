import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  downloadContentFromMessage,
  getContentType,
  VoipClient
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import readline from 'readline';
import path from 'path';
import fs from 'fs';
import pino from 'pino';
import chalk from 'chalk';
import NodeCache from 'node-cache';

import settings from '../settings.js';
import db from '../database/index.js';
import store from './store.js';
import serialize from './serialize.js';
import handler from './handler.js';
import logger from '../utils/logger.js';
import interactive from './interactive.js';
import { startAutoClearSession } from '../utils/cleaner.js';

// Cache untuk retry pesan agar tidak terjadi desinkronisasi enkripsi / Bad MAC
const msgRetryCounterCache = new NodeCache();

// Helper input terminal interaktif
async function question(prompt) {
  process.stdout.write(prompt);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('', (ans) => {
      rl.close();
      resolve(ans);
    });
  });
}

// Unwrapper untuk berbagai format wrapper pesan WA (viewOnce, ephemeral, dsb.)
const unwrapMessage = (m) => {
  let msg = m?.message ?? m;
  while (
    msg?.ephemeralMessage ||
    msg?.viewOnceMessage ||
    msg?.viewOnceMessageV2 ||
    msg?.viewOnceMessageV2Extension ||
    msg?.documentWithCaptionMessage
  ) {
    msg =
      msg?.ephemeralMessage?.message ??
      msg?.viewOnceMessage?.message ??
      msg?.viewOnceMessageV2?.message ??
      msg?.viewOnceMessageV2Extension?.message ??
      msg?.documentWithCaptionMessage?.message;
  }
  return msg;
};

export async function connectToWhatsApp() {
  const sessionDir = path.resolve(settings.sessionDir || './sessions');
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  // Mulai pembersih sesi otomatis (membersihkan file junk tanpa merusak session keys)
  startAutoClearSession(sessionDir);

  // Multi-file Auth State
  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  
  console.log(chalk.cyan(`🤖 ${settings.botName} Using WA v${version.join('.')}, isLatest: ${isLatest}`));

  const isPairing = (settings.authMode || 'pairing').toLowerCase() === 'pairing';

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: !isPairing,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' }))
    },
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    version,
    syncFullHistory: false,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: true,
    msgRetryCounterCache,
    connectTimeoutMs: 60000,
    keepAliveIntervalMs: 25000,
    getMessage: async (key) => {
      if (store?.messages) {
        const msg = store.messages.get(key.remoteJid)?.get(key.id)?.message;
        if (msg) return msg;
      }
      return { conversation: 'Antigravity Bot' };
    }
  });

  // Helper download media message dari socket
  sock.downloadMediaMessage = async (input) => {
    try {
      const root = input?.message ? input : { message: input };
      const unwrapped = unwrapMessage(root.message);

      const type = getContentType(unwrapped);
      if (!type) throw new Error('Tidak ada media pada pesan');

      const msgContent = unwrapped[type];
      const mediaKind = type.replace('Message', ''); // 'image' | 'video' | 'sticker' | 'audio' | 'document'

      const stream = await downloadContentFromMessage(msgContent, mediaKind);
      let buffer = Buffer.alloc(0);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      const mimetype =
        msgContent.mimetype ||
        (mediaKind === 'sticker' ? 'image/webp' : undefined);

      return { buffer, mimetype, type: mediaKind };
    } catch (error) {
      logger.error(`Error downloading media: ${error.message}`);
      throw error;
    }
  };

  // High-Level Message and Media sender methods directly on sock
  sock.sendButton = (jid, options, quoted) => interactive.sendButton(sock, jid, options, quoted);
  sock.sendCarousel = (jid, options, quoted) => interactive.sendCarousel(sock, jid, options, quoted);
  sock.sendList = (jid, options, quoted) => interactive.sendList(sock, jid, options, quoted);
  sock.sendImage = (jid, buffer, caption, quoted, options) => interactive.sendImage(sock, jid, buffer, caption, quoted, options);
  sock.sendVideo = (jid, buffer, caption, quoted, options) => interactive.sendVideo(sock, jid, buffer, caption, quoted, options);
  sock.sendAudio = (jid, buffer, options, quoted) => interactive.sendAudio(sock, jid, buffer, options, quoted);
  sock.sendDocument = (jid, buffer, options, quoted) => interactive.sendDocument(sock, jid, buffer, options, quoted);
  sock.sendSticker = (jid, buffer, quoted, options) => interactive.sendSticker(sock, jid, buffer, quoted, options);
  sock.sendContact = (jid, contact, quoted) => interactive.sendContact(sock, jid, contact, quoted);
  sock.sendContacts = (jid, contacts, quoted) => interactive.sendContacts(sock, jid, contacts, quoted);
  sock.sendLocation = (jid, location, quoted) => interactive.sendLocation(sock, jid, location, quoted);
  sock.sendLiveLocation = (jid, location, quoted) => interactive.sendLiveLocation(sock, jid, location, quoted);
  sock.sendPoll = (jid, poll, quoted) => interactive.sendPoll(sock, jid, poll, quoted);
  sock.sendReaction = (jid, key, emoji) => interactive.sendReaction(sock, jid, key, emoji);
  sock.sendViewOnce = (jid, media, quoted) => interactive.sendViewOnce(sock, jid, media, quoted);
  sock.sendProduct = (jid, product, quoted) => interactive.sendProduct(sock, jid, product, quoted);
  sock.sendOrder = (jid, order, quoted) => interactive.sendOrder(sock, jid, order, quoted);
  sock.sendAlbum = (jid, mediaList, caption, quoted) => interactive.sendAlbum(sock, jid, mediaList, caption, quoted);

  // Bind store to events
  store.bind(sock.ev);

  // Handle Pairing Code
  if (isPairing && !sock.authState.creds.registered) {
    try {
      let phoneNumber = settings.pairingNumber ? String(settings.pairingNumber).trim() : '';
      
      // Jika nomor pairing kosong atau masih default contoh, minta di terminal
      if (!phoneNumber || phoneNumber === '6281234567890') {
        const inputNumber = await question(chalk.cyan('☘️ Masukan Nomor Yang Diawali Dengan 62 :\n'));
        if (inputNumber && inputNumber.trim()) {
          phoneNumber = inputNumber.trim();
        }
      }

      const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (cleanNumber) {
        setTimeout(async () => {
          try {
            const code = await sock.requestPairingCode(cleanNumber);
            console.log(chalk.greenBright('\n========================================='));
            console.log(chalk.yellowBright('🎁 Pairing Code :'), chalk.black.bgGreenBright(` ${code?.match(/.{1,4}/g)?.join('-') || code} `));
            console.log(chalk.greenBright('=========================================\n'));
            console.log(chalk.white('Buka WhatsApp > Perangkat Tertaut > Tautkan dengan nomor telepon'));
          } catch (err) {
            logger.error(`Gagal meminta pairing code: ${err.message}`);
          }
        }, 3000);
      }
    } catch (err) {
      logger.error(`Gagal inisialisasi pairing code: ${err.message}`);
    }
  }

  // Connection Updates
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    // Handle QR code display jika mode QR aktif
    if (qr && !isPairing) {
      console.log(chalk.cyan('\n📷 Silakan scan QR Code berikut di WhatsApp:\n'));
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output?.statusCode
        : lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut && statusCode !== 401;
      
      console.log(chalk.red('❌ Koneksi Terputus, Mencoba Menyambung Ulang...'));

      if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
        logger.error('[Connection] Sesi telah logout. Hapus folder sessions untuk login ulang.');
      } else if (shouldReconnect) {
        setTimeout(() => {
          connectToWhatsApp();
        }, 5000);
      }
    } else if (connection === 'open') {
      if (sock.user) {
        store.myJid = sock.user.id ? sock.user.id.split(':')[0] + '@s.whatsapp.net' : null;
        store.myLid = sock.user.lid ? sock.user.lid.split(':')[0] + '@lid' : null;
        store.myNumber = store.myJid ? store.myJid.split('@')[0].replace(/[^0-9]/g, '') : null;
        if (store.myLid && store.myJid) {
          store.lidMap.set(store.myLid, store.myJid);
          store.lidMap.set(store.myJid, store.myLid);
        }
        if (store.myNumber) {
          db.addOwner(store.myNumber);
        }
      }
      console.log(chalk.green('✔ Bot Berhasil Terhubung Ke WhatsApp'));
      console.log(chalk.blue(`🤖 ${settings.botName} siap menerima pesan!`));

      // Inisialisasi VoIP Call Client
      if (!global.voipClient && VoipClient) {
        try {
          global.voipClient = new VoipClient();
          await global.voipClient.connectWithSocket(sock);
          console.log(chalk.green('📞 Mesin VoIP Call WhatsApp aktif (shared socket)'));
        } catch (e) {
          logger.warn(`Gagal init VoIP: ${e.message}`);
        }
      }
    } else if (connection === 'connecting') {
      console.log(chalk.yellow('🔄 Menghubungkan ke WhatsApp...'));
    }
  });

  // Simpan kredensial saat ada update
  sock.ev.on('creds.update', () => {
    saveCreds();
    if (state.creds?.me) {
      const myId = state.creds.me.id ? state.creds.me.id.split(':')[0] + '@s.whatsapp.net' : null;
      const myLid = state.creds.me.lid ? state.creds.me.lid.split(':')[0] + '@lid' : null;
      if (myId) {
        store.myJid = myId;
        store.myNumber = myId.split('@')[0].replace(/[^0-9]/g, '');
        if (myLid) {
          store.myLid = myLid;
          store.lidMap.set(myLid, myId);
          store.lidMap.set(myId, myLid);
        }
        if (store.myNumber) {
          db.addOwner(store.myNumber);
        }
      }
    }
  });

  // Handle incoming messages & stories
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const rawMsg of messages) {
      if (!rawMsg.message) continue;

      // Handle WhatsApp Status / Story (status@broadcast)
      if (rawMsg.key.remoteJid === 'status@broadcast') {
        const shouldViewSw = db.data.settings.autoViewSw ?? settings.autoViewSw ?? true;
        const shouldReactSw = db.data.settings.autoReactSw ?? settings.autoReactSw ?? true;

        // Auto-View Story
        if (shouldViewSw) {
          try {
            await sock.readMessages([rawMsg.key]);
          } catch {}
        }

        // Auto-React Story with random emoji
        if (shouldReactSw && rawMsg.key.participant) {
          try {
            const emojis = db.data.settings.swEmojis || ['💚', '🔥', '✨', '👍', '❤️', '👏', '⚡'];
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];

            await sock.sendMessage('status@broadcast', {
              react: {
                key: rawMsg.key,
                text: emoji
              }
            }, {
              statusJidList: [rawMsg.key.participant]
            });

            const senderPn = rawMsg.key.participant.split('@')[0].replace(/[^0-9]/g, '');
            console.log(chalk.magenta(`[Story] 👁️ Auto-View & React ${emoji} to Status from +${senderPn}`));
          } catch (e) {}
        }

        continue; // Story selesai diproses, tidak perlu diteruskan ke plugin command router
      }

      // Serialize pesan masuk reguler
      const m = serialize(sock, rawMsg);
      
      // Simpan pesan ke store cache
      if (!store.messages.has(m.chat)) {
        store.messages.set(m.chat, new Map());
      }
      store.messages.get(m.chat).set(m.id, rawMsg);

      // Teruskan pesan ke handler plugin
      await handler.handleMessage(sock, m);
    }
  });

  return sock;
}

export default connectToWhatsApp;
