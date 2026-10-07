import { getDevice } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
    try {
        let targetUser;
        let quotedMsg = m.quoted ? m.quoted : m;

        // 1️⃣ تحديد المستخدم المستهدف
        if (m.quoted) {
            targetUser = m.quoted.sender;
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            targetUser = m.mentionedJid[0];
        } else {
            targetUser = m.sender;
        }

        // 2️⃣ تحديد معرف الرسالة للفحص
        let msgId = quotedMsg.id;
        let deviceType = "غير معروف 🌐";
        
        // 🔍 تحليل دقيق لنوع الجهاز بناءً على بادئة وطول المعرف (ID Logic)
        if (msgId.startsWith('BAE5') && msgId.length === 16) {
            deviceType = "🤖 *أندرويد (Android)*";
        } else if (msgId.startsWith('3EB0') && msgId.length === 12) {
            deviceType = "💻 *واتساب ويب (Web)*";
        } else if (msgId.length === 20 || msgId.startsWith('3A')) {
            deviceType = "🍎 *آيفون (iOS)*";
        } else if (msgId.length > 21) {
            deviceType = "📱 *أندرويد (نسخة مطورة)*";
        } else {
            // محاولة أخيرة باستخدام الدالة المدمجة
            let dev = getDevice(msgId);
            deviceType = dev === 'android' ? "🤖 *أندرويد*" : dev === 'ios' ? "🍎 *آيفون*" : dev === 'web' ? "💻 *ويب*" : "📱 *جهاز ذكي*";
        }

        // 3️⃣ تحديد نوع نسخة الواتساب (Business vs Personal)
        let waType = "💬 *واتساب عادي (Personal)*";
        
        try {
            let userBusiness = await conn.getBusinessProfile(targetUser).catch(() => null);
            if (userBusiness) waType = "💼 *واتساب أعمال (Business)*";
        } catch {
            waType = "💬 *واتساب عادي*";
        }

        // 4️⃣ تنسيق الرد النهائي بنظام الرد الموثق
        let userTag = targetUser.split('@')[0];
        let info = `🕵️ *نـتـائـج فـحـص الـمـسـتـخـدم*\n\n`
        info += `👤 *المستهدف:* @${userTag}\n`
        info += `🔍 *نوع الـجـهـاز:* ${deviceType}\n`
        info += `📦 *نسخة الـواتـس:* ${waType}\n\n`
        info += `> *نظام فحص الأجهزة • System*`

        return conn.reply(m.chat, info, fkontak, rcanal, { mentions: [targetUser] });

    } catch (err) {
        console.error(err);
        let info = "❌ حدث خطأ أثناء محاولة فحص بيانات الجهاز.";
        return conn.reply(m.chat, info, fkontak, rcanal);
    }
}

handler.help = ['جهاز']
handler.tags = ['الـأعـضـاء']
handler.command = ["جهاز", "device", "فحص_جهاز"]

export default handler
