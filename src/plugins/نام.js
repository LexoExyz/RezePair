/**
 * shutdown.js
 * إيقاف تشغيل البوت بالكامل
 * الصلاحية: المطور فقط (isROwner)
 * تطوير وتعديل: 𝑹𝒆𝒛𝒆
 */

let handler = async (m, { conn, isROwner, usedPrefix, command }) => {
    // 1. التحقق من الصلاحية (المطور فقط)
    if (!isROwner) return 

    // 2. رسالة إغلاق احترافية
    let info = `
⚠️ *جاري إيقاف التشغيل الفوري...*
━━━━━━━━━━━━━━━━━━
⚙️ *الحالة:* إغلاق آمن (Graceful Shutdown)
👤 *بواسطة:* المطور
⌛ *الوقت المستغرق:* 2 ثانية
━━━━━━━━━━━━━━━━━━
👋 سلام، هروح انام
`.trim()

    // إرسال الرد الموثق قبل الإغلاق
    await conn.reply(m.chat, info, fkontak, rcanal)

    // 3. تأخير بسيط لضمان وصول الرسالة قبل قتل العملية
    setTimeout(async () => {
        console.log('⚠️ تم إيقاف البوت يدوياً بواسطة المطور.')
        await conn.connectionUpdate({ connection: 'close', lastDisconnect: { error: null, date: new Date() } })
        process.exit(0) 
    }, 2000)
    
    return conn.reply(m.chat, info, fkontak, rcanal)
}

handler.help = ['نام']
handler.tags = ['الـمـطـور']
handler.command = ['نام']
handler.rowner = true // تفعيل قيد المطور الأساسي

export default handler
