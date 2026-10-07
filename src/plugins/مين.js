/**
 * who_is_more.js
 * أمر تفاعلي يختار أعضاء عشوائيين للإجابة على تساؤلات مضحكة
 * الصلاحية: الجميع (داخل المجموعات)
 * تطوير وتعديل: 𝑹𝒆𝒛𝒆
 */

let handler = async (m, { conn, participants }) => {
    // مصفوفة الأسئلة
    const questions = [
        "😂 مين أكثر شخص يضحك على أي شيء؟",
        "😈 مين أكثر شخص دايم يطقطق على الناس؟",
        "🕒 مين أكثر شخص دايم يتأخر؟",
        "📱 مين أكثر واحد دايم ماسك الجوال؟",
        "💤 مين أكثر شخص ينام بدري؟",
        "💬 مين أكثر واحد يحب يفضفض؟",
        "🎉 مين أكثر شخص يحب الفلة والوناسة؟",
        "📚 مين أكثر شخص يحب الدراسة؟ (مستحيل 🤣)",
        "🧠 مين أكثر شخص ذكي في الجروب؟",
        "🫣 مين أكثر شخص يخاف بسرعة؟",
        "🤣 مين أكثر واحد ضحكته معدية؟",
        "🍔 مين أكثر واحد دايم ياكل؟",
        "🤡 مين أكثر واحد يحب يسوي مقالب؟",
        "🗣️ مين أكثر شخص يتكلم كثير؟",
        "😴 مين أكثر شخص دايم ينام في المكالمات؟",
        "😎 مين أكثر شخص واثق من نفسه؟",
        "📸 مين أكثر واحد يحب يصور سنابات؟",
        "🥷 مين أكثر واحد غامض؟",
        "❤️ مين أكثر واحد محبوب؟",
        "😅 مين أكثر واحد يسحب على الناس؟"
    ];

    // اختيار سؤال عشوائي
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    // اختيار عضو عشوائي
    const randomMember = participants[Math.floor(Math.random() * participants.length)].id;

    let info = `👀 *${randomQuestion}*\n\nأنا أقول إنه: @${randomMember.split('@')[0]} 🌚😂`;

    // إرسال الرسالة مع المنشن ومظهر القناة مباشرة دون رسالة إضافية
    return await conn.sendMessage(m.chat, { 
        text: info, 
        mentions: [randomMember],
        contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined
    }, { quoted: m });
};

handler.help = ['مين'];
handler.tags = ['الـالـعـاب'];
handler.command = ['مين']; 
handler.group = true; 

export default handler;
