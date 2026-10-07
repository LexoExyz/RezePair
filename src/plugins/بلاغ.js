import fs from 'fs'
import path from 'path'

const file = path.resolve('./data/complaints.json')
const devJid = '212701927990@s.whatsapp.net' // رقم المطور الخاص بك

// التأكد من وجود المجلد والملف
if (!fs.existsSync(path.dirname(file))) fs.mkdirSync(path.dirname(file), { recursive: true })
if (!fs.existsSync(file)) fs.writeFileSync(file, '[]')

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // التحقق من وجود نص الشكوى
    if (!text) {
        let info = `📢 يرجى كتابة البلاغ بعد الأمر.\nمثال: \`${usedPrefix + command} البوت يتوقف أحياناً\``
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    if (text.length < 10) {
        let info = `❌ البلاغ قصير جداً، يرجى توضيح المشكلة أكثر.`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    const name = m.pushName || "عضو مجهول"
    const sender = m.sender
    const date = new Date().toLocaleString("ar-EG")

    // حفظ الشكوى محلياً
    const list = JSON.parse(fs.readFileSync(file))
    list.push({
        name,
        complaint: text,
        from: sender,
        date: date
    })
    fs.writeFileSync(file, JSON.stringify(list, null, 2))

    // إرسال تأكيد للمستخدم
    await m.react('📩')
    let infoConfirm = `✅ تم تسجيل البلاغ بنجاح وإرساله للمطور.\n📌 شكراً لمساعدتنا في تحسين النظام!`
    await conn.reply(m.chat, infoConfirm, fkontak, rcanal)

    // إرسال الشكوى للمطور
    let report = `*📩 شكوى جديدة من المستخدم*\n`
    report += `*‏⎔ ٠ ┈─ ━╼ • ◞📢◜ • ╾━ ─┈‏ ٠ ⎔*\n\n`
    report += `*👤 الاسم:* ${name}\n`
    report += `*📱 الرقم:* wa.me/${sender.split("@")[0]}\n`
    report += `*📅 التاريخ:* ${date}\n`
    report += `*💬 البلاغ:* \n\`\`\`${text}\`\`\`\n\n`
    report += `*‏⎔ ٠ ┈─ ━╼ • ◞📢◜ • ╾━ ─┈‏ ٠ ⎔*\n`
    report += `> *قسم الدعم الفني • System*`

    await conn.sendMessage(devJid, { text: report }, { quoted: fkontak })
}

handler.help = ['بلاغ']
handler.tags = ['الـدعـم']
handler.command = ['شكوى', 'بلاغ', 'report']

export default handler
