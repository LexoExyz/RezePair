let handler = async (m, { conn, text }) => {
    let targets = []

    // إضافة الرد كهدف
    if (m.quoted) {
        targets.push(m.quoted.sender)
    }

    // إضافة المنشنات كأهداف
    if (m.mentionedJid.length > 0) {
        targets.push(...m.mentionedJid)
    }

    // التحقق من وجود أهداف
    if (targets.length === 0) {
        let info = `❌ يرجى الرد على رسالة الشخص لإرسال الرسالة له.`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // الرسالة المطلوبة: "هلا" فقط
    let messageToSend = "هلا"

    // إرسال الرسالة لكل هدف (خاص)
    let successCount = 0
    for (const target of [...new Set(targets)]) {
        try {
            await conn.sendMessage(target, { text: messageToSend })
            successCount++
        } catch (e) {
            console.error(`فشل الإرسال لـ ${target}:`, e)
        }
    }

    if (successCount > 0) {
        await m.react('✅')
        let info = `✅ تم إرسال رسالة إلى الشخص بنجاح!`
        return conn.reply(m.chat, info, fkontak, rcanal)
    } else {
        let info = `❌ فشل إرسال الرسالة، قد يكون الشخص مغلقاً للخاص.`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['خاصك']
handler.tags = ['الـمـشـرفـيـن']
handler.command = ['خاصك', 'خاص', 'dm']

export default handler
