let handler = async (m, { conn, isOwner }) => {
    const jid = m.chat;

    // التحقق إذا كان في مجموعة
    if (!m.isGroup) {
        let info = '🚫 هذا الأمر يعمل فقط داخل المجموعات.'
        return conn.reply(jid, info, fkontak, rcanal)
    }

    // التحقق من المطور
    if (!isOwner) {
        let info = '> هــذا الامـــر مخــصص للمـــطور.... 💤'
        return conn.reply(jid, info, fkontak, rcanal)
    }

    // رد فعل تفاعل
    await m.react('🫩');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // إرسال صورة مع رسالة وداع
    const imageUrl = 'https://files.catbox.moe/w8ycz1.jpg';
    const farewellMessage = 'باي 🐼';

    await conn.sendMessage(jid, {
        image: { url: imageUrl },
        caption: farewellMessage,
    }, { quoted: fkontak }) // تم استخدام fkontak هنا لضمان ظهور البصمة

    await new Promise(resolve => setTimeout(resolve, 3000));

    try {
        await conn.groupLeave(jid);
        console.log('✅ خرج البوت من المجموعة');
    } catch (err) {
        console.error('❌ فشل الخروج من المجموعة:', err);
        let info = '❌ فشل الخروج من المجموعة.'
        await conn.reply(jid, info, fkontak, rcanal)
    }
}

handler.help = ['اطلع']
handler.tags = ['الـمـطـور']
handler.command = ['اطلع', 'خروج', 'leave']
handler.rowner = true 

export default handler
