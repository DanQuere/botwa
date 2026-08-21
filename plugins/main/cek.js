let handler = async (m, { conn }) => {
  let chat = global.db.data.chats[m.chat]
  if (!chat || !chat.expired || chat.expired < 1) {
    return m.reply('Group ini tidak diset expired')
  }

  let now = Date.now()
  let sisa = chat.expired - now

  if (sisa <= 0) {
    return m.reply('Masa sewa sudah habis')
  }

  m.reply(`*Expired Group:*\n${msToDate(sisa)}`)
}

handler.help = ['cekexpired', 'ceksewa']
handler.tags = ['group']
handler.command = /^(cekexpired|ceksewa)$/i
handler.group = true

export default handler

function msToDate(ms) {
  let days = Math.floor(ms / (24 * 60 * 60 * 1000))
  let hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  let minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))

  return `${days} Hari ☀️\n${hours} Jam 🕐\n${minutes} Menit ⏰`
}