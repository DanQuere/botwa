import config from '../../config.js';
import { getDatabase } from '../../src/lib/rimuru-database.js';
import { loadSent,
    saveSent,
    loadState,
    saveState,
    getOngoingAnimeList,
    startAutoCheck,
    stopAutoCheck,
    isRunning } from '../../src/lib/rimuru-auto-anime.js';
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
// plugins/anime/autoanime-channel.js




const axios = require('axios');
const cheerio = require('cheerio');

const pluginConfig = {
    name: 'autoanimechannel',
    alias: ['aawch', 'aach', 'autoanimech'],
    category: 'anime',
    description: 'Auto upload ongoing anime ke channel (bisa pilih channel 1/2/3)',
    usage: '.aawch <start|stop|status|cek|reset|setch>',
    example: '.aawch setch 2',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
};

// Ambil channel ID berdasarkan pilihan
function getChannelId(choice) {
    const channelMap = {
        '1': config.saluran?.id,
        '2': config.saluran?.id2,
        '3': config.saluran?.id3
    };
    return channelMap[choice] || config.saluran?.id;
}

// Ambil nama channel berdasarkan pilihan
function getChannelName(choice) {
    const nameMap = {
        '1': config.saluran?.name || 'Channel 1',
        '2': config.saluran?.name2 || 'Channel 2',
        '3': config.saluran?.name3 || 'Channel 3'
    };
    return nameMap[choice] || `Channel ${choice}`;
}

const BASE_URL = 'https://winbu.net';
const HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
};

async function fetchPage(url) {
    const res = await axios.get(url, { headers: HEADERS, timeout: 30000 });
    return res.data;
}

function resolvePixeldrainPageUrl(rawUrl) {
    const id = (rawUrl.match(/pixeldrain\.(?:com|net)\/(?:u|d|api\/file)\/([a-zA-Z0-9]+)/i) || [])[1];
    if (id) return `https://pixeldrain.com/u/${id}`;
    return rawUrl;
}

async function sendToChannel(sock, channelId, linkObj, meta) {
    const pageUrl = resolvePixeldrainPageUrl(linkObj.url);
    
    let coverBuffer = null;
    if (meta.cover) {
        try {
            const res = await axios.get(meta.cover, { responseType: 'arraybuffer', timeout: 15000 });
            coverBuffer = Buffer.from(res.data);
        } catch (e) {}
    }
    
    const caption = `*ANIME UPDATE! ✨*\n\n📺 Judul: *${meta.title}*\n🎞️ Episode: ${meta.episode}\n📊 Kualitas: *${linkObj.quality}*\n\n🔗 Download: ${pageUrl}`;
    
    if (coverBuffer) {
        await sock.sendMessage(channelId, { image: coverBuffer, caption });
    } else {
        await sock.sendMessage(channelId, { text: caption });
    }
    console.log(`[Channel] ✅ ${meta.title} ${meta.episode}`);
}

let manualInterval = null;
let manualRunning = false;
let currentChannelChoice = '1';

async function manualRunCheck(sock, channelId) {
    const sent = loadSent();
    console.log(`[Channel] 🔍 Check: ${new Date().toLocaleString()}`);
    
    const html = await fetchPage(`${BASE_URL}/`);
    const $ = cheerio.load(html);
    const animeList = [];
    
    $('.movies-list-wrap').each((_, section) => {
        $(section).find('.ml-item').each((__, item) => {
            const a = $(item).find('a.ml-mask');
            const href = a.attr('href') || '';
            const title = a.attr('title')?.trim() || '';
            if (!href || !title) return;
            
            const imgEl = $(item).find('img');
            const cover = imgEl.attr('data-original') || imgEl.attr('data-src') || imgEl.attr('src') || '';
            
            animeList.push({
                title,
                url: new URL(href, BASE_URL).href,
                slug: href.split('/anime/')[1]?.replace(/\//g, '') || '',
                cover: cover ? new URL(cover, BASE_URL).href : ''
            });
        });
    });
    
    for (const anime of animeList.slice(0, 10)) {
        try {
            const animeHtml = await fetchPage(anime.url);
            const $$ = cheerio.load(animeHtml);
            const episodeLink = $$('a[href*="episode"]').first();
            if (!episodeLink.length) continue;
            
            let href = episodeLink.attr('href') || '';
            if (!href) continue;
            
            let fullUrl = href;
            if (!href.startsWith('http')) fullUrl = new URL(href, BASE_URL).href;
            
            const epMatch = fullUrl.match(/episode[_-]?(\d+)/i) || fullUrl.match(/ep[_-]?(\d+)/i);
            const epNum = epMatch ? epMatch[1] : 'Latest';
            const episodeKey = `${anime.slug}-${epNum}`;
            
            if (sent.has(episodeKey)) continue;
            
            // Ambil link download
            const epHtml = await fetchPage(fullUrl);
            const $$$ = cheerio.load(epHtml);
            let downloadUrl = null;
            let quality = '720p';
            
            $$$('.download-eps ul li').each((_, el) => {
                const q = $$$(el).find('strong').text().trim();
                const pixeldrain = $$$(el).find('span a').filter((_, a) => {
                    const text = $$$(a).text().toLowerCase();
                    return text.includes('pixeldrain');
                });
                if (pixeldrain.length && q) {
                    downloadUrl = pixeldrain.attr('href');
                    quality = q.match(/(\d{3,4}p)/i)?.[1] || '720p';
                }
            });
            
            if (downloadUrl) {
                await sendToChannel(sock, channelId, { url: downloadUrl, quality }, {
                    title: anime.title,
                    episode: `Episode ${epNum}`,
                    cover: anime.cover
                });
                sent.add(episodeKey);
                saveSent(sent);
                await new Promise(r => setTimeout(r, 3000));
            }
        } catch (e) {
            console.log(`Error ${anime.title}:`, e.message);
        }
    }
    console.log('[Channel] ✅ Check complete');
}

function manualStart(sock, channelId, intervalMin = 5) {
    if (manualInterval) clearInterval(manualInterval);
    manualRunning = true;
    manualRunCheck(sock, channelId);
    manualInterval = setInterval(() => manualRunCheck(sock, channelId), intervalMin * 60 * 1000);
}

function manualStop() {
    if (manualInterval) clearInterval(manualInterval);
    manualInterval = null;
    manualRunning = false;
}

async function handler(m, { sock }) {
    try {
        const args = m.args || [];
        const sub = args[0]?.toLowerCase();
        const database = getDatabase();
        
        // Ambil channel yang tersimpan di database
        const savedChannel = database.setting('autoAnimeChannel') || '1';
        currentChannelChoice = savedChannel;
        
        let channelId = getChannelId(currentChannelChoice);
        let channelName = getChannelName(currentChannelChoice);
        
        if (!channelId && sub !== 'setch') {
            return m.reply(`❌ *Channel ${currentChannelChoice} belum dikonfigurasi!*\n> Isi dulu di config.js bagian saluran.id${currentChannelChoice}\n> Atau ganti channel dengan: .aawch setch 1/2/3`);
        }
        
        // ========== SET CHANNEL ==========
        if (sub === 'setch') {
            const channelChoice = args[1];
            if (!channelChoice || !['1', '2', '3'].includes(channelChoice)) {
                return m.reply(
                    `🎬 *AUTO ANIME - SET CHANNEL*\n\n` +
                    `> Pilih channel tujuan:\n` +
                    `> 1️⃣ ${config.saluran?.name || 'Channel 1'} ${config.saluran?.id ? '✅' : '❌'}\n` +
                    `> 2️⃣ ${config.saluran?.name2 || 'Channel 2'} ${config.saluran?.id2 ? '✅' : '❌'}\n` +
                    `> 3️⃣ ${config.saluran?.name3 || 'Channel 3'} ${config.saluran?.id3 ? '✅' : '❌'}\n\n` +
                    `> Contoh: .aawch setch 2`
                );
            }
            
            const targetId = getChannelId(channelChoice);
            if (!targetId) {
                return m.reply(`❌ *Channel ${channelChoice} belum dikonfigurasi!*\n> Isi dulu di config.js bagian saluran.id${channelChoice}`);
            }
            
            database.setting('autoAnimeChannel', channelChoice);
            currentChannelChoice = channelChoice;
            
            // Hentikan auto jika sedang berjalan, karena channel berubah
            if (manualRunning) {
                manualStop();
                saveState({ enabled: false });
            }
            
            m.react('✅');
            return m.reply(
                `✅ *C H A N N E L  D I U B A H*\n\n` +
                `📢 Sekarang auto anime akan dikirim ke:\n` +
                `> ${getChannelName(channelChoice)} (${targetId})\n\n` +
                `💡 Jalankan .aawch start untuk memulai auto upload`
            );
        }
        
        // ========== COMMANDS ==========
        const state = loadState();
        
        switch (sub) {
            case 'start':
                if (manualRunning) return m.reply('⚠️ AutoAnime sudah berjalan');
                manualStart(sock, channelId, state.interval || 5);
                saveState({ ...state, enabled: true, channelId: channelId, channelChoice: currentChannelChoice });
                return m.reply(`✅ *AUTO ANIME CHANNEL STARTED*\n📺 Channel: ${channelName}\n⏱️ Interval: ${state.interval || 5} menit`);
                
            case 'stop':
                manualStop();
                saveState({ ...state, enabled: false });
                return m.reply('🛑 AutoAnime Channel dihentikan');
                
            case 'status':
                const sent = loadSent();
                const chStatus = getChannelId(currentChannelChoice) ? '✅' : '❌';
                return m.reply(`📊 *STATUS AUTO ANIME*\n\n` +
                    `╭┈┈⬡「 📋 *I N F O* 」\n` +
                    `┃ 🔄 Status: ${manualRunning ? '🟢 ON' : '🔴 OFF'}\n` +
                    `┃ 📺 Channel: ${channelName} ${chStatus}\n` +
                    `┃ 🆔 Channel ID: ${channelId || '❌'}\n` +
                    `┃ 📋 Sent: ${sent.size} episode\n` +
                    `┃ 🎬 Sumber: ${BASE_URL}\n` +
                    `╰┈┈⬡\n\n` +
                    `> 💡 Ketik .aawch setch 1/2/3 untuk ganti channel`);
                
            case 'cek':
            case 'check':
                if (!channelId) {
                    return m.reply(`❌ *Channel ${currentChannelChoice} belum diisi ID-nya!*\n> Cek config.saluran.id${currentChannelChoice}`);
                }
                await m.reply('🔍 Mengecek anime terbaru...');
                await manualRunCheck(sock, channelId);
                return m.reply('✅ Pengecekan selesai');
                
            case 'reset':
                const count = loadSent().size;
                saveSent(new Set());
                return m.reply(`✅ Reset berhasil\n${count} episode dihapus dari history`);
                
            default:
                const chList = [
                    `1️⃣ ${config.saluran?.name || 'Channel 1'}: ${config.saluran?.id ? '✅' : '❌'}`,
                    `2️⃣ ${config.saluran?.name2 || 'Channel 2'}: ${config.saluran?.id2 ? '✅' : '❌'}`,
                    `3️⃣ ${config.saluran?.name3 || 'Channel 3'}: ${config.saluran?.id3 ? '✅' : '❌'}`
                ].filter(c => c.includes('✅')).join('\n> ');
                
                return m.reply(`🎬 *AUTO ANIME CHANNEL*\n\n` +
                    `╭┈┈⬡「 📊 *S T A T U S* 」\n` +
                    `┃ 🔄 Running: ${manualRunning ? '🟢 ON' : '🔴 OFF'}\n` +
                    `┃ 📺 Channel aktif: ${channelName}\n` +
                    `╰┈┈⬡\n\n` +
                    `╭┈┈⬡「 📡 *C H A N N E L  T E R S E D I A* 」\n` +
                    `> ${chList || '❌ Belum ada channel yang diisi'}\n` +
                    `╰┈┈⬡\n\n` +
                    `📌 *COMMAND:*\n` +
                    `> ${m.prefix || '.'}aawch start\n` +
                    `> ${m.prefix || '.'}aawch stop\n` +
                    `> ${m.prefix || '.'}aawch status\n` +
                    `> ${m.prefix || '.'}aawch setch 1/2/3\n` +
                    `> ${m.prefix || '.'}aawch cek\n` +
                    `> ${m.prefix || '.'}aawch reset`);
        }
    } catch (e) {
        console.log(e);
        m.reply(`❌ Error\n\n${e.message}`);
    }
}

export { pluginConfig as config, handler };
