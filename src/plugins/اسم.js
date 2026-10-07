/**
 * changeGroupName.js
 * بلوقن: تغيير-اسم
 * الصلاحية: المشرفين والمطور فقط
 */

let handler = async (m, { conn, text, isGroup, isAdmin, isOwner }) => {
    // 1. التحقق من أن الأمر داخل مجموعة
    if (!m.isGroup && !isGroup) {
        let info = '❌ هذا الأمر يعمل فقط في المجموعات!'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // 2. التحقق من الصلاحيات (المشرفين أو المطور/المالك)
    if (!isAdmin && !isOwner) {
        let info = '⚠️ هذا الأمر خاص بالمشرفين والمطور فقط!'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // 3. التحقق من وجود الاسم الجديد
    if (!text) {
        let info = `❌ يرجى كتابة الاسم الجديد بعد الأمر.\n\n*مثال:* .اسم مملكة الأوتاكو`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
    
    if (text.length > 25) {
        let info = '⚠️ اسم المجموعة طويل جداً! الحد الأقصى هو 25 حرفاً.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    try {
        // 4. محاولة تغيير اسم المجموعة
        await conn.groupUpdateSubject(m.chat, text)
        
        // تفاعل "تم"
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })

        let info = `✅ تم تغيير اسم المجموعة بنجاح إلى:\n*${text}*`
        await conn.reply(m.chat, info, fkontak, rcanal)

    } catch (err) {
        console.error('Error changing group name:', err)
        let info = '⚠️ فشل تغيير الاسم. تأكد أن البوت يمتلك صلاحيات (أدمن) لكي يتمكن من تعديل الإعدادات.'
        conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['اسم']
handler.tags = ['الـمـشـرفـيـن']
handler.command = /^(اسم|تغير-اسم|تغيير-الاسم|rename|setname)$/i

handler.group = true

export default handler
