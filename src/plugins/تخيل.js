/**
 * imagine.js
 * إنشاء صور بالذكاء الاصطناعي (Nano Banana Pro)
 */

import fetch from 'node-fetch';

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        let info = `🎨 *أمر إنشاء الصور الذكي*\n\nالاستخدام:\n${usedPrefix + command} وصف الصورة\n\nمثال:\n${usedPrefix + command} رائد فضاء في غابة انمي`
        return conn.reply(m.chat, info, fkontak, rcanal);
    }

    await m.react('🖌️');
    let waitMsg = `*🖌️ جاري إنشاء صورتك... قد تستغرق العملية لحظات.*`
    await conn.reply(m.chat, waitMsg, fkontak, rcanal);

    const prompt = encodeURIComponent(text);

    try {
        const apiUrl = `https://omegatech-api.dixonomega.tech/api/ai/nano-banana-pro?prompt=${prompt}`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.success || !data.image) {
            throw new Error('فشل في معالجة الطلب من السيرفر');
        }

        let captionText = `✅ *تم إنشاء الصورة بنجاح!*\n📝 *الوصف:* ${text}\n\n> *قسم الذكاء الاصطناعي • System*`

        // إرسال الصورة مباشرة مع الكابشن ومظهر القناة دون رسالة إضافية
        await conn.sendMessage(m.chat, {
            image: { url: data.image },
            caption: captionText,
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined
        }, { quoted: m });

        return await m.react('✅');

    } catch (err) {
        console.error(err);
        await m.react('❌');
        let info = `❌ *فشل إنشاء الصورة:*\n${err.message}`
        return conn.reply(m.chat, info, fkontak, rcanal);
    }
};

handler.help = ['تخيل'];
handler.tags = ['الصـــنـ😳ـاعـي'];
handler.command = /^(تخيل|imagine|ai-img)$/i;

export default handler;
