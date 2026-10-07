// تطوير وتعديل: 𝑹𝒆𝒛𝒆 
import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto } = baileys

/**
 * embarrassing_chain.js
 * نظام الأسئلة المحرجة المتسلسلة (5 أسئلة في الجولة)
 */

let handler = async (m, { conn, usedPrefix, command, text }) => {
    conn.embarrassing = conn.embarrassing || {}
    let id = m.chat + m.sender // جلسة خاصة لكل مستخدم في الروم

    // إذا كانت هذه إجابة على سؤال سابق
    if (text === 'نعم' || text === 'لا') {
        if (!conn.embarrassing[id]) return // إذا لم تكن هناك جلسة نشطة يتجاهل
        
        conn.embarrassing[id].count++
        
        if (conn.embarrassing[id].count >= 5) {
            delete conn.embarrassing[id]
            let info = '🏁 انتهت جولة الـ 5 أسئلة! شجاعتك كافية لهذا اليوم. 😂'
            return conn.reply(m.chat, info, fkontak, rcanal)
        }
    } else {
        // بدء جلسة جديدة
        conn.embarrassing[id] = { count: 0 }
    }

    const questions = [
        "🫣 هل سبق وأن كذبت على شخص تحبه؟",
        "💬 هل في شخص داخل القروب يعجبك؟",
        "👀 هل سبق وفشلت في اختبار مهم؟",
        "💔 هل ما زلت تشتاق لشخص تركك؟",
        "🎭 هل سبق وتكلمت عن شخص من وراه؟",
        "🫢 هل سبق وفتحت جوال شخص بدون علمه؟",
        "🤥 هل سبق وسرقت شيء بسيط من السوبر ماركت؟",
        "🤡 هل سبق وسويت مقلب في شخص وبكى؟",
        "😬 هل سبق وسويت منشن لشخص بالغلط وأنت تراقبه؟",
        "🤐 هل عندك سر لو انكشف بتنفضح فضيحة كبيرة؟",
        "😏 هل سبق وحظرت شخص عشان يقلق عليك؟",
        "📸 هل سبق ونشرت صورة لشخص وأنت تدري إن شكله فيها غلط؟",
        "😅 هل سبق وتظاهرت بالمرض عشان ما تروح مشوار؟",
        "🤤 هل سبق وأكلت من صحن غيرك بدون ما يدري؟"
    ];

    const question = questions[Math.floor(Math.random() * questions.length)];
    const currentCount = conn.embarrassing[id].count + 1;

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: proto.Message.InteractiveMessage.Body.create({ 
                        text: `📢 *السؤال [${currentCount}/5]:*\n\n*${question}*` 
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: "𝑹𝒆𝒛𝒆" }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "✅ نعم",
                                    id: `${usedPrefix + command} نعم`
                                })
                            },
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "❌ لا",
                                    id: `${usedPrefix + command} لا`
                                })
                            }
                        ]
                    })
                })
            }
        }
    }, { quoted: m });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
};

handler.help = ['محرج'];
handler.tags = ['الـالـعـاب'];
handler.command = /^(محرج|اسألني)$/i;

export default handler;
