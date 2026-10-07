// تطوير وتعديل: 𝑹𝒆𝒛𝒆 
const handler = async (m, { conn, text }) => {
    // التحقق من أن المحادثة هي مجموعة
    const isGroup = m.chat.endsWith('@g.us');
    if (!isGroup) {
        let info = '❌ هذا الأمر مخصص للمجموعات فقط.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    try {
        // جلب معلومات المجموعة والأعضاء
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants;
        const mentions = participants.map(p => p.id);

        // تحديد الرسالة المستهدفة (سواء كانت رد أو الرسالة نفسها)
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';

        // إذا كان الرد على ستيكر تحديداً (عشان يتبعت ستيكر حقيقي)
        if (m.quoted && (/sticker/.test(mime) || q.mtype === 'stickerMessage')) {
            const buffer = await m.quoted.download();
            
            return await conn.sendMessage(m.chat, {
                sticker: buffer,
                mentions: mentions,
                contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined
            }, { quoted: m });

        // إذا كان هناك رسالة مقتبسة (رد) فيها وسائط أخرى (صورة، فيديو، صوت، مستند)
        } else if (m.quoted && /image|video|audio|document/.test(mime)) {
            const buffer = await m.quoted.download();
            
            let mediaType;
            if (/image/.test(mime)) mediaType = 'image';
            else if (/video/.test(mime)) mediaType = 'video';
            else if (/audio/.test(mime)) mediaType = 'audio';
            else mediaType = 'document';

            let info = q.msg?.caption || text || 'تم المنشن على الوسائط';
            
            return await conn.sendMessage(m.chat, {
                [mediaType]: buffer,
                caption: info,
                mentions: mentions,
                contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined
            }, { quoted: m });

        } else if (m.quoted && m.quoted.text) {
            // إذا كان الرد على نص
            let info = m.quoted.text;
            
            return await conn.sendMessage(m.chat, {
                text: info,
                mentions: mentions,
                contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined
            }, { quoted: m });

        } else {
            // إذا لم يكن هناك رد، أرسل المنشن مع النص المكتوب أو الافتراضي
            let info = text ? text : '*𝑹𝒆𝒛𝒆*'
            
            return await conn.sendMessage(m.chat, {
                text: info,
                mentions: mentions,
                contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined
            }, { quoted: m });
        }

    } catch (err) {
        console.error("⚠️ خطأ في أمر المنشن:", err);
        let info = `❌ حدث خطأ، تأكد أن البوت لديه الصلاحيات الكافية.\nالسبب: ${err.message}`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
};

handler.help = ['منشن'];
handler.command = ['منشن', 'الكل', 'tagall'];
handler.tags = ['الـمـشـرفـيـن'];
handler.group = true; 

export default handler;
