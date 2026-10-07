/**
 * who_loves_me.js
 * أمر ترفيهي يكشف عن شخص عشوائي يحب المستخدم في المجموعة
 * تطوير وتعديل: 𝑹𝒆𝒛𝒆 
 */

let handler = async (m, { conn, participants }) => {
    // التحقق من أن الأمر داخل مجموعة لضمان وجود أعضاء
    if (!m.isGroup) {
        let info = '❗ هذا الأمر مخصص للمجموعات فقط.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // تصفية القائمة لاستبعاد المستخدم نفسه واستبعاد البوت من الاختيار
    const members = participants.filter(p => p.id !== m.sender && p.id !== conn.user.jid);
    
    if (members.length === 0) {
        let info = '😢 يبدو أنك وحيد هنا، لا يوجد أحد ليحبك!'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    // اختيار شخص عشوائي من القائمة
    const randomMember = members[Math.floor(Math.random() * members.length)].id;

    const messages = [
        `💘 اللي بيحبك سرًا هو: @${randomMember.split('@')[0]}`,
        `👀 شفتك يا @${randomMember.split('@')[0]} وأنت بتفكر في صاحبنا!`,
        `💖 القدر بيقول إن @${randomMember.split('@')[0]} معجب بيك جداً!`,
        `🌹 مبروك! @${randomMember.split('@')[0]} هو نصيبك في هاد الجروب.`
    ];

    let info = messages[Math.floor(Math.random() * messages.length)];

    await conn.sendMessage(m.chat, {
        text: info,
        mentions: [randomMember]
    }, { quoted: m });

    // إضافة سطر الرد الموثق كما طلبت
    return conn.reply(m.chat, info, fkontak, rcanal)
};

handler.help = ['يحبني'];
handler.tags = ['الـالـعـاب'];
handler.command = ['يحبني', 'معجب', 'loves'];
handler.group = true; 

export default handler;
