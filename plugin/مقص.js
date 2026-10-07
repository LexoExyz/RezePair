/**
 * rps_game.js
 * لعبة حجرة ورقة مقص لـ 𝑹𝒆𝒛𝒆
 * تطوير وتعديل: 𝑹𝒆𝒛𝒆 
 */

let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
    conn.rps = conn.rps ? conn.rps : {}
    let id = m.chat
    let room = conn.rps[id]

    // --- 1. فتح الغرفة (مقص) ---
    if (command === 'مقص') {
        if (room) {
            let info = `*⏳ هناك تحدي قائم بالفعل في هذه المجموعة!*`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
        
        conn.rps[id] = {
            id,
            creator: m.sender,
            p1: m.sender,
            p2: null,
            state: 'waiting',
            p1Choice: null,
            p2Choice: null
        }

        let capt = `🎮 *تحدي: حجرة - ورقة - مقص*\n\n👤 *المنشئ:* @${m.sender.split`@` [0]}\n🕹️ *الحالة:* في انتظار خصم...\n\n📥 للانضمام أرسل: *${usedPrefix}شارك*\n🗑️ للإلغاء أرسل: *${usedPrefix}شيل*\n\n> *𝑹𝒆𝒛𝒆*`.trim()
        return conn.reply(m.chat, capt, fkontak, rcanal)
    }

    // --- 2. إلغاء الغرفة (شيل) ---
    if (command === 'شيل') {
        if (!room) {
            let info = `*❌ لا توجد غرفة نشطة حالياً لإلغائها!*`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
        if (m.sender === room.creator || isOwner) {
            delete conn.rps[id]
            let info = `✅ *تم إلغاء التحدي بنجاح.*`
            return conn.reply(m.chat, info, fkontak, rcanal)
        } else {
            let info = `*🚫 عذراً، المنشئ فقط من يمكنه إلغاء التحدي.*`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
    }

    // --- 3. الانضمام (شارك) ---
    if (command === 'شارك') {
        if (!room) {
            let info = `*📯 لا توجد غرفة مفتوحة، أرسل ${usedPrefix}مقص للبدء!*`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
        if (room.state !== 'waiting') {
            let info = `*🏁 بدأت اللعبة بالفعل، انتظر الجولة القادمة.*`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
        if (room.p1 === m.sender) {
            let info = `*✅ أنت صاحب التحدي بالفعل، بانتظار خصمك.*`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
        
        room.p2 = m.sender
        room.state = 'choosing'
        
        let joinMsg = `🤝 *تم قبول التحدي!*\n\nالمتحدي الأول: @${room.p1.split`@` [0]}\nالمتحدي الثاني: @${room.p2.split`@` [0]}\n\n*📩 يرجى تفقد الخاص لاختيار سلاحكم.*`
        conn.reply(m.chat, joinMsg, fkontak, rcanal)

        let players = [room.p1, room.p2]
        for (let jid of players) {
            await conn.sendMessage(jid, { 
                text: `🎮 *لعبة حجرة ورقة مقص*\n\nيرجى إرسال اختيارك الآن:\n*( حجرة / ورقة / مقص )*\n\n> *𝑹𝒆𝒛𝒆*`
            })
        }
    }
}

handler.before = async function (m, { conn }) {
    this.rps = this.rps ? this.rps : {}
    
    if (!m.isGroup) {
        let room = Object.values(this.rps).find(r => (r.p1 === m.sender || r.p2 === m.sender) && r.state === 'choosing')
        if (!room) return

        let choice = m.text.trim().toLowerCase()
        let validChoices = ['حجرة', 'ورقة', 'مقص']
        
        if (!validChoices.includes(choice)) return m.reply(`*❌ يرجى اختيار كلمة صحيحة (حجرة، ورقة، مقص)!*`)

        if (m.sender === room.p1) {
            if (room.p1Choice) return m.reply(`*✅ لقد اخترت بالفعل، بانتظار خصمك...*`)
            room.p1Choice = choice
        } else {
            if (room.p2Choice) return m.reply(`*✅ لقد اخترت بالفعل، بانتظار خصمك...*`)
            room.p2Choice = choice
        }
        
        m.reply(`✨ *تم تسجيل اختيارك:* ${choice}\nعد للمجموعة لرؤية النتيجة!`)

        if (room.p1Choice && room.p2Choice) {
            let p1 = room.p1
            let p2 = room.p2
            let c1 = room.p1Choice
            let c2 = room.p2Choice
            let result = ''

            if (c1 === c2) {
                result = `🤝 *النتيجة:* تعادل! كلاهما اختار [ ${c1} ]`
            } else if (
                (c1 === 'حجرة' && c2 === 'مقص') ||
                (c1 === 'مقص' && c2 === 'ورقة') ||
                (c1 === 'ورقة' && c2 === 'حجرة')
            ) {
                result = `🏆 *الفائز:* @${p1.split`@` [0]}\n💀 *الخاسر:* @${p2.split`@` [0]}\n\n✨ *${c1}* يسحق *${c2}*`
            } else {
                result = `🏆 *الفائز:* @${p2.split`@` [0]}\n💀 *الخاسر:* @${p1.split`@` [0]}\n\n✨ *${c2}* يسحق *${c1}*`
            }

            let finalMsg = `🏁 *انتهت الجولة الملكية!*\n\n👤 @${p1.split`@` [0]}: ${c1}\n👤 @${p2.split`@` [0]}: ${c2}\n\n${result}\n\n> *𝑹𝒆𝒛𝒆*`
            await conn.reply(room.id, finalMsg, fkontak, rcanal)
            delete this.rps[room.id]
        }
        return
    }
}

handler.help = ['مقص']
handler.tags = ['الـالـعـاب']
handler.command = /^(مقص|شارك|شيل)$/i
handler.group = true

export default handler
