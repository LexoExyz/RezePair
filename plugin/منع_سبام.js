// تطوير وتعديل: 𝑹𝒆𝒛𝒆 
/**
 * antispam.js
 * نظام مكافحة السبام المطور لـ 𝑹𝒆𝒛𝒆
 * تطوير وتعديل: 𝑹𝒆𝒛𝒆 
 */

if (!global.spamTracker) global.spamTracker = {}
if (!global.mutedUsers) global.mutedUsers = {}
if (!global.violationCounter) global.violationCounter = {}

let handler = async (m, { conn, command, isAdmin, isBotAdmin, usedPrefix }) => {
    if (!m.isGroup) return
    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = {}

    // التحقق من الصلاحيات
    if (!isAdmin) {
        let info = '❌ هذا الأمر مخصص لمشرفي المجموعة فقط.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    if (command === 'سبام') {
        // إرسال رسالة التحكم بالأزرار
        return conn.sendMessage(m.chat, {
            text: `🛡️ *نظام حماية 𝑹𝒆𝒛𝒆*\n\nيرجى اختيار الإجراء المطلوب للتحكم في مكافحة السبام:`,
            footer: '𝑹𝒆𝒛𝒆',
            buttons: [
                { buttonId: `${usedPrefix}منع_سبام`, buttonText: { displayText: '✅ تفعيل الحماية' }, type: 1 },
                { buttonId: `${usedPrefix}فتح_سبام`, buttonText: { displayText: '🔓 تعطيل الحماية' }, type: 1 }
            ],
            headerType: 1,
            viewOnce: true
        }, { quoted: fkontak })
    }

    if (command === 'منع_سبام') {
        if (!isBotAdmin) {
            let info = '❌ يجب أن يكون البوت مشرفاً لتفعيل هذا النظام.'
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
        chat.antiSpam = true
        let info = `✅ *تم تفعيل مانع السبام بنجاح*\n⏳ سيتم كتم المزعجين، وفي حال التكرار سيتم الطرد لمدة 5 دقائق.`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    if (command === 'فتح_سبام') {
        chat.antiSpam = false
        let info = `🔓 *تم إيقاف نظام حماية السبام.*`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup || !isBotAdmin) return
    let chat = global.db.data.chats[m.chat]
    if (!chat || !chat.antiSpam) return
    if (isAdmin) return 

    let user = m.sender
    let chatId = m.chat
    let uniqueId = chatId + user

    // معالجة المستخدمين المكتومين (المتحايلين)
    if (global.mutedUsers[uniqueId]) {
        let now = Date.now()
        if (now < global.mutedUsers[uniqueId]) {
            await conn.sendMessage(chatId, { delete: m.key })

            if (!global.violationCounter[uniqueId]) global.violationCounter[uniqueId] = 1
            else global.violationCounter[uniqueId]++

            if (global.violationCounter[uniqueId] >= 4) {
                delete global.violationCounter[uniqueId]
                delete global.mutedUsers[uniqueId]
                
                let groupMetadata = await conn.groupMetadata(chatId)
                let groupName = groupMetadata.subject

                try {
                    await conn.sendMessage(user, { 
                        text: `🚫 *عقوبة طرد مؤقت*\n\nلقد تم طردك من مجموعة [ ${groupName} ] لمدة 5 دقائق بسبب السبام والتحايل على الكتم.` 
                    })
                } catch (e) { }

                await conn.groupParticipantsUpdate(chatId, [user], 'remove')
                let info = `🚫 *طرد مؤقت لمدة 5 دقائق*\n\n👤 العضو: @${user.split('@')[0]}\nالسبب: تخطي حدود الكتم والسبام المكرر.`
                await conn.reply(chatId, info, fkontak, rcanal)
                
                // إعادة العضو بعد 5 دقائق
                setTimeout(async () => {
                    try {
                        let response = await conn.groupParticipantsUpdate(chatId, [user], 'add')
                        if (response[0]?.status === "403") throw new Error("Privacy")
                        
                        await conn.reply(chatId, `✅ تم إعادة العضو @${user.split('@')[0]} بنجاح بعد انتهاء العقوبة.`, fkontak, rcanal)
                    } catch (e) {
                        let code = await conn.groupInviteCode(chatId)
                        await conn.sendMessage(user, { 
                            text: `⚠️ *انتهت عقوبتك*\nلكن لم أستطع إضافتك تلقائياً بسبب خصوصيتك.\nرابط العودة: https://chat.whatsapp.com/${code}` 
                        })
                    }
                }, 300000) 
            }
            return false
        } else {
            delete global.mutedUsers[uniqueId]
            delete global.violationCounter[uniqueId]
        }
    }

    // تتبع الرسائل لحساب السبام
    if (!global.spamTracker[uniqueId]) {
        global.spamTracker[uniqueId] = { count: 1, lastTime: Date.now() }
    } else {
        let timeDiff = Date.now() - global.spamTracker[uniqueId].lastTime
        if (timeDiff < 5000) global.spamTracker[uniqueId].count++
        else global.spamTracker[uniqueId].count = 1
        global.spamTracker[uniqueId].lastTime = Date.now()

        if (global.spamTracker[uniqueId].count >= 5) {
            global.mutedUsers[uniqueId] = Date.now() + 30000 // كتم 30 ثانية
            global.spamTracker[uniqueId].count = 0
            global.violationCounter[uniqueId] = 0
            await conn.sendMessage(chatId, { delete: m.key })
            let info = `🚫 *كتم تلقائي مؤقت*\n\n👤 العضو: @${user.split('@')[0]}\n⚠️ يرجى التوقف عن السبام لتجنب الطرد!`
            return conn.reply(chatId, info, fkontak, rcanal)
        }
    }
}

handler.help = ['سبام']
handler.tags = ['الـمـشـرفـيـن']
handler.command = /^(سبام|منع_سبام|فتح_سبام)$/i
handler.group = true
handler.admin = true

export default handler
