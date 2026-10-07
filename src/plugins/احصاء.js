let handler = async (m, { conn, participants, isAdmin, isOwner }) => {
    // التحقق من الصلاحيات (مشرف أو مطور)
    if (!(isAdmin || isOwner)) {
        return conn.reply(m.chat, '⚠️️ *هذا الأمر مخصص للمشرفين والمطور فقط!*', fkontak, rcanal)
    }

    const from = m.chat
    let users = global.db.data.users
    
    // جلب أعضاء المجموعة الحاليين
    let groupParticipants = participants.map(p => p.id)

    // تصفية المستخدمين بناءً على عدد الأوامر (commands) المسجلة في database.json
    let stats = groupParticipants
        .filter(jid => users[jid])
        .map(jid => ({
            jid,
            count: users[jid].commands || 0
        }))
        .filter(u => u.count > 0) // إظهار من لديهم تفاعل فقط
        .sort((a, b) => b.count - a.count)

    if (stats.length === 0) {
        return conn.reply(from, '📊 لا توجد إحصائيات أوامر مسجلة لهذا القروب بعد 🥲', fkontak, rcanal)
    }

    let admins = participants.filter(p => p.admin).map(p => p.id)
    
    // تقسيم التوب 10 للمشرفين والأعضاء
    let adminsStats = stats.filter(u => admins.includes(u.jid)).slice(0, 10)
    let membersStats = stats.filter(u => !admins.includes(u.jid)).slice(0, 10)

    let text = `╮━━━〔 🏆 إحصائيات التفاعل 🏆 〕━━━╭\n\n`

    if (adminsStats.length > 0) {
        text += `👑 ✦━━〔 المشرفين 〕━━✦ \n`
        adminsStats.forEach((user, i) => {
            let medal = ["🥇", "🥈", "🥉"][i] || `⭐${i + 1}`
            text += `⚜️ ${medal} @${user.jid.split("@")[0]} ┇ ${user.count} تفاعل\n`
        })
        text += `\n`
    }

    if (membersStats.length > 0) {
        text += `👥 ❖━━〔 الأعضاء 〕━━❖ \n`
        membersStats.forEach((user, i) => {
            let medal = ["🥇", "🥈", "🥉"][i] || `⭐${i + 1}`
            text += `🌿 ${medal} @${user.jid.split("@")[0]} ┇ ${user.count} تفاعل\n`
        })
        text += `\n`
    }

    text += `╯━━━━━━━━━━━━━━━━━━━━━━╰\n🔥 واصلوا التفاعل يا أبطال 🔥`

    let ppUrl
    try {
        ppUrl = await conn.profilePictureUrl(from, "image")
    } catch {
        ppUrl = "https://telegra.ph/file/6c5b7d0a2a48145f58c4c.jpg"
    }

    let allMentions = [...adminsStats, ...membersStats].map(u => u.jid)

    await conn.sendMessage(from, {
        image: { url: ppUrl },
        caption: text,
        mentions: allMentions
    }, { quoted: m })
}

handler.help = ['احصاء']
handler.tags = ['الـمـشـرفـيـن']
handler.command = ["إحصاء", "احصاء", "توب", "top"]
handler.group = true

export default handler
