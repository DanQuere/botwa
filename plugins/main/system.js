import config from '../../config/config.js';
import os from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'
const execAsync = promisify(exec);
const pluginConfig = {
    name: 'system',
    alias: ['ram', 'cpu', 'disk', 'latency', 'ping'],
    category: 'main',
    description: 'Menampilkan informasi sistem (RAM, CPU, Disk, Latency)',
    usage: '.ram | .cpu | .disk | .ping',
    isGroup: false,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
};

function formatSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

async function getDiskUsage() {
    try {
        if (process.platform === 'win32') {
            const { stdout } = await execAsync('wmic logicaldisk get size,freespace,caption');
            const lines = stdout.trim().split('\n').slice(1);
            return lines.map(line => {
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 3) {
                    const caption = parts[0];
                    const free = parseInt(parts[1]);
                    const size = parseInt(parts[2]);
                    const used = size - free;
                    return `💿 *Drive ${caption}*\nTotal: ${formatSize(size)}\nUsed: ${formatSize(used)}\nFree: ${formatSize(free)}\n`;
                }
                return null;
            }).filter(Boolean).join('\n');
        } else {
            const { stdout } = await execAsync('df -h /');
            const lines = stdout.trim().split('\n');
            const parts = lines[1].replace(/\s+/g, ' ').split(' ');
            return `💿 *Disk Usage*\nTotal: ${parts[1]}\nUsed: ${parts[2]}\nFree: ${parts[3]}\nUse%: ${parts[4]}`;
        }
    } catch (e) {
        return '❌ Gagal mengambil info disk';
    }
}

async function handler(m, { sock, command }) {
    const cmd = (command || m.command || 'system').toLowerCase();

    try {
        switch (cmd) {
            case 'ram': {
                const totalMem = os.totalmem();
                const freeMem = os.freemem();
                const usedMem = totalMem - freeMem;
                
                const text = `💻 *RAM USAGE*\n\n` +
                             `Total: ${formatSize(totalMem)}\n` +
                             `Used: ${formatSize(usedMem)}\n` +
                             `Free: ${formatSize(freeMem)}\n` +
                             `Platform: ${os.platform()} (${os.arch()})`;
                return m.reply(text);
            }

            case 'cpu': {
                const cpus = os.cpus();
                const model = cpus[0]?.model || 'Unknown';
                const speed = cpus[0]?.speed || 0;
                const cores = cpus.length;
                
                const uptime = os.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = Math.floor(uptime % 60);
                const uptimeStr = `${hours}h ${minutes}m ${seconds}s`;
                return m.reply(`🖥️ *CPU INFO*\n\nModel: ${model}\nSpeed: ${speed} MHz\nCores: ${cores}\nServer Uptime: ${uptimeStr}`);
            }

            case 'disk': {
                const diskInfo = await getDiskUsage();
                return m.reply(diskInfo);
            }

            case 'ping':
            case 'latency':
            default: {
                const timestamp = m.messageTimestamp ? Number(m.messageTimestamp) * 1000 : Date.now();
                const now = Date.now();
                const latency = Math.abs(now - timestamp);
                let speed = '';
                if (latency < 150) speed = '🚀 Super Cepat';
                else if (latency < 500) speed = '⚡ Sangat Baik';
                else if (latency < 1000) speed = '📶 Stabil';
                else speed = '🐢 Normal';
                return m.reply(`📶 *Pong!*\n› *Respon Bot:* ${latency}ms\n› *Koneksi:* ${speed}`);
            }
        }
    } catch (e) {
        console.error('System Plugin Error:', e);
        return m.reply('❌ Terjadi kesalahan mengambil data sistem.');
    }
}

export { pluginConfig as config, handler }