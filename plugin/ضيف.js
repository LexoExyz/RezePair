import fs from 'fs'
import path from 'path'

/**
 * auto_add_plugin.js
 * بلوقن: الإضافة السريعة (المطور فقط)
 */

let handler = async (m, { conn, text, isOwner }) => {
    // 1. التحقق من المطور
    if (!isOwner) return

    // 2. التحقق من وجود "ريبلاي" لكود
    if (!m.quoted) {
        let info = '❌ يرجى عمل ريبلاي (Tag) للكود الذي تريد حفظه.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // 3. التحقق من إدخال اسم الملف
    if (!text) {
        let info = '❗ يرجى كتابة اسم الملف بعد الأمر.\nمثال: *.ضيف أوامر*'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // تجهيز اسم الملف والمسار
    let filename = text.trim()
    if (!filename.endsWith('.js')) filename += '.js'
    const filePath = path.join(process.cwd(), 'plugins', filename)

    // 4. جلب الكود من الريبلاي
    let code = m.quoted.text || m.quoted.caption

    if (!code) {
        let info = '❌ الرسالة المقتبسة لا تحتوي على نص/كود.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    try {
        // 5. كتابة الملف
        fs.writeFileSync(filePath, code, 'utf8')
        
        await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key } })
        
        let info = `✅ تم الحفظ بنجاح!\n\n📁 الملف: *${filename}*\n📍 المسار: *plugins/${filename}*`
        return conn.reply(m.chat, info, fkontak, rcanal)

    } catch (err) {
        console.error(err)
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key } })
        let info = `❌ حدث خطأ أثناء الحفظ:\n${err.message}`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['ضيف']
handler.tags = ['الـمـطـور']
handler.command = /^(ضيف|save)$/i
handler.rowner = true

export default handler
