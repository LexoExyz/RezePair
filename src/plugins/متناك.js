/**
 * random_selection.js
 * اختيار عضو عشوائي لمنشن ترفيهي
 * الصلاحية: الجميع (داخل المجموعات)
 * تطوير وتعديل: 𝑹𝒆𝒛𝒆
 */

let handler = async (m, { conn, participants, groupMetadata }) => {
    // تصفية الأعضاء لاستبعاد الشخص الذي كتب الأمر
    const members = participants.filter(p => p.id !== m.sender)

    if (members.length === 0) {
        let info = '👀 مفيش أعضاء كافيين في الجروب عشان أختار منهم!'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // اختيار شخص عشوائي
    const randomMember = members[Math.floor(Math.random() * members.length)].id

    // نص الرسالة التفاعلي
    let info = `🫩 أكتر واحد متناك في الجروب هو: @${randomMember.split('@')[0]} 💀`

    // إرسال الرسالة مع المنشن ونظام الرد الموثق
    await conn.sendMessage(m.chat, {
        text: info,
        mentions: [randomMember],
        contextInfo: {
            externalAdReply: {
                title: '𝑹𝒆𝒛𝒆',
                body: 'متناك',
                thumbnailUrl: 'https://files.catbox.moe/w8ycz1.jpg', // يمكنك تغيير الصورة
                sourceUrl: null,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    }, { quoted: m })

    return conn.reply(m.chat, info, fkontak, rcanal)
}

handler.help = ['متناك']
handler.tags = ['الـالـعـاب']
handler.command = ['متناك']
handler.group = true // يعمل فقط في المجموعات

export default handler
