// تطوير وتعديل: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 

let handler = async (m, { conn, text: txt, isGroup, participants }) => {
    // جلب النص المراد عرضه
    let settings = global.db.data.settings?.[conn.user.jid] || {}
    let text = txt || settings.mention || 'منشن جماعي'

    // جلب معرفات كافة الأعضاء في المجموعة للتنبيه الفعلي
    let ginGr = isGroup ? participants.map(a => a.id) : []

    // استخدام رمز التكست النظيف للظهور باللون الأخضر بدون أرقام
    await conn.sendMessage(m.chat, {
        text: `@${m.chat}`, 
        contextInfo: {
            mentionedJid: ginGr, // التنبيه الحقيقي لجميع الأعضاء
            groupMentions: [
                {
                    groupSubject: text, // العنوان الأخضر الظاهر
                    groupJid: m.chat,
                },
            ]
        }
    }, { quoted: m })
}

handler.help = ['اخضر']
handler.tags = ['الـمـشـرفـيـن']
handler.command = /^(اخضر)$/i
handler.group = true
handler.admin = true

export default handler
