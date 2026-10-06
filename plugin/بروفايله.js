let handler = async (m, { conn }) => {
    try {
        // 🎯 تحديد الهدف (منشن > رد > نفسك)
        let target;
        if (m.mentionedJid && m.mentionedJid.length > 0) {
            target = m.mentionedJid[0];
        } else if (m.quoted) {
            target = m.quoted.sender;
        } else {
            target = m.sender;
        }

        let ppUrl;
        try {
            // محاولة جلب الصورة بجودة عالية
            ppUrl = await conn.profilePictureUrl(target, "image");
        } catch {
            ppUrl = null;
        }

        if (ppUrl) {
            await conn.sendMessage(m.chat, {
                image: { url: ppUrl },
                caption: `📸 تمت سرقة بروفايلك بنجاح...😂\n\n👤 الـمـنـشـن: @${target.split("@")[0]}\n\n> *قسم الأعضاء • System*`,
                mentions: [target]
            }, { quoted: fkontak });
        } else {
            let info = `⚠️ لا توجد صورة بروفايل متاحة للمستخدم @${target.split("@")[0]} أو أن إعدادات الخصوصية تمنع ذلك.`
            await conn.reply(m.chat, info, fkontak, rcanal)
        }
    } catch (e) {
        console.error("❌ خطأ في بلوجن البروفايل:", e);
        let info = "⚠️ حصل خطأ أثناء محاولة جلب صورة البروفايل."
        conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['بروفايل']
handler.tags = ['الـأعـضـاء']
handler.command = ["بروفايل", "pp", "بروفايله"]
handler.group = false // يشتغل في الخاص والجروب

export default handler
