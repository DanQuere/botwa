let handler = async (m, { conn, text }) => {
if (!text) {
return m.reply(`❏ Contoh Penggunaan

.lapor Ada bug pada fitur play

Tuliskan laporan atau saran yang ingin dikirim ke Owner 🌷`)
}

let owner = Array.isArray(global.owner)
? global.owner[0]
: global.owner

owner = owner.toString().replace(/[^0-9]/g, '')

let laporan = `🌷 Laporan Pengguna

❏ Nama : ${m.pushName}
❏ Laporan : ${text}
❏ Waktu : ${new Date().toLocaleString('id-ID')}

✨ 𝗠𝗘𝗚𝗔𝗠𝗜 𝗠𝗗 𝗠𝗨𝗟𝗧𝗜 𝗗𝗘𝗩𝗜𝗖𝗘`

await conn.sendMessage(owner + '@s.whatsapp.net', {
text: laporan
})

await m.reply(`🌷 Laporan berhasil dikirim

❏ Terima kasih atas laporan dan sarannya.
❏ Owner akan meninjau laporan yang dikirim.`)
}

handler.help = ['lapor <pesan>']
handler.tags = ['info']
handler.command = /^(lapor|report)$/i

export default handler