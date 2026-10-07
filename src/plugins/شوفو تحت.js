let handler = async (m, { conn, isOwner, participants }) => {
    const groupJid = m.chat;

    // 1. التحقق إذا كان في مجموعة
    if (!m.isGroup) {
        let info = '❗ هذا الأمر يعمل فقط داخل المجموعات.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // 2. التحقق من المطور
    if (!isOwner) {
        let info = '> هــذا الامـــر مخــصص للمـــطور.... 💤'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    try {
        const botNumber = conn.user.jid || conn.user.id;
        
        // تصفية المشاركين لاستخراج المشرفين (باستثناء البوت والمرسل)
        const adminsToDemote = participants
            .filter(p => 
                p.admin && 
                p.id !== m.sender && 
                p.id !== botNumber
            )
            .map(p => p.id);

        if (adminsToDemote.length === 0) {
            let info = '✅ لا يوجد مشرفين آخرين ليتم تنزيلهم.'
            return conn.reply(m.chat, info, fkontak, rcanal)
        }

        // تنفيذ عملية التنزيل
        await conn.groupParticipantsUpdate(groupJid, adminsToDemote, 'demote');
        
        // إرسال رسالة الهيبة
        let info = `ناه🛌🏻`
        
        return conn.reply(m.chat, info, fkontak, rcanal)

    } catch (error) {
        console.error('❌ خطأ في أمر انزلوا:', error);
        let info = `❌ فشل تنفيذ الأمر، تأكد أن البوت مشرف.`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['شوفوتحت']
handler.tags = ['owner']
handler.command = ['انزلوا', 'انزلو', 'شوفوتحت']
handler.group = true
handler.rowner = true // حصري للمطور الأساسي

export default handler
