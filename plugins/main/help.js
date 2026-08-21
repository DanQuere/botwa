let handler = async (m, { usedPrefix }) => {
  return m.reply(
    `📚 *HELP*\n\n` +
    `Gunakan ${usedPrefix}menu untuk melihat semua kategori fitur.\n\n` +
    `Contoh:\n` +
    `• ${usedPrefix}totalfitur\n` +
    `• ${usedPrefix}status\n` +
    `• ${usedPrefix}gp menu\n\n` +
    `✨ Ketik ${usedPrefix}menu untuk daftar lengkap.`
  )
}

handler.help = ['help']
handler.tags = ['main']
handler.command = /^help$/i

export default handler
