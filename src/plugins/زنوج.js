let handler = async (m, { conn, participants }) => {
    const jid = m.chat

    // 1. التحقق من القروب
    if (!m.isGroup) return conn.reply(jid, '❌ هذا الأمر يعمل فقط داخل المجموعات.', fkontak, rcanal)

    await m.react('📊')

    // بناء التقرير
    let mentions = []
    let result = `╭───〔 📊 *تقرير النسبة الجماعي* 〕───╮\n`

    participants.forEach((p, index) => {
        const percentage = Math.floor(Math.random() * 101)
        const user = p.id.split('@')[0]
        mentions.push(p.id)
        result += `│ ${index + 1} - *@${user}* › *${percentage}%*\n`
    })

    result += `╰━━━━━━━━━━━━━━━━━━⧉`

    // إرسال الرسالة مع المنشنات
    await conn.sendMessage(jid, {
        text: result,
        mentions: mentions
    }, { quoted: m })
}

handler.help = ['نسبة-الكل']
handler.tags = ['الـالـعـاب']
handler.command = ['زنوج', 'نسبة-الكل', 'نسبة_الكل']
handler.group = true

export default handler
