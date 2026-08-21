import { performance } from 'perf_hooks';

export default {
  name: 'speed',
  aliases: ['benchmark', 'testspeed'],
  category: 'main',
  description: 'Mengukur kecepatan eksekusi proses server',
  async run({ m }) {
    const p1 = performance.now();
    let counter = 0;
    for (let i = 0; i < 1_000_000; i++) {
      counter += i;
    }
    const p2 = performance.now();
    const diff = (p2 - p1).toFixed(4);

    await m.reply(`🚀 *Server Benchmark Test*\n• Waktu kalkulasi 1.000.000 iterasi: *${diff} ms*`);
  }
};
