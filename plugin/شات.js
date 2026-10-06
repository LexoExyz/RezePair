/**
 * chat_control.js
 * قفل وفتح الشات للمطور ومشرفي المجموعة فقط
 */

const timers = new Map(); // لتخزين مؤقتات القفل والفتح لكل مجموعة

let handler = async (m, { conn, text, args, usedPrefix, command, isROwner, isAdmin, isBotAdmin }) => {
    // 1. التحقق من أن الأمر داخل مجموعة
    if (!m.isGroup) {
        let info = '❗ هذا الأمر يعمل فقط داخل المجموعات.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // 2. التحقق من الصلاحيات (المطور أو مشرف المجموعة)
    if (!(isROwner || isAdmin)) {
        let info = '❌ هذا الأمر مخصص لـ *المطور* أو *مشرفي المجموعة* فقط.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // 3. التحقق من رتبة البوت (يجب أن يكون أدمن ليقفل الشات)
    if (!isBotAdmin) {
        let info = '⚠️ البوت يحتاج رتبة *أدمن* ليتمكن من تغيير إعدادات المجموعة.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    if (args.length < 1) {
        let info = `❌ يرجى كتابة الأمر بهذا الشكل:\n*${usedPrefix + command} قفل 2د*\n*${usedPrefix + command} فتح 30ث*\n*${usedPrefix + command} قفل*`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    const action = args[0].toLowerCase();
    let durationMs = null;

    // 4. تحليل المدة (د = دقائق، ث = ثواني)
    if (args.length >= 2) {
        const match = args[1].match(/^(\d+)([دث])$/);
        if (!match) {
            let info = '❌ صيغة المدة غير صحيحة. استخدم مثل: *1د* أو *30ث*'
            return conn.reply(m.chat, info, fkontak, rcanal)
        }

        const value = parseInt(match[1]);
        const unit = match[2];

        if (isNaN(value) || value <= 0) {
            let info = '❌ المدة يجب أن تكون رقماً أكبر من صفر.'
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
        
        durationMs = unit === 'د' ? value * 60 * 1000 : value * 1000;
    }

    try {
        if (action === 'قفل' || action === 'اغلاق') {
            await conn.groupSettingUpdate(m.chat, 'announcement'); // قفل الشات

            if (timers.has(m.chat)) clearTimeout(timers.get(m.chat));

            if (durationMs) {
                const timer = setTimeout(async () => {
                    await conn.groupSettingUpdate(m.chat, 'not_announcement');
                    let info = '🔓 تم فتح الشات تلقائياً بعد انتهاء المهلة.'
                    await conn.reply(m.chat, info, fkontak, rcanal)
                    timers.delete(m.chat);
                }, durationMs);
                timers.set(m.chat, timer);
            }

            let info = durationMs ? `🔒 تم قفل الشات لمدة *${args[1]}*.` : `🔒 تم قفل الشات.`
            return conn.reply(m.chat, info, fkontak, rcanal)

        } else if (action === 'فتح') {
            await conn.groupSettingUpdate(m.chat, 'not_announcement'); // فتح الشات

            if (timers.has(m.chat)) clearTimeout(timers.get(m.chat));

            if (durationMs) {
                const timer = setTimeout(async () => {
                    await conn.groupSettingUpdate(m.chat, 'announcement');
                    let info = '🔒 تم قفل الشات تلقائياً بعد انتهاء المهلة.'
                    await conn.reply(m.chat, info, fkontak, rcanal)
                    timers.delete(m.chat);
                }, durationMs);
                timers.set(m.chat, timer);
            }

            let info = durationMs ? `🔓 تم فتح الشات لمدة *${args[1]}*.` : `🔓 تم فتح الشات.`
            return conn.reply(m.chat, info, fkontak, rcanal)

        } else {
            let info = `❌ الأمر غير مفهوم. استخدم:\n*${usedPrefix + command} قفل 1د* أو *فتح*`
            return conn.reply(m.chat, info, fkontak, rcanal)
        }

    } catch (e) {
        console.error(e);
        let info = '⚠️ حدث خطأ أثناء محاولة تغيير إعدادات المجموعة.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
};

handler.help = ['شات <قفل/فتح>'];
handler.tags = ['الـمـشـرفـيـن'];
handler.command = ['شات', 'الدردشة', 'chat'];
handler.group = true; 
handler.admin = false; 

export default handler;
