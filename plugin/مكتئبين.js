/**
 * depressed.js
 * يعرض قائمة الأعضاء الذين لا يملكون صورة ملف شخصي (المكتئبين)
 * الصلاحية: الجميع (داخل المجموعات)
 * تطوير وتعديل: 𝑹𝒆𝒛𝒆
 */

let handler = async (m, { conn, participants, groupMetadata }) => {
    let waitInfo = '⏳ جاري فحص قائمة المكتئبين ...'
    conn.reply(m.chat, waitInfo, fkontak, rcanal)

    const noPfpList = []

    // الفحص بذكاء باستخدام Promise.all لزيادة السرعة
    await Promise.all(participants.map(async (user) => {
        try {
            // محاولة جلب رابط الصورة، إذا فشل يعني العضو معندوش صورة أو حاطط خصوصية
            await conn.profilePictureUrl(user.id, 'image')
        } catch {
            noPfpList.push(user.id)
        }
    }))

    if (noPfpList.length === 0) {
        let info = '✅ ما شاء الله، كل الجروب متفائل !'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    let info = `🕵️‍♂️ *قائمة المكتئبين في الجروب:*\n`
    info += `⚠️ عدد اللي مش حاطين صور: *${noPfpList.length}*\n\n`
    
    for (let jid of noPfpList) {
        info += `🔸 @${jid.split('@')[0]}\n`
    }

    info += `\n🌚 حطوا صور يا مكتئبين!\n\n> *𝑹𝒆𝒛𝒆*`

    await conn.sendMessage(m.chat, {
        text: info,
        mentions: noPfpList
    }, { quoted: m })

    return conn.reply(m.chat, info, fkontak, rcanal)
}

handler.help = ['مكتئبين']
handler.tags = ['الـالـعـاب']
handler.command = ['مكتئبين', 'المكتئبين', 'بدون-صورة']
handler.group = true // يعمل فقط في المجموعات

export default handler
