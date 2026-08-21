import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import { execFile, execSync } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import axios from 'axios';
import logger from '../utils/logger.js';
import { toSmallCaps, glyphs } from '../utils/font.js';
import settings from '../settings.js';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSIONS_FILE = path.resolve(__dirname, '../database/antigravity_sessions.json');

// Google OAuth 2.0 Official Antigravity Client ID, Client Secret & Scopes
export const GOOGLE_OAUTH_CLIENT_ID = '1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com';
export const GOOGLE_OAUTH_CLIENT_SECRET = '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';
export const GOOGLE_OAUTH_REDIRECT_URI = 'https://antigravity.google/oauth-callback';
export const GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/cclog',
  'https://www.googleapis.com/auth/experimentsandconfigs',
  'https://www.googleapis.com/auth/aicode',
  'openid'
].join(' ');

/**
 * Base64 URL Encoder Helper untuk PKCE
 */
function base64URLEncode(buffer) {
  return buffer.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate PKCE Code Verifier, Code Challenge, & State
 */
export function generatePKCE() {
  const codeVerifier = base64URLEncode(crypto.randomBytes(32));
  const sha256 = crypto.createHash('sha256').update(codeVerifier).digest();
  const codeChallenge = base64URLEncode(sha256);
  const state = base64URLEncode(crypto.randomBytes(16));
  return { codeVerifier, codeChallenge, state };
}

// Deteksi lokasi binary Antigravity CLI (agy) secara otomatis di berbagai OS/Panel
export function detectAgyBinary() {
  const homedir = os.homedir();
  const candidates = [
    path.join(homedir, '.local', 'bin', 'agy'),
    '/home/runner/.local/bin/agy',
    '/usr/local/bin/agy',
    '/usr/bin/agy',
    '/bin/agy'
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) {
        fs.accessSync(p, fs.constants.X_OK);
        return p;
      }
    } catch {}
  }

  // Cek apakah 'agy' ada di system PATH global
  try {
    const whichRes = execSync('which agy 2>/dev/null', { encoding: 'utf-8' }).trim();
    if (whichRes && fs.existsSync(whichRes)) {
      fs.accessSync(whichRes, fs.constants.X_OK);
      return whichRes;
    }
  } catch {}

  return null;
}

// Daftar model resmi
export const ANTIGRAVITY_MODELS = [
  { id: 'gemini-3.7-flash-high', name: 'Gemini 3.7 Flash (High)', desc: 'Super Cepat, Full Coding & Reasoning (Default)', tier: 'Standard' },
  { id: 'gemini-3.7-flash-medium', name: 'Gemini 3.7 Flash (Medium)', desc: 'Responsif & Efisien', tier: 'Standard' },
  { id: 'gemini-3.1-pro-high', name: 'Gemini 3.1 Pro (High)', desc: 'Deep Reasoning & Advanced Architecture', tier: 'Pro' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (REST)', desc: 'Model Realtime API Cepat', tier: 'Standard' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (REST)', desc: 'Model Ringan & Responsif', tier: 'Standard' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (REST)', desc: 'Long Context Window 1M', tier: 'Pro' },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', desc: 'Claude Sonnet Thinking Engine', tier: 'Ultra' },
  { id: 'claude-opus-4-6-thinking', name: 'Claude Opus 4.6', desc: 'Claude Opus Deep Thinking', tier: 'Ultra' }
];

export class AntigravityEngine {
  constructor() {
    this.sessions = new Map();
    this.loadSessions();
  }

  loadSessions() {
    try {
      if (fs.existsSync(SESSIONS_FILE)) {
        const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8');
        if (raw.trim()) {
          const parsed = JSON.parse(raw);
          for (const [jid, data] of Object.entries(parsed)) {
            this.sessions.set(jid, data);
          }
        }
      }
    } catch (err) {
      logger.error(`[Antigravity] Gagal memuat sesi: ${err.message}`);
    }
  }

  saveSessions() {
    try {
      const obj = {};
      for (const [jid, data] of this.sessions.entries()) {
        obj[jid] = data;
      }
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch (err) {
      logger.error(`[Antigravity] Gagal menyimpan sesi: ${err.message}`);
    }
  }

  getSession(userJid) {
    const cleanJid = String(userJid).replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    if (!this.sessions.has(cleanJid)) {
      this.sessions.set(cleanJid, {
        userJid: cleanJid,
        isLoggedIn: false,
        token: settings.antigravityToken || process.env.GEMINI_API_KEY || '',
        authType: 'none',
        oauth: null,
        pendingOAuth: null,
        model: 'gemini-3.7-flash-high',
        effort: 'medium',
        systemInstruction: '',
        history: [],
        usage: {
          promptTokens: 0,
          candidatesTokens: 0,
          totalTokens: 0,
          totalRequests: 0,
          lastRequestTime: null
        },
        createdAt: Date.now(),
        lastActive: Date.now()
      });
      this.saveSessions();
    }

    const session = this.sessions.get(cleanJid);
    if (!session.effort) session.effort = 'medium';
    return session;
  }

  /**
   * Membuat tautan otorisasi Google OAuth 2.0 PKCE resmi untuk Antigravity
   */
  getOAuthUrl(userJid) {
    const session = this.getSession(userJid);
    const { codeVerifier, codeChallenge, state } = generatePKCE();

    // Simpan codeVerifier & state sementara pada sesi user untuk proses penukaran kode nanti
    session.pendingOAuth = {
      codeVerifier,
      state,
      createdAt: Date.now()
    };
    this.saveSessions();

    const params = new URLSearchParams({
      access_type: 'offline',
      client_id: GOOGLE_OAUTH_CLIENT_ID,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      prompt: 'consent',
      redirect_uri: GOOGLE_OAUTH_REDIRECT_URI,
      response_type: 'code',
      scope: GOOGLE_OAUTH_SCOPES,
      state: state
    });

    return `https://accounts.google.com/o/oauth2/auth?${params.toString()}`;
  }

  /**
   * Login & Aktivasi Sesi (Mendukung Kode Otorisasi PKCE, Google OAuth Access Token, atau Google AI Studio API Key)
   */
  async login(userJid, rawToken) {
    const session = this.getSession(userJid);
    const cleanToken = String(rawToken || '').trim();

    if (!cleanToken) {
      throw new Error('Token atau kode otorisasi tidak boleh kosong.');
    }

    // 1. JIKA TOKEN ADALAH GOOGLE AI STUDIO API KEY (diawali AIzaSy...)
    if (cleanToken.startsWith('AIza')) {
      session.authType = 'apikey';
      session.token = cleanToken;
      session.isLoggedIn = true;
      session.pendingOAuth = null;
      session.lastActive = Date.now();
      this.saveSessions();
      return { success: true, type: 'apikey', session };
    }

    // 2. JIKA TOKEN ADALAH GOOGLE ACCESS TOKEN LANGSUNG (diawali ya29.)
    if (cleanToken.startsWith('ya29.')) {
      session.authType = 'oauth';
      session.token = cleanToken;
      session.isLoggedIn = true;
      session.pendingOAuth = null;
      session.lastActive = Date.now();
      this.saveSessions();
      return { success: true, type: 'oauth', session };
    }

    // 3. JIKA TOKEN ADALAH AUTHORIZATION CODE (diawali '4/' atau terdapat pending OAuth session)
    if (cleanToken.startsWith('4/') || session.pendingOAuth) {
      try {
        const bodyParams = new URLSearchParams();
        bodyParams.append('client_id', GOOGLE_OAUTH_CLIENT_ID);
        bodyParams.append('client_secret', GOOGLE_OAUTH_CLIENT_SECRET);
        bodyParams.append('code', cleanToken);
        bodyParams.append('grant_type', 'authorization_code');
        bodyParams.append('redirect_uri', GOOGLE_OAUTH_REDIRECT_URI);

        if (session.pendingOAuth?.codeVerifier) {
          bodyParams.append('code_verifier', session.pendingOAuth.codeVerifier);
        }

        const res = await axios.post('https://oauth2.googleapis.com/token', bodyParams.toString(), {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          timeout: 20000
        });

        if (res.data && res.data.access_token) {
          session.authType = 'oauth';
          session.oauth = {
            accessToken: res.data.access_token,
            refreshToken: res.data.refresh_token || (session.oauth?.refreshToken ?? ''),
            expiresAt: Date.now() + ((res.data.expires_in || 3600) * 1000),
            idToken: res.data.id_token || null,
            tokenType: res.data.token_type || 'Bearer'
          };
          session.token = res.data.access_token;
          session.isLoggedIn = true;
          session.pendingOAuth = null;
          session.lastActive = Date.now();
          this.saveSessions();

          return { success: true, type: 'oauth', session };
        }
      } catch (err) {
        const errDesc = err.response?.data?.error_description || err.response?.data?.error || err.message;
        logger.warn(`[Antigravity OAuth] Gagal menukar kode otorisasi: ${errDesc}`);

        throw new Error(
          `Gagal menukar Authorization Code dengan Google OAuth: ${errDesc}.\n\n` +
          `Saran: Kode otorisasi Google hanya bisa digunakan 1 kali dan berdurasi singkat.\n` +
          `Ketik /login untuk membuat tautan baru dan dapatkan kode yang masih segar.`
        );
      }
    }

    // 4. Token kustom lainnya
    session.authType = 'custom';
    session.token = cleanToken;
    session.isLoggedIn = true;
    session.pendingOAuth = null;
    session.lastActive = Date.now();
    this.saveSessions();
    return { success: true, type: 'custom', session };
  }

  /**
   * Otomatis me-refresh Access Token Google OAuth jika sudah kadaluarsa
   */
  async refreshOAuthToken(session) {
    if (!session?.oauth?.refreshToken) return null;

    try {
      const bodyParams = new URLSearchParams();
      bodyParams.append('client_id', GOOGLE_OAUTH_CLIENT_ID);
      bodyParams.append('client_secret', GOOGLE_OAUTH_CLIENT_SECRET);
      bodyParams.append('grant_type', 'refresh_token');
      bodyParams.append('refresh_token', session.oauth.refreshToken);

      const res = await axios.post('https://oauth2.googleapis.com/token', bodyParams.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 20000
      });

      if (res.data?.access_token) {
        session.oauth.accessToken = res.data.access_token;
        session.oauth.expiresAt = Date.now() + ((res.data.expires_in || 3600) * 1000);
        session.token = res.data.access_token;
        this.saveSessions();
        return res.data.access_token;
      }
    } catch (err) {
      logger.error(`[Antigravity OAuth] Gagal merefresh token: ${err.message}`);
    }

    return null;
  }

  /**
   * Mengambil token aktif yang valid dan siap digunakan
   */
  async getActiveToken(session) {
    if (session.authType === 'oauth' && session.oauth?.refreshToken) {
      // Refresh jika token sudah expired atau tersisa < 1 menit
      if (!session.oauth.expiresAt || Date.now() >= session.oauth.expiresAt - 60000) {
        const refreshed = await this.refreshOAuthToken(session);
        if (refreshed) return refreshed;
      }
    }

    return session.token || settings.antigravityToken || process.env.GEMINI_API_KEY || '';
  }

  logout(userJid) {
    const session = this.getSession(userJid);
    session.token = '';
    session.authType = 'none';
    session.oauth = null;
    session.pendingOAuth = null;
    session.isLoggedIn = false;
    session.history = [];
    this.saveSessions();
    return session;
  }

  setModel(userJid, modelId) {
    const session = this.getSession(userJid);
    const valid = ANTIGRAVITY_MODELS.find(m => m.id.toLowerCase() === modelId.toLowerCase());
    if (valid) {
      session.model = valid.id;
      this.saveSessions();
      return valid;
    }
    return null;
  }

  setEffort(userJid, level) {
    const session = this.getSession(userJid);
    const cleanLevel = String(level).toLowerCase().trim();
    if (['low', 'medium', 'high'].includes(cleanLevel)) {
      session.effort = cleanLevel;
      this.saveSessions();
      return cleanLevel;
    }
    return null;
  }

  setSystem(userJid, prompt) {
    const session = this.getSession(userJid);
    session.systemInstruction = prompt.trim();
    this.saveSessions();
    return session;
  }

  clearHistory(userJid) {
    const session = this.getSession(userJid);
    const prevCount = session.history.length;
    session.history = [];
    this.saveSessions();
    return prevCount;
  }

  /**
   * Menjalankan query AI secara Hybrid (CLI binary jika tersedia, atau REST API otomatis jika di Panel / Hosting / Server)
   */
  async generateContent(userJid, promptText, imageBuffer = null, mimeType = 'image/jpeg', isOwner = false) {
    const session = this.getSession(userJid);
    const agyBin = detectAgyBinary();

    // 1. JIKA NATIVE CLI AGY TERSEDIA DAN DAPAT DIEKSEKUSI DI SERVER
    if (agyBin) {
      const modelName = session.model || 'gemini-3.7-flash-high';
      const effortLevel = session.effort || 'medium';

      let formattedPrompt = promptText;
      if (!isOwner) {
        formattedPrompt = `[Role: Kamu adalah Asisten WhatsApp yang ramah, santun, solutif, dan cerdas. Format jawaban rapi dengan WhatsApp Markdown]. Pertanyaan: ${promptText}`;
      }
      if (imageBuffer) {
        formattedPrompt += ` [Media: Pengguna melampirkan gambar/media untuk dianalisis]`;
      }

      const args = ['--dangerously-skip-permissions'];

      // Jika model didukung CLI
      if (session.model && !session.model.includes('REST')) {
        args.push('--model', session.model);
        // Hanya tambahkan --effort jika nama model belum mengandung tier/effort (-high, -medium, -low, thinking)
        if (!session.model.includes('-high') && !session.model.includes('-medium') && !session.model.includes('-low') && !session.model.includes('thinking')) {
          args.push('--effort', effortLevel);
        }
      } else {
        args.push('--effort', effortLevel);
      }

      args.push('--print', formattedPrompt);

      try {
        const { stdout, stderr } = await execFileAsync(agyBin, args, {
          cwd: process.cwd(),
          timeout: 600000, // 10 menit untuk tugas coding & refactor besar
          maxBuffer: 100 * 1024 * 1024
        });

        let replyText = (stdout || '').trim();
        replyText = replyText.replace(/⠋|⠙|⠹|⠸|⠼|⠴|⠦|⠧|⠇|⠏/g, '').trim();

        if (!replyText && stderr) replyText = stderr.trim();
        if (!replyText) replyText = 'Halo! Saya siap membantu coding, analisis file, dan tugas lainnya.';

        const tokensApprox = Math.ceil((promptText.length + replyText.length) / 4);
        session.usage.promptTokens += Math.ceil(promptText.length / 4);
        session.usage.candidatesTokens += Math.ceil(replyText.length / 4);
        session.usage.totalTokens += tokensApprox;
        session.usage.totalRequests += 1;
        session.usage.lastRequestTime = Date.now();
        session.lastActive = Date.now();

        this.saveSessions();

        return {
          text: replyText,
          model: modelName,
          mode: 'native_cli',
          usage: {
            promptTokens: Math.ceil(promptText.length / 4),
            candidatesTokens: Math.ceil(replyText.length / 4),
            totalTokens: tokensApprox
          }
        };
      } catch (err) {
        // Jika ada output yang sempat ter-generate sebelum proses selesai
        if (err.stdout && String(err.stdout).trim().length > 10) {
          let partialText = String(err.stdout).replace(/⠋|⠙|⠹|⠸|⠼|⠴|⠦|⠧|⠇|⠏/g, '').trim();
          return {
            text: partialText,
            model: modelName,
            mode: 'native_cli_partial',
            usage: {
              promptTokens: Math.ceil(promptText.length / 4),
              candidatesTokens: Math.ceil(partialText.length / 4),
              totalTokens: Math.ceil((promptText.length + partialText.length) / 4)
            }
          };
        }

        // Jika error karena batas waktu komputasi (timeout)
        if (err.killed || err.signal === 'SIGTERM' || err.code === 'ETIMEDOUT') {
          return {
            text: `⏳ *Pengerjaan Coding Melebihi Batas Waktu:*\nTugas yang diberikan memerlukan waktu pengerjaan yang panjang. Silakan bagi instruksi pembuatan fitur menjadi beberapa langkah terpisah agar agen dapat menyelesaikannya secara bertahap.`,
            model: modelName,
            mode: 'native_cli_timeout',
            usage: { promptTokens: 0, candidatesTokens: 0, totalTokens: 0 }
          };
        }

        logger.warn(`[Antigravity CLI] Mode CLI warning: ${err.message}. Mencoba fallback...`);
      }
    }

    // 2. AUTO-FALLBACK KE REST API (Dapat berjalan di Panel Pterodactyl, VPS, Replit, cPanel, atau Hosting apa pun)
    const token = await this.getActiveToken(session);

    if (!token) {
      throw new Error(
        `AUTH_REQUIRED: Sesi Antigravity kamu belum terhubung.\n\n` +
        `💡 Cara Mudah Login:\n` +
        `1. Ketik: /login atau .agylogin untuk mendapatkan Tautan Google OAuth resmi.\n` +
        `2. Atau gunakan Google AI Studio API Key gratis dari https://aistudio.google.com/app/apikey lalu ketik: .token AIzaSy...`
      );
    }

    const currentParts = [];
    if (imageBuffer) {
      currentParts.push({
        inlineData: {
          mimeType: mimeType || 'image/jpeg',
          data: imageBuffer.toString('base64')
        }
      });
    }
    if (promptText) {
      currentParts.push({ text: promptText });
    }

    const contents = [];
    const recentHistory = (session.history || []).slice(-10);
    for (const item of recentHistory) {
      if (item.role && item.text) {
        contents.push({
          role: item.role === 'user' ? 'user' : 'model',
          parts: [{ text: item.text }]
        });
      }
    }

    contents.push({
      role: 'user',
      parts: currentParts
    });

    // Petakan model untuk Generative Language API
    let restModel = 'gemini-2.0-flash';
    if (session.model === 'gemini-1.5-pro' || session.model === 'gemini-3.1-pro-high') {
      restModel = 'gemini-1.5-pro';
    } else if (session.model === 'gemini-1.5-flash') {
      restModel = 'gemini-1.5-flash';
    } else {
      restModel = 'gemini-2.0-flash';
    }

    const isOAuth = session.authType === 'oauth' || token.startsWith('ya29.');
    const endpoint = isOAuth
      ? `https://generativelanguage.googleapis.com/v1beta/models/${restModel}:generateContent`
      : `https://generativelanguage.googleapis.com/v1beta/models/${restModel}:generateContent?key=${token}`;

    const headers = { 'Content-Type': 'application/json' };
    if (isOAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const requestBody = {
      contents,
      generationConfig: {
        temperature: isOwner ? 0.7 : 0.6,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };

    let systemText = session.systemInstruction;
    if (!systemText) {
      systemText = isOwner
        ? 'You are Antigravity, an ultra-advanced AI coding, reasoning, and multimodal agent developed by Google DeepMind. Provide in-depth code, architecture analysis, and precise technical answers.'
        : 'Kamu adalah Asisten WhatsApp yang ramah, sopan, cerdas, dan solutif. Format teks dengan rapi menggunakan WhatsApp Markdown.';
    }

    requestBody.systemInstruction = {
      parts: [{ text: systemText }]
    };

    const response = await axios.post(endpoint, requestBody, {
      headers,
      timeout: 60000
    });

    const candidate = response.data?.candidates?.[0];
    if (!candidate || !candidate.content) {
      throw new Error('Tidak ada respons yang valid dari Google Generative Language API.');
    }

    const replyText = candidate.content.parts?.map(p => p.text).join('\n') || '';

    const tokensApprox = Math.ceil((promptText.length + replyText.length) / 4);
    session.usage.totalTokens += tokensApprox;
    session.usage.totalRequests += 1;
    session.usage.lastRequestTime = Date.now();
    session.lastActive = Date.now();

    session.history.push({ role: 'user', text: promptText });
    session.history.push({ role: 'model', text: replyText });
    this.saveSessions();

    return {
      text: replyText,
      model: restModel,
      mode: isOAuth ? 'google_oauth_rest' : 'google_apikey_rest',
      usage: {
        promptTokens: Math.ceil(promptText.length / 4),
        candidatesTokens: Math.ceil(replyText.length / 4),
        totalTokens: tokensApprox
      }
    };
  }
}

export const antigravity = new AntigravityEngine();
export default antigravity;
