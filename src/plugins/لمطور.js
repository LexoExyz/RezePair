/**
 * manage_owners.js
 * إدارة قائمة المطورين (إضافة/حذف) لـ 𝑹𝒆𝒛𝒆
 * تطوير وتعديل: 𝑹𝒆𝒛𝒆 
 */

import fs from 'fs'
import path from 'path'

// المسار الصحيح لملف settings.js في الجذر الرئيسي
const settingsPath = path.join(process.cwd(), 'settings.js')

const handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
    // التحقق من أن المستخدم هو المالك الأساسي (Full Owner)
    if (!isOwner) return

    // استخراج الرقم المستهدف (من الرد، المنشن، أو النص)
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : ''
    let targetNumber = who.split('@')[0]

    if (!targetNumber || targetNumber.length < 9) {
        let info = `🍃 *طريقة الاستخدام:*\n\n*${usedPrefix + command}* [الرقم]\nأو بالرد على رسالة الشخص وأرسل *${usedPrefix + command}*`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    await m.react('⚙️')

    try {
        // قراءة محتوى ملف settings.js
        let settingsContent = fs.readFileSync(settingsPath, 'utf8')
        const ownerRegex = /(global\.owner\s*=\s*\[)([^\]]*)(\])/s
        const match = settingsContent.match(ownerRegex)
        
        if (!match) {
            throw new Error('لم يتم العثور على مصفوفة المطورين في ملف settings.js')
        }

        let arrayContent = match[2]
        // تحويل محتوى المصفوفة من نص إلى Array حقيقي للمعالجة
        let ownersArray = arrayContent.split(',').map(v => v.trim().replace(/['"]/g, '')).filter(v => v !== '')

        if (command === 'لمطور') {
            // إضافة مطور
            if (ownersArray.includes(targetNumber)) {
                let info = `✅ الرقم *${targetNumber}* موجود بالفعل في قائمة المطورين.`
                return conn.reply(m.chat, info, fkontak, rcanal)
            }
            ownersArray.push(targetNumber)
        } else if (command === 'ازالة_مطور') {
            // إزالة مطور
            if (!ownersArray.includes(targetNumber)) {
                let info = `❌ الرقم *${targetNumber}* غير موجود في قائمة المطورين أصلاً.`
                return conn.reply(m.chat, info, fkontak, rcanal)
            }
            ownersArray = ownersArray.filter(v => v !== targetNumber)
        }

        // إعادة بناء النص للملف
        const newArrayContent = ownersArray.map(v => `"${v}"`).join(', ')
        const updatedContent = settingsContent.replace(ownerRegex, `$1${newArrayContent}$3`)
        
        // حفظ التعديلات في الملف
        fs.writeFileSync(settingsPath, updatedContent, 'utf8')
        
        // تحديث القائمة في ذاكرة البوت الحالية
        global.owner = ownersArray.map(v => [v, 'Owner', true]) // تحديث الهيكل حسب احتياج البوت

        let successAction = command === 'لمطور' ? 'إضافته إلى' : 'إزالته من'
        let successMsg = `✅ *تمت العملية بنجاح*\n\n📌 *الرقم:* ${targetNumber}\n✨ *الإجراء:* ${successAction} قائمة المطورين.`
        
        await m.react('✅')
        return conn.reply(m.chat, successMsg, fkontak, rcanal)
        
    } catch (err) {
        console.error(err)
        await m.react('❌')
        let info = `❌ *حدث خطأ أثناء تعديل الإعدادات:* \n${err.message}`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['لمطور', 'ازالة_مطور']
handler.tags = ['الـمـطـور']
handler.command = /^(لمطور|ازالة_مطور)$/i
handler.rowner = true // حصري للمطورين الأساسيين فقط

export default handler
