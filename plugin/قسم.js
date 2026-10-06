import fs from 'fs'
import path from 'path'

/**
 * category_viewer.js
 * عرض أوامر قسم معين مع صورة من المجلد المحلي
 * الصلاحية: الجميع
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
    const section = args[0]

    if (!section) {
        return m.reply(`⚠️ يرجى كتابة اسم القسم.\nمثال: *${usedPrefix + command} ترفيه*`)
    }

    // 📂 تحديد مجلد الأوامر (Plugins)
    const pluginsDir = path.join(process.cwd(), 'plugins')
    const cmds = []

    // 🔍 قراءة الأوامر وتصنيفها
    const files = fs.readdirSync(pluginsDir)
    
    for (const file of files) {
        if (file.endsWith('.js')) {
            try {
                // استيراد الملف ديناميكياً مع إضافة timestamp لتحديث الكاش
                const plugin = await import(path.join(pluginsDir, file) + '?update=' + Date.now())
                const cmd = plugin.default

                // التحقق من القسم (يدعم التاغز tags أو الكاتيجوري category)
                if (cmd && (cmd.tags?.includes(section) || cmd.category === section)) {
                    const name = Array.isArray(cmd.help) ? cmd.help[0] : (cmd.help || file.replace('.js', ''))
                    cmds.push(name)
                }
            } catch (e) {
                continue
            }
        }
    }

    if (cmds.length === 0) {
        return m.reply(`❌ لم يتم العثور على أوامر في قسم *${section}*`)
    }

    // 🎨 تنسيق قائمة الأوامر
    const commandList = cmds.map(name => `> •. ⟨${name}`).join('\n')

    let info = `
*╮••─๋︩︪──๋︩︪─═⊐‹﷽›⊏═─๋︩︪──๋︩︪─┈☇*
*╿ ↵〔 قـسـم   ${section} : ⤹ 〕*
*╯─ׅ ─๋︩︪─┈ ─๋︩︪─═⊐‹❄️›⊏═┈ ─๋︩︪─ ∙ ∙ ⊰ـ*
*╮─ׅ─๋︩︪─﹝الأوامر المتوفرة : ⤹﹞── ∙ ∙ ⊰ـ*
${commandList}
*╯─ׅ ─๋︩︪─┈ ─๋︩︪─═⊐‹❄️›⊏═┈ ─๋︩︪─ ∙ ∙ ⊰ـ*`.trim()

    // 🖼️️ جلب الصورة من مجلد src
    const imagePath = path.join(process.cwd(), 'src', 'قوائم.jpg')

    // إرسال الرد الموثق
    if (fs.existsSync(imagePath)) {
        await conn.sendMessage(m.chat, {
            image: fs.readFileSync(imagePath),
            caption: info,
            mentions: [m.sender]
        }, { quoted: fkontak })
    } else {
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['قسم']
handler.tags = ['main']
handler.command = /^(قسم|category)$/i

export default handler
