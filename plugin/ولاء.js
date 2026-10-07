/**
 * loyalty_test.js
 * أمر ترفيهي لقياس نسبة ولاء عضو معين (عشوائي)
 * تطوير وتعديل: 𝑹𝒆𝒛𝒆 
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // جلب الشخص الممنشن من الرسالة
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;

    if (!who) {
        let info = `❌ يرجى عمل منشن لشخص ما لقياس درجة ولائه.\n\n> مثال: *${usedPrefix + command} @شخص*`
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    const loyalty = Math.floor(Math.random() * 101);
    const userId = who.split('@')[0];

    let comment = '';
    if (loyalty >= 90) comment = 'عبد وفيّ من الدرجة الأولى 👑';
    else if (loyalty >= 70) comment = 'ولاءه عالي بس ساعات بيزوغ 😒';
    else if (loyalty >= 40) comment = 'لسانه مع سيده، بس قلبه مشغول 😬';
    else if (loyalty >= 10) comment = 'بياكل مع الأعداء وبيضحك للسيد 👀';
    else comment = 'خان سيده عشان كسرة عيش 🥖💔';

    let info = `🧎‍♂️ *تحليل ولاء*: @${userId}\n\n📊 نسبة الولاء: *${loyalty}%*\n🗣️ ${comment}`;

    await conn.sendMessage(m.chat, {
        text: info,
        mentions: [who]
    }, { quoted: m });

    // إضافة سطر الرد الموثق كما طلبت
    return conn.reply(m.chat, info, fkontak, rcanal)
};

handler.help = ['ولاء @منشن'];
handler.tags = ['الـالـعـاب'];
handler.command = ['ولاء', 'الولاء'];
handler.group = true; 

export default handler;
