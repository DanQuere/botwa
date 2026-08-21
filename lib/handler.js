import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import chalk from 'chalk';
import syntaxError from 'syntax-error';
import config from '../config/config.js';
import db from '../database/index.js';
import logger from '../utils/logger.js';
import store from './store.js';
import antigravity from './antigravity.js';
import { areJidsSameUser } from '@whiskeysockets/baileys';
import {
  toSmallCaps,
  glyphs,
  renderCard,
  renderHeader,
  renderRow,
  renderFooter,
  formatSystemMessage
} from '../utils/font.js';
import { formatDuration } from '../utils/format.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLUGINS_DIR = path.resolve(__dirname, '../plugins');

export class PluginHandler {
  constructor() {
    this.plugins = new Map(); // name/command -> plugin object
    this.fileMap = new Map(); // filePath -> Set of command names/aliases
    this.cooldowns = new Map(); // userJid -> timestamp
    this.categories = new Set();
    this.watchers = new Map(); // dirPath -> FSWatcher
    this.debounceTimers = new Map(); // filePath -> timeoutId
  }

  /**
   * Pengecekan Syntax Error pada file sebelum di-import
   * Mencegah server bot crash jika ada kesalahan penulisan kode
   */
  checkSyntax(filePath) {
    try {
      if (!fs.existsSync(filePath)) return null;
      const code = fs.readFileSync(filePath, 'utf-8');
      const err = syntaxError(code, filePath, {
        sourceType: 'module',
        allowAwaitOutsideFunction: true,
        ecmaVersion: 2024
      });
      return err || null;
    } catch (e) {
      return e;
    }
  }

  /**
   * Memuat satu file plugin secara dinamis (load / reload)
   */
  async loadPluginFile(filePath, isReload = false) {
    if (!filePath.endsWith('.js')) return false;

    const filename = path.basename(filePath);

    // 1. Cek Syntax Error sebelum eksekusi import
    const syntaxErr = this.checkSyntax(filePath);
    if (syntaxErr) {
      console.log(chalk.redBright(`\n╭───〔 ❌ SYNTAX ERROR DETECTED 〕───`));
      console.log(chalk.yellow(`│ File: `) + chalk.white(path.relative(process.cwd(), filePath)));
      console.log(chalk.red(`│ `) + syntaxErr.toString().split('\n').join('\n│ '));
      console.log(chalk.redBright(`╰────────────────────────────────────\n`));
      logger.warn(`[Hot Reload] Melewati '${filename}' karena terdapat kesalahan syntax.`);
      return false;
    }

    try {
      // 2. Unregister command lama jika file sedang di-reload
      this.unloadPluginFile(filePath, false);

      // 3. Dynamic import dengan timestamp query bypass cache ESM
      const fileUrl = `${pathToFileURL(filePath).href}?update=${Date.now()}`;
      const module = await import(fileUrl);
      let plugin = module.default || module;

      // Universal Adapter for different plugin export formats
      if (!plugin?.run && (module.handler || typeof module.default === 'function')) {
        const handlerFn = module.handler || (typeof module.default === 'function' ? module.default : null);
        const cfg = module.config || module.pluginConfig || plugin?.config || {};
        if (handlerFn) {
          let pluginName = cfg.name || cfg.command || (Array.isArray(handlerFn.help) ? handlerFn.help[0] : null) || path.basename(filePath, '.js');
          if (typeof pluginName === 'string') pluginName = pluginName.split(/\s+/)[0].replace(/[^a-zA-Z0-9_-]/g, '');

          let pluginAliases = cfg.alias || cfg.aliases || (Array.isArray(handlerFn.help) ? handlerFn.help.slice(1) : []) || [];
          if (Array.isArray(pluginAliases)) {
            pluginAliases = pluginAliases.map(a => typeof a === 'string' ? a.split(/\s+/)[0].replace(/[^a-zA-Z0-9_-]/g, '') : '').filter(Boolean);
          }

          plugin = {
            name: pluginName,
            aliases: pluginAliases,
            category: cfg.category || (Array.isArray(handlerFn.tags) ? handlerFn.tags[0] : null) || path.basename(path.dirname(filePath)),
            description: cfg.description || '',
            ownerOnly: Boolean(cfg.isOwner || cfg.ownerOnly || handlerFn.owner),
            premiumOnly: Boolean(cfg.isPremium || cfg.premiumOnly || handlerFn.premium),
            groupOnly: Boolean(cfg.isGroup || cfg.groupOnly || handlerFn.group),
            adminOnly: Boolean(cfg.isAdmin || cfg.adminOnly || handlerFn.admin),
            botAdminOnly: Boolean(cfg.isBotAdmin || cfg.botAdminOnly || handlerFn.botAdmin),
            run: async (ctx) => {
              ctx.m.command = ctx.command || ctx.m.command || '';
              ctx.m.args = ctx.args || ctx.m.args || [];
              ctx.m.text = ctx.q || ctx.m.text || '';
              ctx.m.query = ctx.q || ctx.m.query || '';
              ctx.m.q = ctx.q || ctx.m.q || '';
              ctx.m.prefix = ctx.usedPrefix || ctx.m.prefix || '.';
              ctx.m.usedPrefix = ctx.usedPrefix || ctx.m.usedPrefix || '.';
              ctx.m.isOwner = Boolean(ctx.isOwner);
              ctx.m.isAdmin = Boolean(ctx.isAdmin);
              ctx.m.isBotAdmin = Boolean(ctx.isBotAdmin);
              ctx.m.isGroup = Boolean(ctx.isGroup);

              return await handlerFn(ctx.m, {
                sock: ctx.sock,
                conn: ctx.sock,
                text: ctx.q || '',
                args: ctx.args || [],
                usedPrefix: ctx.usedPrefix || '.',
                command: ctx.command || '',
                isOwner: ctx.isOwner,
                isAdmin: ctx.isAdmin,
                isBotAdmin: ctx.isBotAdmin,
                isGroup: ctx.isGroup,
                plugins: ctx.plugins,
                handler: ctx.handler,
                user: ctx.user,
                groupMetadata: ctx.groupMetadata,
                participants: ctx.participants,
                store: ctx.store,
                db: ctx.db,
                config: ctx.config
              });
            }
          };
        }
      }

      if (plugin && typeof plugin.run === 'function') {
        const category = path.basename(path.dirname(filePath));
        plugin.category = plugin.category || category;
        plugin.filename = filename;
        plugin.filePath = filePath;

        this.categories.add(plugin.category);

        const registeredNames = new Set();

        // Register primary command safely (handle string, array, regex)
        let rawName = plugin.name;
        if (Array.isArray(rawName)) rawName = rawName[0];
        if (rawName instanceof RegExp) rawName = rawName.source.replace(/[^a-zA-Z0-9_-]/g, '');
        const primaryName = String(rawName || path.basename(filePath, '.js')).toLowerCase().trim();

        if (primaryName) {
          this.plugins.set(primaryName, plugin);
          registeredNames.add(primaryName);
        }

        // Register aliases safely
        let rawAliases = plugin.aliases || plugin.alias || [];
        if (typeof rawAliases === 'string') rawAliases = [rawAliases];
        if (Array.isArray(rawAliases)) {
          for (const alias of rawAliases) {
            let cleanAlias = alias;
            if (cleanAlias instanceof RegExp) cleanAlias = cleanAlias.source.replace(/[^a-zA-Z0-9_-]/g, '');
            cleanAlias = String(cleanAlias || '').toLowerCase().trim();
            if (cleanAlias && cleanAlias !== primaryName) {
              this.plugins.set(cleanAlias, plugin);
              registeredNames.add(cleanAlias);
            }
          }
        }

        this.fileMap.set(filePath, registeredNames);

        if (isReload) {
          console.log(chalk.greenBright(`[Hot Reload] 🔄 Plugin '${chalk.bold(filename)}' berhasil di-reload otomatis tanpa restart!`));
        }

        return true;
      } else {
        logger.warn(`[Plugin] '${filename}' tidak memiliki fungsi 'run()' yang valid.`);
        return false;
      }
    } catch (err) {
      logger.error(`[Plugin] Gagal mengimpor '${filename}': ${err.stack || err.message}`);
      return false;
    }
  }

  /**
   * Menghapus plugin dari memori saat file dihapus
   */
  unloadPluginFile(filePath, notify = true) {
    const filename = path.basename(filePath);
    const registeredNames = this.fileMap.get(filePath);

    if (registeredNames) {
      for (const name of registeredNames) {
        this.plugins.delete(name);
      }
      this.fileMap.delete(filePath);

      // Refresh categories
      this.refreshCategories();

      if (notify) {
        console.log(chalk.yellow(`[Hot Reload] 🗑️ Plugin '${chalk.bold(filename)}' telah dihapus dari memori.`));
      }
    }
  }

  /**
   * Refresh daftar kategori yang aktif
   */
  refreshCategories() {
    this.categories.clear();
    for (const plugin of this.plugins.values()) {
      if (plugin.category) {
        this.categories.add(plugin.category);
      }
    }
  }

  /**
   * Membaca seluruh plugin secara rekursif saat inisialisasi
   */
  async loadPlugins() {
    this.plugins.clear();
    this.fileMap.clear();
    this.categories.clear();

    const readDirRecursive = (dir) => {
      let results = [];
      if (!fs.existsSync(dir)) return results;
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
          results = results.concat(readDirRecursive(filePath));
        } else if (file.endsWith('.js')) {
          results.push(filePath);
        }
      }
      return results;
    };

    if (!fs.existsSync(PLUGINS_DIR)) {
      fs.mkdirSync(PLUGINS_DIR, { recursive: true });
    }

    const pluginFiles = readDirRecursive(PLUGINS_DIR);
    let loadedCount = 0;

    for (const filePath of pluginFiles) {
      const success = await this.loadPluginFile(filePath, false);
      if (success) loadedCount++;
    }

    logger.info(chalk.green(`[Plugin] Berhasil memuat ${loadedCount} plugin dari ${this.categories.size} kategori.`));

    // Mulai Hot Reload Watcher otomatis
    this.startWatcher();
  }

  /**
   * ⚡ HOT RELOAD WATCHER
   * Memantau folder /plugins secara otomatis saat ada file/folder baru, diedit, atau dihapus
   */
  startWatcher() {
    // Tutup watcher lama jika ada
    for (const watcher of this.watchers.values()) {
      try { watcher.close(); } catch {}
    }
    this.watchers.clear();

    const watchDirectoryRecursive = (dir) => {
      if (!fs.existsSync(dir)) return;

      try {
        const watcher = fs.watch(dir, async (eventType, filename) => {
          if (!filename) return;
          const fullPath = path.join(dir, filename);

          // Debounce 300ms untuk menghindari multi-trigger pada editor file
          if (this.debounceTimers.has(fullPath)) {
            clearTimeout(this.debounceTimers.get(fullPath));
          }

          this.debounceTimers.set(fullPath, setTimeout(async () => {
            this.debounceTimers.delete(fullPath);

            const exists = fs.existsSync(fullPath);

            if (exists) {
              try {
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                  // Folder baru dibuat di dalam plugins -> pasang watcher ke folder baru
                  watchDirectoryRecursive(fullPath);
                } else if (filename.endsWith('.js')) {
                  const isExisting = this.fileMap.has(fullPath);
                  await this.loadPluginFile(fullPath, isExisting);
                }
              } catch (e) {}
            } else {
              // File dihapus
              if (filename.endsWith('.js')) {
                this.unloadPluginFile(fullPath, true);
              }
            }
          }, 300));
        });

        this.watchers.set(dir, watcher);

        // Rekursif ke subfolder
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const itemPath = path.join(dir, item);
          try {
            if (fs.statSync(itemPath).isDirectory()) {
              watchDirectoryRecursive(itemPath);
            }
          } catch {}
        }
      } catch (err) {
        logger.warn(`[Hot Reload] Gagal memasang watcher pada ${dir}: ${err.message}`);
      }
    };

    watchDirectoryRecursive(PLUGINS_DIR);
    logger.info(chalk.cyan(`[Hot Reload] ⚡ File Watcher aktif pada folder /plugins (Auto Load & Syntax Checker Ready).`));
  }

  /**
   * Check if a JID is registered as an Owner
   */
  isOwner(jid, senderNumber, m = null, sock = null) {
    if (m?.fromMe) return true;

    const cleanNumber = (senderNumber || '').replace(/[^0-9]/g, '');
    const cleanJidNumber = (jid || '').split('@')[0].replace(/[^0-9]/g, '');

    // Cek nomor bot / akun yang terhubung di Baileys
    if (sock?.user) {
      const myId = (sock.user.id || '').split('@')[0].replace(/[^0-9]/g, '');
      const myLid = (sock.user.lid || '').split('@')[0].replace(/[^0-9]/g, '');
      if (myId && (cleanNumber === myId || cleanJidNumber === myId)) return true;
      if (myLid && (cleanNumber === myLid || cleanJidNumber === myLid)) return true;
    }

    // Cek apakah LID cocok dengan store cache bot
    if (store.myLid && (cleanNumber === store.myLid.split('@')[0] || cleanJidNumber === store.myLid.split('@')[0])) {
      return true;
    }

    // Cek mapped LID di store
    const mappedPn = store.lidMap?.get(jid) || store.lidMap?.get(`${cleanNumber}@lid`) || store.lidMap?.get(`${cleanNumber}@s.whatsapp.net`);
    const cleanMapped = mappedPn ? String(mappedPn).split('@')[0].replace(/[^0-9]/g, '') : '';

    // Cek daftar Owner dari settings dan database
    const allOwners = db.getOwners();
    return allOwners.some(ownerNum => {
      const cleanOwner = String(ownerNum).replace(/[^0-9]/g, '');
      return (
        cleanOwner === cleanNumber ||
        cleanOwner === cleanJidNumber ||
        (cleanMapped && cleanOwner === cleanMapped)
      );
    });
  }

  /**
   * Main message router
   */
  async handleMessage(sock, m) {
    if (!m || !m.message) return;

    // Database tracking
    const userDb = db.getUser(m.sender);
    userDb.lastSeen = Date.now();
    if (m.pushName) userDb.name = m.pushName;

    // Check if sender is returning from AFK
    if (userDb.afk?.active) {
      const afkDuration = formatDuration(Date.now() - (userDb.afk.time || Date.now()));
      const afkReason = userDb.afk.reason || 'Tanpa alasan';
      userDb.afk.active = false;
      db.save();

      await m.reply(`👋 *${toSmallCaps('selamat datang kembali')}* @${m.senderNumber}!\nKamu telah berhenti AFK setelah *${afkDuration}*.\nAlasan sebelumnya: "${afkReason}"`, {
        mentions: [m.sender]
      });
    }

    // Check if any mentioned or quoted user is currently AFK
    if (m.isGroup && (m.mentionedJid?.length > 0 || m.quoted)) {
      const checkedJids = new Set(m.mentionedJid || []);
      if (m.quoted?.sender) checkedJids.add(m.quoted.sender);

      for (const targetJid of checkedJids) {
        if (targetJid === m.sender) continue;
        const targetUser = db.getUser(targetJid);
        if (targetUser?.afk?.active) {
          const afkDuration = formatDuration(Date.now() - (targetUser.afk.time || Date.now()));
          const afkReason = targetUser.afk.reason || 'Tanpa alasan';
          await m.reply(`💤 @${targetJid.split('@')[0]} *${toSmallCaps('sedang afk')}* sejak *${afkDuration}* lalu.\nAlasan: "${afkReason}"`, {
            mentions: [targetJid]
          });
          break;
        }
      }
    }

    const groupDb = m.isGroup ? db.getGroup(m.chat) : null;

    // Auto-read if enabled
    if (config.autoRead || db.data.settings.autoRead) {
      try {
        await sock.readMessages([m.key]);
      } catch {}
    }

    // Extract media status
    const isMedia = m.type === 'imageMessage' || (m.quoted && (m.quoted.type === 'imageMessage' || m.quoted.msg?.mimetype?.startsWith('image/')));

    // Extract Prefix and Command
    const body = (m.text || '').trim();
    if (!body && !isMedia) return;

    const isButtonResponse = (
      m.type === 'interactiveResponseMessage' ||
      m.type === 'buttonsResponseMessage' ||
      m.type === 'listResponseMessage' ||
      m.type === 'templateButtonReplyMessage'
    );

    let isPrefixed = config.prefixes.some(p => body.startsWith(p));
    let usedPrefix = isPrefixed ? config.prefixes.find(p => body.startsWith(p)) : '.';
    let textWithoutPrefix = isPrefixed ? body.slice(usedPrefix.length).trim() : body;

    // Handle button responses or un-prefixed menu selections (e.g. "AI MENU", "Tools Menu", "menu ai")
    if (isButtonResponse || !isPrefixed) {
      const cleanBody = textWithoutPrefix.trim();
      const catMatch = cleanBody.match(/^(\w+)\s+menu$/i) || cleanBody.match(/^menu\s+(\w+)$/i);
      if (catMatch) {
        textWithoutPrefix = `menu ${catMatch[1].toLowerCase()}`;
        isPrefixed = true;
      } else if (isButtonResponse && this.plugins.has(cleanBody.split(/\s+/)[0].toLowerCase())) {
        isPrefixed = true;
      } else if (cleanBody.toLowerCase() === 'semua menu' || cleanBody.toLowerCase() === 'all menu') {
        textWithoutPrefix = 'allmenu';
        isPrefixed = true;
      } else if (cleanBody.toLowerCase() === 'profil akun' || cleanBody.toLowerCase() === 'profil saya') {
        textWithoutPrefix = 'profile';
        isPrefixed = true;
      }
    }

    const [rawCmd, ...args] = textWithoutPrefix.split(/\s+/);
    const command = (rawCmd || '').toLowerCase();
    const q = args.join(' ');

    // Attach parsed command metadata to m
    m.command = command || '';
    m.args = args || [];
    m.text = q || '';
    m.query = q || '';
    m.q = q || '';
    m.body = body || '';
    m.prefix = usedPrefix || '.';
    m.usedPrefix = usedPrefix || '.';

    // Find Plugin if prefixed or from button response
    const plugin = isPrefixed ? this.plugins.get(command) : (isButtonResponse ? this.plugins.get(command) : null);

    // Owner & Premium check
    const isOwnerUser = this.isOwner(m.sender, m.senderNumber, m, sock);
    if (isOwnerUser) {
      userDb.role = '👑 Owner';
      userDb.premium = true;
      userDb.limit = 999999;
    }
    const isPremiumUser = isOwnerUser || (userDb.premium && userDb.premiumTime > Date.now());

    // Self Mode Check
    if ((config.selfMode || db.data.settings.selfMode) && !isOwnerUser) {
      return;
    }

    // Auto-Chat Antigravity (Bisa ngobrol langsung tanpa prefix .agy jika mode autoAiChat aktif)
    const session = antigravity.getSession(m.sender);
    const hasActiveSession = Boolean(session.isLoggedIn && (session.token || session.oauth));
    const isAutoAiEnabled = db.data.settings.autoAiChat ?? true;
    const isDM = !m.isGroup;
    const isMentioned = m.isGroup && (
      (m.mentionedJid && m.mentionedJid.some(j => j.includes(store.myNumber || ''))) ||
      (m.quoted && (m.quoted.sender === store.myJid || m.quoted.fromMe))
    );

    // Jika pesan bukan merupakan plugin/command resmi bot, dan mode autoAiChat aktif:
    if (!plugin && (isDM || isMentioned) && isAutoAiEnabled && (body.length > 0 || isMedia)) {
      // Cek izin akses publik Antigravity jika user belum login & bukan owner
      if (!isOwnerUser && !hasActiveSession && !db.data.settings.antigravityPublic) {
        return;
      }

      // Potong limit hanya jika free user dan belum login dengan akun sendiri
      if (!isOwnerUser && !isPremiumUser && !hasActiveSession) {
        if ((userDb.limit || 0) < 1) return;
        userDb.limit -= 1;
        db.save();
      }

      // Ekstrak media gambar jika ada
      let imageBuffer = null;
      let mimeType = 'image/jpeg';
      if (m.type === 'imageMessage') {
        try {
          imageBuffer = await m.download();
          mimeType = m.msg?.mimetype || 'image/jpeg';
        } catch {}
      } else if (m.quoted && (m.quoted.type === 'imageMessage' || m.quoted.msg?.mimetype?.startsWith('image/'))) {
        try {
          imageBuffer = await m.quoted.download();
          mimeType = m.quoted.msg?.mimetype || 'image/jpeg';
        } catch {}
      }

      // Indikator mengetik
      try {
        await sock.sendPresenceUpdate('composing', m.chat);
      } catch {}

      try {
        const cleanPrompt = isMentioned 
          ? body.replace(new RegExp(`@${store.myNumber || ''}`, 'g'), '').trim()
          : (body || (imageBuffer ? 'Tolong analisis dan deskripsikan gambar ini.' : 'Halo'));

        const result = await antigravity.generateContent(m.sender, cleanPrompt, imageBuffer, mimeType, isOwnerUser || hasActiveSession);
        await m.reply(result.text);
        return;
      } catch (err) {
        if (err.message?.includes('AUTH_REQUIRED') || err.message?.includes('API Key') || err.message?.includes('Kunci API')) {
          await m.reply(`✕ *${toSmallCaps('antigravity ai')}:* ${err.message}`);
        } else {
          logger.warn(`[Auto AI] ${err.message}`);
        }
        return;
      }
    }

    if (!plugin) return; // Not a recognized command

    // Group Metadata & Admin resolution
    let groupMetadata = null;
    let participants = [];
    let isAdmin = false;
    let isBotAdmin = false;

    if (m.isGroup) {
      groupMetadata = await store.fetchGroupMetadata(sock, m.chat);
      participants = groupMetadata?.participants || [];
      
      const botNumber = (sock.user?.id || '').replace(/:\d+/, '').split('@')[0];
      const botLid = store.resolvePnToLid(sock.user?.id);

      // Check user admin
      const member = participants.find(p => 
        areJidsSameUser(p.id, m.sender) || 
        (p.lid && areJidsSameUser(p.lid, m.sender)) ||
        (m.senderPn && areJidsSameUser(p.id, m.senderPn))
      );
      isAdmin = member?.admin === 'admin' || member?.admin === 'superadmin' || isOwnerUser;

      // Check bot admin
      const botMember = participants.find(p => 
        (p.id && p.id.startsWith(botNumber)) || 
        (botLid && p.lid && areJidsSameUser(p.lid, botLid))
      );
      isBotAdmin = botMember?.admin === 'admin' || botMember?.admin === 'superadmin';
    }

    // Permissions Verification
    if (plugin.ownerOnly && !isOwnerUser) {
      return m.reply(config.messages.ownerOnly);
    }

    if (plugin.premiumOnly && !isPremiumUser) {
      return m.reply(`◈ _*${toSmallCaps('akses ditolak: khusus pengguna vip premium')}*_\n\n_› ${toSmallCaps('hubungi owner untuk melakukan upgrade.')}_`);
    }

    if (plugin.groupOnly && !m.isGroup) {
      return m.reply(config.messages.groupOnly);
    }

    if (plugin.privateOnly && m.isGroup) {
      return m.reply(config.messages.privateOnly);
    }

    if (plugin.adminOnly && !isAdmin) {
      return m.reply(config.messages.adminOnly);
    }

    if (plugin.botAdminOnly && !isBotAdmin) {
      return m.reply(config.messages.botAdminOnly);
    }

    // Limit check & deduction for non-owner and non-premium users
    const limitCost = typeof plugin.limit === 'number' ? plugin.limit : (plugin.limit === false ? 0 : 1);
    if (limitCost > 0 && !isOwnerUser && !isPremiumUser) {
      if ((userDb.limit || 0) < limitCost) {
        return m.reply(
          `┌───〔 ✕ *${toSmallCaps('limit penggunaan habis')}* 〕\n` +
          `│ › *${toSmallCaps('sisa limit')}:* 0\n` +
          `│ › *${toSmallCaps('reset')}:* ${toSmallCaps('setiap 24 jam')}\n` +
          `└────────────────────\n` +
          `_› ${toSmallCaps(`ketik ${usedPrefix}profile atau hubungi owner untuk upgrade vip.`)}_`
        );
      }
      userDb.limit -= limitCost;
    }

    // Rate Limiter / Cooldown
    if (!isOwnerUser && config.cooldownMs > 0) {
      const now = Date.now();
      const lastUsed = this.cooldowns.get(m.sender) || 0;
      if (now - lastUsed < config.cooldownMs) {
        return m.reply(config.messages.cooldown);
      }
      this.cooldowns.set(m.sender, now);
    }

    // Auto Typing Indicator
    if (config.autoTyping || db.data.settings.autoTyping) {
      try {
        await sock.sendPresenceUpdate('composing', m.chat);
      } catch {}
    }

    // Modern Terminal Console Logger
    const logTime = new Date().toLocaleTimeString('id-ID');
    const senderName = m.pushName || 'Unknown';
    const senderPhone = m.senderNumber ? `+${m.senderNumber}` : m.sender;
    const roleColor = isOwnerUser ? chalk.bold.red('[OWNER]') : (isPremiumUser ? chalk.bold.yellow('[PREMIUM]') : chalk.bold.gray('[FREE]'));
    const chatLocation = m.isGroup 
      ? chalk.yellow(`Group: "${groupMetadata?.subject || 'Unknown'}"`) + chalk.gray(` (${m.chat})`)
      : (m.isChannel || m.isNewsletter || m.chat.endsWith('@newsletter')
          ? chalk.magenta(`Saluran / Channel WhatsApp`) + chalk.gray(` (${m.chat})`)
          : chalk.cyan(`Private Chat`) + chalk.gray(` (${m.chat})`));
    const argsPreview = q ? chalk.gray(` | Args: "${q.length > 50 ? q.slice(0, 47) + '...' : q}"`) : '';

    console.log(chalk.bold.cyan(`\n╭───〔 ⚡ INCOMING COMMAND: ${chalk.bold.greenBright(usedPrefix + command)} 〕───`));
    console.log(`│ ${chalk.gray('⏱️  Time    :')} ${chalk.white(logTime + ' WIB')}`);
    console.log(`│ ${chalk.gray('👤  Sender  :')} ${chalk.greenBright(senderName)} ${chalk.gray(`(${senderPhone})`)} ${roleColor}`);
    console.log(`│ ${chalk.gray('💬  Chat ID :')} ${chatLocation}`);
    console.log(`│ ${chalk.gray('📦  Message :')} ${chalk.magenta(m.type || 'text')}${argsPreview}`);
    console.log(chalk.bold.cyan(`╰──────────────────────────────────────────────────`));

    // Track command usage & EXP progression in DB
    db.trackCommand(command);
    userDb.hit = (userDb.hit || 0) + 1;
    userDb.exp = (userDb.exp || 0) + 10;
    
    // Level up check (exp >= level * 100)
    const requiredExp = (userDb.level || 1) * 100;
    if (userDb.exp >= requiredExp) {
      userDb.level = (userDb.level || 1) + 1;
      userDb.exp = userDb.exp - requiredExp;
      userDb.role = db.calculateRole(userDb);
    }

    db.save();

    // Execute plugin
    const startTime = Date.now();
    try {
      await plugin.run({
        sock,
        m,
        args,
        q,
        command,
        usedPrefix,
        user: userDb,
        isOwner: isOwnerUser,
        isPremium: isPremiumUser,
        isAdmin,
        isBotAdmin,
        groupMetadata,
        participants,
        store,
        db,
        config,
        plugins: this.plugins,
        categories: this.categories,
        handler: this,
        font: toSmallCaps,
        toSmallCaps,
        glyphs,
        renderCard,
        renderHeader,
        renderRow,
        renderFooter
      });
      const latency = Date.now() - startTime;
      console.log(chalk.green(`  └─ [Success ✓] Latency: ${latency}ms\n`));
    } catch (err) {
      const latency = Date.now() - startTime;
      console.log(chalk.red(`  └─ [Failed ✕] Error: ${err.message} (${latency}ms)\n`));
      logger.error(`[CMD ERROR] ${command} (${latency}ms): ${err.stack || err.message}`);
      await m.reply(`${config.messages.error}\n\n*Detail:* ${err.message}`);
    }
  }
}

export const handler = new PluginHandler();
export default handler;
