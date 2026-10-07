/**
 * delete.js
 * أمر حذف الرسائل
 * تم إزالة نظام إيليت وإضافة التحقق من المجموعة
 */

let handler = async (m, { conn, isBotAdmin, isAdmin, isOwner }) => {
    // 1. التحقق من أن الأمر داخل مجموعة
    if (!m.isGroup) {
        let info = '❌ هذا الأمر مخصص للمجموعات فقط.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // 2. التحقق من الصلاحيات (بديل نظام إيليت)
    if (!isAdmin && !isOwner) {
        let info = '⚠️ هذا الأمر مخصص للمشرفين وللمطور فقط!'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // 3. التحقق من وجود رسالة مقتبسة (الرد)
    if (!m.quoted) {
        let info = '❌ رد على الرسالة التي تريد حذفها بـ ".حذف"'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // 4. التحقق من صلاحيات البوت كأدمن ليتمكن من الحذف للجميع
    if (!isBotAdmin) {
        let info = '⚠️ يجب أن أكون مشرفاً (Admin) لأتمكن من حذف رسائل الآخرين.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    try {
        // تنفيذ عملية الحذف للرسالة المردود عليها
        await conn.sendMessage(m.chat, {
            delete: {
                remoteJid: m.chat,
                fromMe: m.quoted.fromMe,
                id: m.quoted.id,
                participant: m.quoted.sender
            }
        })

        // حذف رسالة الأمر (.حذف) أيضاً لتنظيف الشات
        await conn.sendMessage(m.chat, {
            delete: m.key
        })

    } catch (err) {
        console.error('❌ خطأ في حذف الرسالة:', err)
        let info = '❌ فشل حذف الرسالة. قد تكون الرسالة قديمة جداً أو هناك خطأ في السوكيت.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['حذف']
handler.tags = ['الـمشـرفـيـن']
handler.command = /^(حذف|del|delete)$/i

// تفعيل التحقق من المجموعة والأدمن بشكل تلقائي من الهيكلة
handler.group = true 
handler.admin = true 

export default handler
