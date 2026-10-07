/**
 * link.js
 * أمر جلب رابط المجموعة لـ 𝑹𝒆𝒛𝒆
 */

var handler = async (m, { conn, args }) => {
    let group = m.chat
    
    // جلب صورة بروفايل المجموعة أو وضع صورة افتراضية في حال الفشل
    const pp = await conn.profilePictureUrl(group, 'image').catch((_) => 'https://files.catbox.moe/w8ycz1.jpg')
    
    // جلب كود الدعوة الخاص بالمجموعة
    let link = 'https://chat.whatsapp.com/' + await conn.groupInviteCode(group)
    
    // تنسيق الرسالة المعربة للهوية الجديدة
    let info = `
✨ ⬞ ─── ⬞ [ 🔗 ] ⬞ ─── ⬞ ✨
*رابط مـجـمـوعـة الـدردشـة*

*↶ الـرابط | ↯*
${link}

✨ ⬞ ─── ⬞ [ 𝑹𝒆𝒛𝒆 ] ⬞ ─── ⬞ ✨
`.trim()

    // إرسال الصورة مع الرابط بنظام الرد الموثق
    await conn.sendMessage(group, { 
        image: { url: pp }, 
        caption: info,
        footer: "𝑹𝒆𝒛𝒆 - مـنـقـذ المـجـموعـات",
        mentions: [m.sender]
    }, { quoted: m })

    // إضافة سطر الرد الموثق كما طلبت
    return conn.reply(m.chat, info, fkontak, rcanal)
}

handler.help = ['لينك']
handler.tags = ['الـمـشـرفـيـن']
handler.command = ['رابط', 'لينك', 'link']

// قيود الأمر لضمان العمل الصحيح
handler.group = true
handler.botAdmin = true

export default handler
