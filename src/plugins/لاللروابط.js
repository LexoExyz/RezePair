/**
 * antilink.js
 * نظام حماية المجموعة من الروابط
 */

let handler = async (m, { conn, command, isAdmin, isOwner }) => {
    if (!m.isGroup) return;
    
    // التحقق من صلاحيات المشرف
    if (!isAdmin && !isOwner) {
        let info = '❌ هذا الأمر مخصص لمشرفي المجموعة فقط.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    let chat = global.db.data.chats[m.chat];
    let isEnable = command === 'لاللروابط-اون';
    
    if (isEnable) {
        chat.antiLink = true;
        let info = '✅ *تم تفعيل نظام مضاد الروابط*\n\nسيقوم البوت برصد أي رابط يتم إرساله، وإنذار العضو ثم طرده في حال التكرار.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    } else {
        chat.antiLink = false;
        let info = '❌ *تم إيقاف نظام مضاد الروابط*'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
};

handler.help = ['لاللروابط-اون', 'لاللروابط-اوف'];
handler.tags = ['الـمـشـرفـيـن'];
handler.command = /^(لاللروابط-اون|الاللروابط-اوف)$/i;
handler.group = true;
handler.admin = true;

export default handler;
