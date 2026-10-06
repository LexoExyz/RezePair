import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, isOwner, text, usedPrefix, command }) => {
    // 1. التحقق من المطور فقط
    if (!isOwner) {
        let info = '> هــذا الامـــر مخــصص للمـــطور.... 💤'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    const pluginsDir = path.resolve('./plugins')
    const trashDir = path.resolve('./trash')

    // التأكد من وجود مجلد التراش
    if (!fs.existsSync(trashDir)) fs.mkdirSync(trashDir)

    // جلب ملفات الإضافات
    const pluginFiles = fs.readdirSync(pluginsDir)
      .filter(file => file.endsWith('.js') && !file.startsWith('_'))
    
    const pluginNames = pluginFiles.map(v => v.replace('.js', ''))

    // إذا لم يرسل اسم الملف أو الرقم، يعرض القائمة
    if (!text) {
        let pluginList = pluginNames.map((v, index) =>
            `*${(index + 1).toString().padEnd(2)}.* \`${v}\``
        ).join('\n')

        let info = `🗑️ *قائمة إضافات البوت:*\n`
        info += `*‏‏⎔ ٠ ┈─ ━╼ • ◞📁◜ • ╾━ ─┈‏ ٠ ⎔*\n`
        info += `🔢 الإجمالي: ${pluginNames.length} ملف\n\n`
        info += `${pluginList}\n`
        info += `*‏⎔ ٠ ┈─ ━╼ • ◞📁◜ • ╾━ ─┈‏ ٠ ⎔*\n`
        info += `✍️ أرسل رقم أو اسم الملف لحذفه (نقله للتراش).\n`
        info += `مثال: \`${usedPrefix + command} 5\``

        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    let selectedPlugin = ''

    // التحقق إذا كان المدخل رقم أو نص
    if (/^\d+$/.test(text)) {
        const index = parseInt(text) - 1
        if (index >= 0 && index < pluginNames.length) {
            selectedPlugin = pluginNames[index]
        } else {
            let info = `⚠️ الرقم غير صحيح! اختر رقم بين 1 و ${pluginNames.length}`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
    } else {
        if (pluginNames.includes(text)) {
            selectedPlugin = text
        } else {
            let info = `❌ الملف "${text}" غير موجود ضمن الإضافات.`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
    }

    // تنفيذ عملية النقل
    const fileName = `${selectedPlugin}.js`
    const sourcePath = path.join(pluginsDir, fileName)
    const destPath = path.join(trashDir, fileName)

    try {
        if (fs.existsSync(sourcePath)) {
            fs.renameSync(sourcePath, destPath)
            await m.react('🗑️')
            let info = `✅ تم نقل *${fileName}* إلى مجلد التراش بنجاح.`
            return conn.reply(m.chat, info, fkontak, rcanal)
        } else {
            let info = `❌ فشل النقل، الملف غير موجود فعلياً.`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
    } catch (e) {
        console.error(e)
        let info = `❌ حدث خطأ أثناء النقل: ${e.message}`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['امسح']
handler.tags = ['الـمـطـور']
handler.command = ['باتش-حذف', 'امسح', 'df']
handler.rowner = true // حصري للمطور الأساسي

export default handler
