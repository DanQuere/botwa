let handler = async (m) => {
  return m.reply(
    `🌷 *INFO SCRIPT*\n\n` +
    `Hai kak 👋\n\n` +
    `❏ Sedang mencari script bot WhatsApp?\n` +
    `❏ Script tersedia dan diperbarui melalui Channel WhatsApp.\n\n` +
    `❏ Update fitur terbaru\n` +
    `❏ Informasi script\n` +
    `❏ Perbaikan bug\n` +
    `❏ Pengumuman penting\n\n` +
    `📢 Channel WhatsApp:\nhttps://whatsapp.com/channel/0029Vb8dmsUElagkVPIw9X2P`
  )
}

handler.help = ['sc', 'script']
handler.tags = ['info']
handler.command = /^(sc|script)$/i

export default handler
