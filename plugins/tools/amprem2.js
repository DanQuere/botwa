/**
 * Credit By Anita
 * Saluran: https://whatsapp.com/channel/0029Vb8dmsUElagkVPIw9X2P
 *
 * Flow: Register -> Ads -> TempMail -> Kirim Email ke WA -> Nunggu User Input di AM HP -> Sergap DeepLink
 */

import https from 'https';
import { URL } from 'url';
import crypto from 'crypto';
import zlib from 'zlib';

const pluginConfig = {
  name: "amprem2",
  alias: ["alightprem2", "createamprem", "amgen"],
  category: "tools",
  description: "Auto Generate / Activate Alight Motion Premium Account (Credit: Anita)",
  usage: ".amprem2",
  example: ".amprem2",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 300,
  energi: 50,
  isEnabled: true,
};

class CreateAmPrem {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || 'https://amprem.irfanjawa.com';
    this.timeout = config.timeout || 30000;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 2000;
    this.turnstileSiteKey = config.turnstileSiteKey || '0x4AAAAAADsWLA16vNVNqTCH';
    this.userAgent = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36';
    this.cookies = new Map();
    this.user = null;
    this.credentials = null;
    this.lastRequestTime = 0;
    this.v2AdsMethod = { url: '/api/ads/record', payload: { source: 'generator-v2' } };
    this.firebaseApiKey = 'AIzaSyDrZ9jr_Y16ltSBqsQR5IH6I04FRga6Ki0';
    this.bycf = config.bycf;
    this.logCallback = config.logCallback || (() => {});
  }

  _log(msg) { this.logCallback(msg); }
  _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
  async _rateLimit() {
    const wait = 700 - (Date.now() - this.lastRequestTime);
    if (wait > 0) await this._sleep(wait);
    this.lastRequestTime = Date.now();
  }
  _parseCookies(list) {
    (Array.isArray(list) ? list : [list]).forEach(c => {
      const [name, ...v] = c.split(';')[0].split('=');
      this.cookies.set(name.trim(), v.join('=').trim());
    });
  }
  _cookieStr() { return [...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join('; '); }
  _parseCooldown(msg) {
    const m = /(\d+)\s*detik/i.exec(msg || '');
    return m ? parseInt(m[1], 10) : null;
  }
  _randEmail() { return crypto.randomBytes(8).toString('hex') + '@zxy.com'; }
  _randPass() { return crypto.randomBytes(12).toString('base64') + 'A1!'; }

  async _request(method, path, body = null, options = {}) {
    await this._rateLimit();
    const url = new URL(path, this.baseUrl);
    const headers = {
      'User-Agent': this.userAgent,
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
      'Referer': options.referer || `${this.baseUrl}/dashboard/generator-v2`,
      'Origin': this.baseUrl,
    };
    if (this.cookies.size > 0) headers['Cookie'] = this._cookieStr();
    let payload = null;
    if (body !== null) {
      payload = JSON.stringify(body);
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    let lastErr;
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const res = await new Promise((resolve, reject) => {
          const req = https.request(url, { method, headers, timeout: this.timeout }, (r) => {
            const chunks = [];
            r.on('data', c => chunks.push(c));
            r.on('end', () => {
              let raw = Buffer.concat(chunks);
              try {
                const enc = r.headers['content-encoding'];
                if (enc === 'gzip') raw = zlib.gunzipSync(raw);
                else if (enc === 'deflate') raw = zlib.inflateSync(raw);
                else if (enc === 'br') raw = zlib.brotliDecompressSync(raw);
              } catch {}
              resolve({ statusCode: r.statusCode, headers: r.headers, text: raw.toString('utf-8') });
            });
          });
          req.on('error', reject);
          req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
          if (payload) req.write(payload);
          req.end();
        });

        if (res.headers['set-cookie']) this._parseCookies(res.headers['set-cookie']);
        let json = null;
        try { json = JSON.parse(res.text); } catch {}
        const result = { statusCode: res.statusCode, text: res.text, json, ok: res.statusCode >= 200 && res.statusCode < 300 };
        
        if (!result.ok && !options.allowFail && res.statusCode !== 403) {
          throw new Error(`HTTP ${res.statusCode}: ${res.text.slice(0, 120)}`);
        }
        return result;
      } catch (err) {
        lastErr = err;
        if (attempt < this.maxRetries) await this._sleep(this.retryDelay * attempt);
      }
    }
    throw lastErr;
  }
  _get(p, o = {}) { return this._request('GET', p, null, o); }
  _post(p, b, o = {}) { return this._request('POST', p, b, o); }

  async solveTurnstile() {
    const token = await this.bycf.turnstileMin(`${this.baseUrl}/auth`, this.turnstileSiteKey, null);
    if (!token || token.length < 50) throw new Error('BYCF invalid token');
    return token;
  }

  async register() {
    this.credentials = { email: this._randEmail(), password: this._randPass() };
    this._log(`ðŸ“ Registrasi akun amprem...`);
    const token = await this.solveTurnstile();
    const res = await this._post('/api/auth/register', { ...this.credentials, turnstileToken: token }, { allowFail: true, referer: `${this.baseUrl}/auth` });
    if (!res.ok || res.json?.success === false) throw new Error(res.json?.error || 'Register failed');
  }

  async login() {
    this._log(`ðŸ”‘ Login akun amprem...`);
    const token = await this.solveTurnstile();
    const res = await this._post('/api/auth/login', { ...this.credentials, turnstileToken: token }, { allowFail: true, referer: `${this.baseUrl}/auth` });
    if (!res.ok || !res.json?.success) throw new Error(res.json?.error || 'Login failed');
    this.user = res.json.user;
  }

  async getStatus() {
    const res = await this._get('/api/generator-v2/status', { allowFail: true });
    return res.ok ? res.json : null;
  }

  async watchV2Ads(target = 5) {
    this._log(`ðŸŽ¯ Menonton iklan (target: ${target})...`);
    for (let i = 0; i < 60; i++) {
      const st = await this.getStatus();
      const count = st?.session?.adsCompleted || 0;
      if (count >= target) return count;
      
      const res = await this._post(this.v2AdsMethod.url, this.v2AdsMethod.payload, { allowFail: true });
      if (res.ok && res.json?.success) {
        await this._sleep(4000);
        continue;
      }
      if (res.statusCode === 400) {
        const wait = this._parseCooldown(res.json?.error) ?? 10;
        await this._sleep((wait + 1) * 1000);
        continue;
      }
      throw new Error(res.json?.error || `V2 record failed HTTP ${res.statusCode}`);
    }
    throw new Error('V2 Ads loop melebihi batas');
  }

  async triggerAMLogin(email) {
    this._log('ðŸ”¥ Trigger Firebase Auth...');
    const urlV1 = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${this.firebaseApiKey}`;
    const payload = JSON.stringify({
      email: email, requestType: "EMAIL_SIGNIN", continueUrl: "https://alightcreative.com",
      canHandleCodeInApp: true, androidPackageName: "com.alightcreative.motion",
      androidInstallApp: true, androidMinimumVersion: "12", iOSBundleId: "com.alightcreative.alightmotion"
    });
    const referers = ['https://alight-creative.firebaseapp.com/', 'https://alightcreative.com/'];
    for (const referer of referers) {
      const headers = {
        'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload),
        'User-Agent': this.userAgent, 'X-Client-Version': 'Chrome/JsCore/10.12.0/FirebaseCore-web',
        'Referer': referer, 'Origin': referer.endsWith('/') ? referer.slice(0, -1) : referer
      };
      try {
        const res = await new Promise((resolve, reject) => {
          const req = https.request(urlV1, { method: 'POST', headers, timeout: 15000 }, (r) => {
            let data = ''; r.on('data', chunk => data += chunk); r.on('end', () => resolve({ statusCode: r.statusCode, text: data }));
          });
          req.on('error', reject); req.write(payload); req.end();
        });
        if (res.statusCode === 200) return true;
      } catch (err) {}
    }
    return false;
  }

  _cleanDeepLink(u) {
    if (!u) return u;
    return u.split(/%27%3E|'%3E|'>|"%3E|">/)[0].trim();
  }

  async extractDeepLink(timeoutMs = 150000) {
    this._log('ðŸ”— Menunggu server mengekstrak link verifikasi...');
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const poll = await this._get('/api/generator-v2/poll-email', { allowFail: true });
      if (poll.ok && poll.json) {
        const early = poll.json.link2ExtractedUrl || poll.json.url || poll.json.deepLink;
        if (early) return this._cleanDeepLink(early);
      }
      const st = await this.getStatus();
      const url = st?.session?.link2ExtractedUrl;
      if (url) return this._cleanDeepLink(url);
      
      await this._sleep(5000);
    }
    return null;
  }

  _extractOobCode(deepLink) {
    try {
      const url = new URL(deepLink);
      let innerLink = url.searchParams.get('link') || deepLink;
      innerLink = decodeURIComponent(innerLink);
      const innerUrl = new URL(innerLink);
      return innerUrl.searchParams.get('oobCode');
    } catch (e) {
      const match = /oobCode(?:%3D|=)([^&%]+)/i.exec(deepLink);
      return match ? decodeURIComponent(match[1]) : null;
    }
  }

  async getFirebaseTokens(email, oobCode) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithEmailLink?key=${this.firebaseApiKey}`;
    const payload = JSON.stringify({ email, oobCode });
    const headers = {
      'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload),
      'User-Agent': this.userAgent, 'X-Client-Version': 'Chrome/JsCore/10.12.0/FirebaseCore-web',
      'Referer': 'https://alight-creative.firebaseapp.com/', 'Origin': 'https://alight-creative.firebaseapp.com'
    };
    const res = await new Promise((resolve, reject) => {
      const req = https.request(url, { method: 'POST', headers, timeout: 15000 }, (r) => {
        let data = ''; r.on('data', chunk => data += chunk); r.on('end', () => resolve({ statusCode: r.statusCode, text: data }));
      });
      req.on('error', reject); req.write(payload); req.end();
    });
    if (res.statusCode === 200) {
      const json = JSON.parse(res.text);
      return { idToken: json.idToken, refreshToken: json.refreshToken, email: json.email };
    }
    return null;
  }

  _extractLinkFromText(text) {
    if (!text) return null;
    const m = /https:\/\/alight-creative\.firebaseapp\.com\/__\/auth\/links\?[^"'<>\s\\]+/i.exec(text);
    if (m) return m[0].replace(/&amp;/g, '&');
    const m2 = /https:\/\/alightcreative\.com\/auth_action\/\?[^"'<>\s\\]+/i.exec(text);
    return m2 ? m2[0].replace(/&amp;/g, '&') : null;
  }

  async _tryTempMailInbox(tempEmail, silent = false) {
    const candidates = [
      `/api/temp-mail/messages?email=${encodeURIComponent(tempEmail)}`,
      `/api/temp-mail/inbox?email=${encodeURIComponent(tempEmail)}`,
      `/api/temp-mail/messages?address=${encodeURIComponent(tempEmail)}`,
    ];
    for (const p of candidates) {
      try {
        const res = await this._get(p, { allowFail: true, silent });
        if (res.ok && res.text && /alight/i.test(res.text)) {
          const link = this._extractLinkFromText(res.text);
          if (link) return link;
        }
      } catch {}
    }
    return null;
  }

  async waitForAppLink(previousLink, tempEmail, timeoutMs = 180000) {
    this._log('ðŸ“± [MENUNGGU] Masukkan email ke Alight Motion HP lalu klik Send Link...');
    const prevCode = this._extractOobCode(previousLink || '');
    const start = Date.now();
    
    while (Date.now() - start < timeoutMs) {
      const stRes = await this._get('/api/generator-v2/status', { allowFail: true, silent: true });
      const st = stRes?.ok ? stRes.json : null;
      const u1 = st?.session?.link2ExtractedUrl;
      if (u1 && this._extractOobCode(u1) && this._extractOobCode(u1) !== prevCode) {
        return this._cleanDeepLink(u1);
      }
      
      const poll = await this._get('/api/generator-v2/poll-email', { allowFail: true, silent: true });
      const u2 = poll?.json?.link2ExtractedUrl || poll?.json?.url || poll?.json?.deepLink;
      if (u2 && this._extractOobCode(u2) && this._extractOobCode(u2) !== prevCode) {
        return this._cleanDeepLink(u2);
      }
      
      const u3 = await this._tryTempMailInbox(tempEmail, true);
      if (u3 && this._extractOobCode(u3) && this._extractOobCode(u3) !== prevCode) {
        return this._cleanDeepLink(u3);
      }
      
      await this._sleep(4000);
    }
    return null;
  }
}

async function handler(m, { sock }) {
  let bycf;
  try {
    const bycfModule = await import('bycf');
    bycf = bycfModule.default?.shz || bycfModule.shz || bycfModule;
  } catch {
    return m.reply("âŒ Modul `bycf` belum terinstall. Silakan jalankan `npm install bycf` di terminal server.");
  }

  await m.react('â³');
  let statusMsg = await m.reply("ðŸš€ *Menyiapkan Akun Alight Motion Premium...*");

  const updateLog = async (text) => {
    try {
      await sock.sendMessage(m.chat, { text: `ðŸ”„ *Progress:* ${text}` }, { quoted: statusMsg });
    } catch (e) {}
  };

  try {
    const scraper = new CreateAmPrem({ 
      bycf: bycf,
      logCallback: updateLog 
    });

    // 1. Persiapan Akun & Temp Mail
    await scraper.register();
    await scraper.login();
    await scraper.watchV2Ads(1);

    updateLog("ðŸ“§ Membuat Email Temporary...");
    const gen = await scraper._post('/api/temp-mail/generate', {}, { allowFail: true });
    if (!gen.ok || !gen.json?.success) throw new Error(gen.json?.error || 'Gagal buat temp mail');
    const tempEmail = gen.json.emailAddress;

    await scraper.watchV2Ads(5);

    updateLog("ðŸ”— Mengaktifkan Status Premium...");
    const sel = await scraper._post('/api/generator-v2/select-email', { emailAddress: tempEmail }, { allowFail: true });
    if (!sel.ok || !sel.json?.success) throw new Error(sel.json?.error || 'select-email gagal');

    let premium = false;
    for (let i = 0; i < 40 && !premium; i++) {
      await scraper._sleep(3000);
      const poll = await scraper._get('/api/generator-v2/poll-email', { allowFail: true });
      if (poll.ok && poll.json?.message && /premium aktif/i.test(poll.json.message)) premium = true;
      const st2 = await scraper.getStatus();
      if (st2?.isPremium === true) premium = true;
    }

    if (!premium) throw new Error("Aktivasi akun Premium gagal di server.");

    // 2. Ekstrak Token awal
    let deepLink = null;
    let tokens = null;
    const firebaseOk = await scraper.triggerAMLogin(tempEmail);
    if (firebaseOk) {
      deepLink = await scraper.extractDeepLink();
      if (deepLink) {
        const oobCode = scraper._extractOobCode(deepLink);
        if (oobCode) tokens = await scraper.getFirebaseTokens(tempEmail, oobCode);
      }
    }

    // 3. SEGERA KIRIM EMAIL & TOKEN KE WA DULUAN!
    const instructionText = 
      `====================================\n` +
      `âœ… *EMAIL AM PREMIUM SIAP!* âœ…\n` +
      `====================================\n\n` +
      `ðŸ‘¤ *Credit:* Anita\n` +
      `ðŸ“¢ *Saluran:* https://whatsapp.com/channel/0029Vb8dmsUElagkVPIw9X2P\n\n` +
      `ðŸ“§ *Email AM:* \`${tempEmail}\`\n` +
      `ðŸ‘‘ *Status Premium:* YES\n\n` +
      `â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n` +
      `ðŸ“Œ *INSTRUKSI SEGERA (Waktu: 3 Menit):*\n` +
      `1. Salin email di atas: \`${tempEmail}\`\n` +
      `2. Buka aplikasi *Alight Motion* di HP Anda.\n` +
      `3. Masuk ke Profil -> Masuk dengan Email.\n` +
      `4. Tempel email tersebut dan klik *"Kirim Tautan / Send Link"*.\n\n` +
      `â³ *Bot sedang menunggu & akan otomatis menyergap Link Login-nya...*`;

    await sock.sendMessage(m.chat, { text: instructionText }, { quoted: m });

    // 4. Merekam & Menyergap Link Login Baru dari Aplikasi HP
    const appLink = await scraper.waitForAppLink(deepLink, tempEmail, 180000); // Nunggu 3 menit

    if (appLink) {
      let successMsg = 
        `ðŸŽ‰ *LINK LOGIN BERHASIL DISERGAP!*\n\n` +
        `ðŸ“± *CARA PAKAI:*\n` +
        `1. Klik/Ketuk link di bawah ini.\n` +
        `2. Pilih *"Buka di Alight Motion"*\n` +
        `3. Akun otomatis ter-login & Premium Aktif!\n\n` +
        `ðŸ”— *LINK LOGIN:*\n${appLink}`;

      await sock.sendMessage(m.chat, { text: successMsg }, { quoted: m });
      await m.react('âœ…');
    } else {
      let failMsg = 
        `âš ï¸ *TIDAK DETEKSI KLIK DARI HP*\n\n` +
        `Gagal menyergap link otomatis karena Anda belum menekan tombol "Kirim Tautan" di aplikasi AM HP selama kurun waktu 3 menit.\n\n` +
        `ðŸ”‘ *Gunakan Refresh Token (Opsional Mod APK):*\n\`${tokens?.refreshToken || 'Tidak ada token'}\``;

      await sock.sendMessage(m.chat, { text: failMsg }, { quoted: m });
      await m.react('âŒ');
    }

  } catch (err) {
    console.error('[AMPREM ERROR]', err);
    await m.react('âŒ');
    await m.reply(`âŒ *Proses Gagal:* ${err.message}`);
  }
}

export { pluginConfig as config, handler };