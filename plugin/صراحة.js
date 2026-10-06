import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

const SARAHA_IMAGE = "https://files.tbox.moe/cuqc9o.jpg";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let chatId = m.chat
    let senderId = m.sender
    const tag = '@' + senderId.split('@')[0]

    // --- 1. معالجة الأوامر الفرعية (الأسئلة والانسحاب) ---
    if (text === 'سؤال_صراحة') {
        const truthList = [
            "🫣 هل كذبت على شخص قريب منك؟ وش كانت الكذبة؟",
            "😳 من أكثر شخص يزعجك في القروب؟",
            "❤️ هل تحب أحد في القروب؟ قول الصدق.",
            "😐 هل سبق وخنت صديقك؟",
            "😏 مين آخر شخص كذبت عليه؟",
            "👀 هل في أحد تكرهه بس تسولف معه؟",
            "🤔 وش الشيء اللي تندم عليه كثير؟",
            "📱 هل عندك محادثة تخاف تنكشف؟",
            "🙃 هل قلت شي سيء عن أحد من ورا ظهره؟",
            "💔 متى كانت آخر مرة بكيت فيها؟",
            "💰 هل سبق وسرقت شي؟",
            "🤥 كم مرة كذبت اليوم؟",
            "👥 مين أقرب شخص لك في القروب؟",
            "😰 وش أكبر غلطة في حياتك؟",
            "🎭 هل تتصنع شخصية غير شخصيتك الحقيقية؟",
            "📸 هل عندك صور تخاف تظهر للناس؟",
            "🗣️ هل سبق وشتمت أحد من أهلك؟",
            "💸 هل استلفت فلوس وما رددتها؟",
            "🤫 هل عندك سر ما قاله لأحد؟",
            "👨‍👩‍👧‍👦 هل تكذب على أهلك؟"
        ];

        const randomQuestion = truthList[Math.floor(Math.random() * truthList.length)];
        const media = await prepareWAMessageMedia({ image: { url: SARAHA_IMAGE } }, { upload: conn.waUploadToServer });

        const ption = `🎭 *سؤال الصراحة*\n\n${randomQuestion}\n\n🙋‍♂️ اللاعب: ${tag}\n\n📝 *يجب الإجابة بصراحة!*`;

        const msg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "⚡ كن شجاعاً وأجب بصدق!" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({ display_text: "🔄 سؤال آخر", id: `${usedPrefix + command} سؤال_صراحة` })
                                },
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({ display_text: "🚪 انسحاب", id: `${usedPrefix + command} انسحاب_صراحة` })
                                }
                            ]
                        })
                    })
                }
            }
        }, { quoted: m });

        return await conn.relayMessage(chatId, msg.message, { messageId: msg.key.id });
    }

    if (text === 'انسحاب_صراحة') {
        const defeatMessages = [
            `🏳️ ${tag} استسلم ولم يستطع الإجابة! 😅`,
            `🚫 ${tag} فضل الصمت على قول الحقيقة! 🤐`,
            `💔 ${tag} خسر التحدي ولم يتحلى بالشجاعة! 🥲`,
            `🎯 ${tag} قرر الانسحاب من تحدي الصراحة! 🏃‍♂️`
        ];
        const info = defeatMessages[Math.floor(Math.random() * defeatMessages.length)];
        return conn.reply(chatId, info, fkontak, rcanal, { mentions: [senderId] });
    }

    // --- 2. القائمة الرئيسية للعبة ---
    try {
        const media = await prepareWAMessageMedia({ image: { url: SARAHA_IMAGE } }, { upload: conn.waUploadToServer });

        const caption = `🎭 *لعبة الصراحة* اختبر شجاعتك في الإجابة على أسئلة محرجة! 😳  
اضغط على الزر لتحصل على سؤال صراحة عشوائي يجب الإجابة عليه بصدق!

📝 *قواعد اللعبة:*
🔹 يجب الإجابة بصراحة
🔹 لا يمكنك تجنب السؤال  
🔹 كن شجاعاً وواجه الحقيقة!

🎯 *اضغط الزر أدناه لبدء التحدي* 👇`;

        const mainMsg = generateWAMessageFromContent(chatId, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        header: proto.Message.InteractiveMessage.Header.create({ hasMediaAttachment: true, imageMessage: media.imageMessage }),
                        body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: "Truth Game" }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                            buttons: [
                                {
                                    name: "quick_reply",
                                    buttonParamsJson: JSON.stringify({ display_text: "🎭 احصل على سؤال", id: `${usedPrefix + command} سؤال_صراحة` })
                                }
                            ]
                        })
                    })
                }
            }
        }, { quoted: m });

        await conn.relayMessage(chatId, mainMsg.message, { messageId: mainMsg.key.id });

    } catch (err) {
        console.error(err);
        const info = '❌ حدث خطأ أثناء تشغيل اللعبة.';
        return conn.reply(chatId, info, fkontak, rcanal);
    }
}

handler.help = ['صراحة']
handler.tags = ['الـالـعـاب']
handler.command = /^(صراحة|صراحه|truth)$/i

export default handler
