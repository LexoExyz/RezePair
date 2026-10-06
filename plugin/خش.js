/**
 * join.js
 * أمر انضمام البوت للمجموعات
 * تم إزالة نظام إيليت لتجنب أخطاء التيرمكس
 */

let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
    // 1. التحقق من الصلاحية (للمطور فقط)
    if (!isOwner) {
        let info = '🚫 هذا الأمر مخصص للمطور فقط.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // 2. استخراج الرابط باستخدام Regex لضمان الدقة
    const regex = /https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+/
    const match = text.match(regex)
    const link = match ? match[0] : null

    if (!link) {
        let info = `❌ يرجى إرسال رابط المجموعة بعد الأمر.\nمثال: *${usedPrefix + command} https://chat.whatsapp.com/xxx*`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // 3. استخراج رمز الدعوة
    const inviteCode = link.split('https://chat.whatsapp.com/')[1]

    try {
        // 4. محاولة الانضمام
        const result = await conn.groupAcceptInvite(inviteCode)
        
        if (result) {
            let info = '✅ تم الانضمام إلى المجموعة بنجاح!'
            return conn.reply(m.chat, info, fkontak, rcanal)
        } else {
            let info = '❌ تم إرسال طلب الانضمام (بانتظار موافقة المشرف).'
            return conn.reply(m.chat, info, fkontak, rcanal)
        }

    } catch (err) {
        console.error('❌ خطأ في الانضمام:', err)
        let info = '❌ لم يتمكن البوت من الانضمام. تأكد أن الرابط صالح أو أن البوت لم يتم طرده من هذه المجموعة مسبقاً.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['خش']
handler.tags = ['الـمـطـور']
handler.command = /^(خش|join)$/i

// جعل الأمر متاحاً للمطور فقط من الهيكلة الأساسية
handler.owner = true 

export default handler
