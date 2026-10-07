// تعريب وتعديل: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 
const handler = async (m, { conn, participants, isBotAdmin, isOwner }) => {
    // التحقق إذا كان الشخص الذي استعمل الأمر هو المطور حصراً
    if (!isOwner) {
        let info = '❌ هذا الأمر خاص بمطور البوت فقط!'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
    
    // التحقق إذا كان البوت مشرفاً ليتمكن من الطرد
    if (!isBotAdmin) {
        let info = '❌ يجب أن يكون البوت مشرفاً (Admin) لتنفيذ هذا الأمر!'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    const groupMetadata = await conn.groupMetadata(m.chat)
    const ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
    const botJid = conn.user.jid
    const ownerBot = global.owner[0][0] + '@s.whatsapp.net'

    // تصفية القائمة لاستثناء المطور، البوت، ومنشئ المجموعة
    const usersToKick = participants.map(u => u.id).filter(v => 
        v !== botJid && 
        v !== ownerBot && 
        v !== ownerGroup
    )

    if (usersToKick.length === 0) {
        let info = 'ꕥ لا يوجد أعضاء لطردهم (المجموعة فارغة بالفعل أو لا يوجد إلا المطورين).'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    let infoStart = `⚠️ جاري تصفية المجموعة وطرد ${usersToKick.length} عضو...`
    conn.reply(m.chat, infoStart, fkontak, rcanal)
    m.react('⏳')

    const delay = time => new Promise(res => setTimeout(res, time))

    for (const user of usersToKick) {
        try {
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
            // تأخير بسيط جداً (500ms) لتجنب تعليق الحساب أثناء الطرد الجماعي
            await delay(500) 
        } catch (e) {
            console.error(`فشل طرد العضو ${user}:`, e)
        }
    }

    m.react('✅')
    let infoEnd = '✅ تمت تصفية المجموعة بنجاح، لم يتبقَ سوى المطورين.'
    return conn.reply(m.chat, infoEnd, fkontak, rcanal)
}

handler.help = ['طيرهم']
handler.tags = ['owner']
handler.command = ['طيرهم', 'طردجماعي', 'wipe']
handler.group = true
handler.owner = true 

export default handler
