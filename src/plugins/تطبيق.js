/**
 * تطبيق.js
 * تحويل هيكلة كود البحث عن التطبيقات وتحميلها مع الرد الموثق
 */

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const query = text?.trim();
    
    // التحقق من إدخال اسم التطبيق
    if (!query) {
        let info = `❐═━━━═╊⊰🍷⊱╉═━━━═❐\n` +
            `> ❗ *يرجى كتابة اسم التطبيق الذي تريد البحث عنه!*\n` +
            `> 🐼 مثال:\n` +
            `>   ❯  ${usedPrefix + command} Facebook\n` +
            `>   ❯  ${usedPrefix + command} WhatsApp\n` +
            `❐═━━━═╊⊰🍷⊱╉═━━━═❐`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    try {
        // إرسال رد فعل للبحث
        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } });

        const apiUrl = `https://api-streamline.vercel.app/dlapk?search=${encodeURIComponent(query)}`;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!data || !data.id) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            let info = '❌ لم يتم العثور على التطبيق 😔'
            return conn.reply(m.chat, info, fkontak, rcanal)
        }

        const { name, file, icon } = data;
        const size = file.size ? (file.size / 1024 / 1024).toFixed(2) + " MB" : "غير متوفر";
        const appUrl = file.path || file.path_alt;

        if (!appUrl) {
             await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
             let info = '⚠️ لا يتوفر رابط تحميل مباشر لهذا التطبيق حاليًا.'
             return conn.reply(m.chat, info, fkontak, rcanal)
        }

        // 1. إرسال معلومات التطبيق مع الصورة (إرسال مباشر لإظهار الصورة)
        const caption = `╭───〔📦 *نتائج البحث عن: ${query}* 〕───╮\n` +
                        `📱 *الاسم:* ${name}\n` +
                        `💾 *الحجم:* ${size}\n` +
                        `🔗 *رابط التحميل المباشر:* ${appUrl}\n` +
                        `╰────────────────────╯\n\n` +
                        `*⚠️ جاري إرسال ملف التطبيق (APK)... قد يستغرق الأمر بعض الوقت حسب حجمه.*`;

        await conn.sendMessage(m.chat, {
            image: { url: icon },
            caption: caption
        }, { quoted: m });


        // 2. إرسال ملف التطبيق مباشرةً
        await conn.sendMessage(m.chat, {
            document: { url: appUrl },
            mimetype: 'application/vnd.android.package-archive',
            fileName: `${name.replace(/\s/g, '_')}.apk`,
            caption: `✅ تم تحميل وإرسال ملف *${name}* بنجاح.\n\n> قسم التنزيلات • System`
        }, { quoted: m });

        // إرسال رد فعل بالنجاح
        await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } });

    } catch (err) {
        console.error("⚠️ خطأ أثناء البحث:", err);
        await conn.sendMessage(m.chat, { react: { text: '🚨', key: m.key } });
        let info = '🚨 حدث خطأ أثناء جلب التطبيق أو تحميله. حاول لاحقًا.'
        conn.reply(m.chat, info, fkontak, rcanal)
    }
};

handler.help = ['تطبيق'];
handler.command = ['تطبيق', 'apk', 'بحث_تطبيق'];
handler.tags = ['الـتـنزيـلات'];

export default handler;
