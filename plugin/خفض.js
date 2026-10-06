/**
 * demote.js
 * أمر خفض المشرفين
 * تم التعريب وإضافة حماية للمطور والمالك
 */

var handler = async (m, { conn, usedPrefix, command, text, groupMetadata }) => {
    // تحديد المستخدم المستهدف (منشن أو رد)
    let mentionedJid = await m.mentionedJid
    let user = mentionedJid && mentionedJid.length ? mentionedJid[0] : m.quoted && await m.quoted.sender ? await m.quoted.sender : null

    // رسالة تنبيه في حال عدم تحديد مستخدم
    if (!user) {
        let info = `*❀ منشن المستخدم أو رد على رسالته لخفضه من الإشراف.*`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    try {
        const groupInfo = await conn.groupMetadata(m.chat)
        // تحديد مالك المجموعة ومطور البوت للحماية
        const ownerGroup = groupInfo.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
        const ownerBot = global.owner[0][0] + '@s.whatsapp.net'

        // حماية البوت والمطور والمالك من الخفض
        if (user === conn.user.jid) {
            let info = `*ꕥ لا يمكنك خفض رتبة البوت.*`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
        if (user === ownerGroup) {
            let info = `*ꕥ لا يمكنك خفض رتبة منشئ المجموعة.*`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
        if (user === ownerBot) {
            let info = `*ꕥ لا يمكنك خفض رتبة مطور البوت.*`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }

        // تنفيذ عملية الخفض
        await conn.groupParticipantsUpdate(m.chat, [user], 'demote')
        let info = `*❀ تم خفض المستخدم وإلغاء صلاحياته كأدمن بنجاح.*`
        return conn.reply(m.chat, info, fkontak, rcanal)

    } catch (e) {
        // معالجة الأخطاء وإرسال تقرير
        let info = `*⚠︎ حدثت مشكلة أثناء تنفيذ الأمر.\n\n${e.message}`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['خفض']
handler.tags = ['الـمـشـرفـيـن']
handler.command = ['خفض']

// قيود التشغيل لضمان استقرار البوت
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
