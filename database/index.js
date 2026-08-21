import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import settings from '../settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Database {
  constructor(filePath = path.join(__dirname, 'db.json')) {
    this.filePath = filePath;
    this.data = {
      users: {},
      groups: {},
      stats: {
        totalCommands: 0,
        commands: {},
        lastReset: Date.now()
      },
      settings: {
        selfMode: false,
        autoRead: false,
        autoTyping: false,
        autoViewSw: true,
        autoReactSw: true,
        swEmojis: ['🐔', '🗿', '🦄', '🤖', '👑', '🔥', '⚡', '🐧', '🦊'],
        maintenance: false,
        owners: (settings.owners || ['6281234567890']).map(v => v.replace(/[^0-9]/g, '')),
        antigravityPublic: true,
        antigravityPublicLimit: 1
      }
    };
    this.saveTimeout = null;
    this.init();
  }

  init() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        if (raw.trim()) {
          const parsed = JSON.parse(raw);
          this.data = {
            users: parsed.users || {},
            groups: parsed.groups || {},
            stats: parsed.stats || this.data.stats,
            settings: Object.assign({
              selfMode: false,
              autoRead: false,
              autoTyping: false,
              autoViewSw: true,
              autoReactSw: true,
              swEmojis: ['🐔', '🗿', '🦄', '🤖', '👑', '🔥', '⚡', '🐧', '🦊'],
              maintenance: false,
              owners: (settings.owners || ['6281234567890']).map(v => v.replace(/[^0-9]/g, '')),
              antigravityPublic: true,
              antigravityPublicLimit: 1
            }, parsed.settings || {})
          };
        }
      } else {
        this.saveSync();
      }
    } catch (err) {
      console.error('[DB] Error initializing database:', err);
    }
  }

  saveSync() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error saving database synchronously:', err);
    }
  }

  save() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      try {
        fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8', (err) => {
          if (err) console.error('[DB] Error saving database:', err);
        });
      } catch (err) {
        console.error('[DB] Error in async save:', err);
      }
    }, 1500);
  }

  /**
   * Normalisasi format JID ke Phone Number JID (e.g. 628xxx@s.whatsapp.net)
   */
  normalizeJid(jid) {
    if (!jid) return '';
    const cleanNumber = String(jid).replace(/[^0-9]/g, '');
    return cleanNumber ? `${cleanNumber}@s.whatsapp.net` : jid;
  }

  /**
   * Ambil / inisialisasi data user di database
   */
  getUser(rawJid) {
    const jid = this.normalizeJid(rawJid);
    if (!jid) return null;

    const defaultLimit = settings.defaultLimit ?? 25;

    if (!this.data.users[jid]) {
      this.data.users[jid] = {
        name: '',
        registered: false,
        premium: false,
        premiumTime: 0, // timestamp expired
        limit: defaultLimit,
        maxLimit: defaultLimit,
        exp: 0,
        level: 1,
        role: 'Free User',
        banned: false,
        hit: 0,
        lastClaim: 0,
        lastResetLimit: Date.now(),
        lastSeen: Date.now(),
        createdAt: Date.now()
      };
      this.save();
    } else {
      // Pastikan field selalu lengkap
      const u = this.data.users[jid];
      if (typeof u.premium !== 'boolean') u.premium = false;
      if (typeof u.premiumTime !== 'number') u.premiumTime = 0;
      if (typeof u.limit !== 'number') u.limit = defaultLimit;
      if (typeof u.maxLimit !== 'number') u.maxLimit = defaultLimit;
      if (typeof u.exp !== 'number') u.exp = 0;
      if (typeof u.level !== 'number') u.level = 1;
      if (!u.role) u.role = 'Free User';
      if (typeof u.banned !== 'boolean') u.banned = false;
      if (typeof u.hit !== 'number') u.hit = 0;
      if (typeof u.lastResetLimit !== 'number') u.lastResetLimit = Date.now();
    }

    // Auto-check expired premium
    const user = this.data.users[jid];
    if (user.premium && user.premiumTime > 0 && Date.now() > user.premiumTime) {
      user.premium = false;
      user.premiumTime = 0;
      user.role = this.calculateRole(user);
      user.limit = Math.min(user.limit, defaultLimit);
      this.save();
    }

    // Auto reset limit harian per user (24 jam)
    const ONE_DAY = 24 * 60 * 60 * 1000;
    if (Date.now() - (user.lastResetLimit || 0) >= ONE_DAY) {
      user.limit = user.premium ? (settings.premiumLimit || 1000) : defaultLimit;
      user.lastResetLimit = Date.now();
      this.save();
    }

    return user;
  }

  /**
   * Menghitung role berdasarkan level/exp
   */
  calculateRole(user) {
    if (user.premium) return 'VIP Premium ⭐';
    const lvl = user.level || 1;
    if (lvl >= 50) return 'Mythic Legend 👑';
    if (lvl >= 30) return 'Grand Master 🎖️';
    if (lvl >= 20) return 'Master 🏆';
    if (lvl >= 10) return 'Gold 🥇';
    if (lvl >= 5) return 'Silver 🥈';
    return 'Bronze 🥉 (Free User)';
  }

  /**
   * Tambah status premium ke user
   */
  addPremium(rawJid, days = 30) {
    const user = this.getUser(rawJid);
    if (!user) return false;

    const msToAdd = Number(days) * 24 * 60 * 60 * 1000;
    const currentExpiry = user.premium && user.premiumTime > Date.now() ? user.premiumTime : Date.now();

    user.premium = true;
    user.premiumTime = currentExpiry + msToAdd;
    user.role = 'VIP Premium ⭐';
    user.limit = settings.premiumLimit || 1000;
    this.save();
    return user;
  }

  /**
   * Hapus status premium dari user
   */
  delPremium(rawJid) {
    const user = this.getUser(rawJid);
    if (!user) return false;

    user.premium = false;
    user.premiumTime = 0;
    user.role = this.calculateRole(user);
    user.limit = Math.min(user.limit, settings.defaultLimit || 25);
    this.save();
    return user;
  }

  /**
   * Tambah limit user
   */
  addLimit(rawJid, amount = 10) {
    const user = this.getUser(rawJid);
    if (!user) return false;

    user.limit = (user.limit || 0) + Number(amount);
    this.save();
    return user;
  }

  /**
   * Reset limit semua user
   */
  resetAllLimits(limitAmount = (settings.defaultLimit || 25)) {
    let count = 0;
    for (const jid in this.data.users) {
      const u = this.data.users[jid];
      if (u.premium) {
        u.limit = settings.premiumLimit || 1000;
      } else {
        u.limit = limitAmount;
      }
      u.lastResetLimit = Date.now();
      count++;
    }
    this.save();
    return count;
  }

  getGroup(jid) {
    if (!this.data.groups[jid]) {
      this.data.groups[jid] = {
        subject: '',
        banned: false,
        welcome: true,
        antilink: false,
        antidelete: false,
        mute: false,
        createdAt: Date.now()
      };
      this.save();
    }
    return this.data.groups[jid];
  }

  /**
   * Tambah nomor Owner baru
   */
  addOwner(number) {
    const cleanNumber = String(number).replace(/[^0-9]/g, '');
    if (!cleanNumber) return false;

    if (!this.data.settings.owners) {
      this.data.settings.owners = [];
    }

    if (!this.data.settings.owners.includes(cleanNumber)) {
      this.data.settings.owners.push(cleanNumber);
      this.save();
    }

    return this.data.settings.owners;
  }

  /**
   * Hapus nomor Owner
   */
  delOwner(number) {
    const cleanNumber = String(number).replace(/[^0-9]/g, '');
    if (!cleanNumber || !this.data.settings.owners) return false;

    this.data.settings.owners = this.data.settings.owners.filter(num => num !== cleanNumber);
    this.save();
    return this.data.settings.owners;
  }

  /**
   * Ambil seluruh nomor Owner
   */
  getOwners() {
    const fromConfig = (settings.owners || []).map(v => String(v).replace(/[^0-9]/g, ''));
    const fromDb = this.data.settings.owners || [];
    return Array.from(new Set([...fromConfig, ...fromDb]));
  }

  /**
   * Cek apakah nomor adalah Owner
   */
  isOwner(number) {
    const cleanNumber = String(number).replace(/[^0-9]/g, '');
    return this.getOwners().includes(cleanNumber);
  }

  trackCommand(commandName) {
    if (!this.data.stats.commands[commandName]) {
      this.data.stats.commands[commandName] = 0;
    }
    this.data.stats.commands[commandName]++;
    this.data.stats.totalCommands++;
    this.save();
  }
}

export const db = new Database();
export default db;
