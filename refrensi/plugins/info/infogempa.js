import safeJson from "../../src/lib/rimuru-safe-json.js";
/*
📌 Nama Fitur: Info Gempa
🏷️ Type : Plugin ESM
🔗 Sumber :  https://whatsapp.com/channel/0029Vb91Rbi2phHGLOfyPd3N
🔗 Api : https://api.siputzx.my.id/api/info/bmkg
✍️ Convert By ZenzXD
*/

import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
  let res = await fetch('https://api.siputzx.my.id/api/info/bmkg');
  if (!res.ok) throw 'Gagal mengambil data dari API.';
  
  let json = await safeJson(res, { status: false });
  if (!json.status) throw 'Data tidak ditemukan.';

  const gempa = json.data.auto.Infogempa.gempa;

  let teks = `*Info Gempa BMKG Terkini*\n\n` +
             `*Tanggal:* ${gempa.Tanggal}\n` +
             `*Jam:* ${gempa.Jam}\n` +
             `*Magnitudo:* ${gempa.Magnitude}\n` +
             `*Kedalaman:* ${gempa.Kedalaman}\n` +
             `*Lokasi:* ${gempa.Wilayah}\n` +
             `*Koordinat:* ${gempa.Coordinates} (${gempa.Lintang}, ${gempa.Bujur})\n` +
             `*Potensi:* ${gempa.Potensi}\n` +
             `*Dirasakan:* ${gempa.Dirasakan}`;

  await conn.sendMessage(m.chat, {
    text: teks,
    contextInfo: {
      externalAdReplyOffOffOff: {
        title: 'BMKG - Info Gempa Terkini',
        body: `Magnitude ${gempa.Magnitude} | ${gempa.Wilayah}`,
        thumbnailUrl: `https://data.bmkg.go.id/DataMKG/TEWS/${gempa.Shakemap}`,
        sourceUrl: 'https://bmkg.go.id',
        mediaType: 1,
        renderLargerThumbnail: true,
        showAdAttribution: false
      }
    }
  }, { quoted: m });
};

export default handler;

handler.command = ['infogempa'];
handler.tags = ['info'];
handler.help = ['infogempa'];