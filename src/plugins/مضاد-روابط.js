/**
 * antilink_warnings.js
 * نظام رصد الروابط مع 3 إنذارات لـ 𝑹𝒆𝒛𝒆
 * تطوير وتعديل: 𝑹𝒆𝒛𝒆 
 */

let linkRegex  = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
let linkRegex1 = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,24})/i;

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isROwner }) {

    if (!m.isGroup) return;
    if (isAdmin || isOwner || m.fromMe || isROwner) return;

    let chat = global.db.data.chats[m.chat];
    if (!chat.antiLink) return; // النظام غير مفعل في هذه المجموعة

    const isGroupLink = linkRegex.exec(m.text) || linkRegex1.exec(m.text);
    if (!isGroupLink) return;

    // السماح برابط المجموعة نفسه إذا كان البوت مشرفاً
    if (isBotAdmin) {
        const linkThisGroup = `https://chat.whatsapp.com/${await conn.groupInviteCode(m.chat)}`;
        if (m.text.includes(linkThisGroup)) return;
    }

    // حذف الرسالة المخالفة فوراً
    await conn.sendMessage(m.chat, { delete: m.key });

    // نظام إدارة الإنذارات في قاعدة البيانات
    let user = global.db.data.users[m.sender];
    if (!user.antilinkWarnings) user.antilinkWarnings = 0;
    user.antilinkWarnings += 1;
    let warns = user.antilinkWarnings;

    let info = '';
    if (warns === 1) {
        info = `⚠️ *الإنذار الأول (1/3)*\n\nيا @${m.sender.split('@')[0]} يمنع إرسال روابط المجموعات أو القنوات هنا! تم حذف رسالتك.`;
        await conn.reply(m.chat, info, fkontak, rcanal);
    } 
    else if (warns === 2) {
        info = `⚠️ *الإنذار الثاني (2/3)*\n\nيا @${m.sender.split('@')[0]} احذر! هذا هو التنبيه الأخير، المرة القادمة سيتم طردك تلقائياً.`;
        await conn.reply(m.chat, info, fkontak, rcanal);
    } 
    else if (warns >= 3) {
        info = `🚫 *تم الطرد (3/3)*\n\nتم طرد @${m.sender.split('@')[0]} بسبب تكرار إرسال الروابط رغم التحذيرات.\n\n> *𝑹𝒆𝒛𝒆*`;
        
        if (isBotAdmin) {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
            user.antilinkWarnings = 0; // إعادة تعيين الإنذارات بعد الطرد
        } else {
            info += `\n\n⚠️ *ملاحظة:* البوت ليس مشرفاً، لذا تعذر تنفيذ الطرد تلقائياً.`;
        }
        await conn.reply(m.chat, info, fkontak, rcanal);
    }
}
