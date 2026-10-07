// تطوير وتعديل: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 
let handler = async function (m, { conn, participants, groupMetadata, usedPrefix, command }) {
    const participantList = groupMetadata.participants || []
    const mentionedJid = m.mentionedJid
    
    // تحديد المستخدم المستهدف (منشن، رد، أو مرسل الرسالة)
    const userId = mentionedJid.length > 0 ? mentionedJid[0] : (m.quoted ? m.quoted.sender : m.sender)
    const participant = participantList.find(p => p.id === userId)
    
    await m.react('🕒')

    if (participant) {
        // تنظيف الـ LID من @lid ليكون صافياً
        let rawLid = participant.lid || "غير متوفر"
        let lid = rawLid.split('@')[0] 
        
        let info = `*˼‏🆔˹ مـعـرف الـحـسـاب (LID) ↶*\n`
        info += `*‏⎔ ٠ ┈─ ━╼ • ◞📊◜ • ╾━ ─┈‏ ٠ ⎔*\n\n`
        info += `*👤 العضو:* @${userId.split('@')[0]}\n`
        info += `*📟 الـ ID:* \`${lid}\`\n\n`
        info += `*‏⎔ ٠ ┈─ ━╼ • ◞📊◜ • ╾━ ─┈‏ ٠ ⎔*`

        // تم تعديل الرد هنا ليكون بالشكل الذي طلبته (بدون شكل القناة)
        await conn.reply(m.chat, info, fkontak, {
            ...rcanal,
            contextInfo: {
                ...rcanal.contextInfo,
                mentionedJid: [userId]
            }
        })
        
        await m.react('✅')
    } else {
        let infoError = '⚠️ تعذر العثور على بيانات الـ LID في هذه المجموعة.'
        return conn.reply(m.chat, infoError, fkontak, rcanal)
    }
}

handler.help = ['ايدي']
handler.tags = ['الـأعـضـاء']
handler.command = ['ايدي', 'الايدي', 'lid', 'mylid']
handler.group = true

export default handler
