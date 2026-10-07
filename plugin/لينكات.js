// تطوير وتعديل: 𝑹𝒆𝒛𝒆 
import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto } = baileys

const urlRegex = /(https?:\/\/[^\s]+)/gi;
const allowedDomains = [
    "youtube.com", "youtu.be", "tiktok.com", 
    "instagram.com", "facebook.com", "twitter.com", "x.com"
];

// --- وظيفة المراقبة (Before) ---
export async function before(m, { conn, isAdmin, isBotAdmin, isROwner }) {
    if (!m.isGroup || !m.text || m.fromMe || isAdmin || isROwner) return true;

    const chat = global.db.data.chats[m.chat];
    const user = global.db.data.users[m.sender];
    
    // التحقق من تفعيل النظام
    if (!chat || !chat.linkguard) return true;

    const links = m.text.match(urlRegex);
    if (!links) return true;

    for (const link of links) {
        const isAllowed = allowedDomains.some(domain => link.toLowerCase().includes(domain));
        
        if (!isAllowed) {
            if (!isBotAdmin) return true; 

            // 1. حذف الرسالة
            await conn.sendMessage(m.chat, { delete: m.key });

            // 2. تحديث التحذيرات
            if (!user.warns) user.warns = 0;
            user.warns += 1;

            const warnCount = user.warns;
            const userTag = m.sender.split('@')[0];

            if (warnCount < 3) {
                let info = `⚠️ ممنوع إرسال الروابط!\nتحذير (${warnCount}/3) لـ @${userTag}`
                await conn.sendMessage(m.chat, { 
                    text: info, 
                    mentions: [m.sender],
                    contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
                }, { quoted: m });
            } else {
                // 3. الطرد عند التحذير الثالث
                let info = `🚫 تم طرد @${userTag} لتجاوزه 3 تحذيرات.`
                await conn.sendMessage(m.chat, { 
                    text: info, 
                    mentions: [m.sender],
                    contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
                }, { quoted: m });
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
                user.warns = 0;
            }
            return false; 
        }
    }
    return true;
}

// --- وظيفة التحكم (Handler) ---
let handler = async (m, { conn, usedPrefix, command, text, isAdmin, isOwner }) => {
    const chat = global.db.data.chats[m.chat];
    
    if (!(isAdmin || isOwner)) {
        let info = '⚠️ هذا الأمر للمشرفين فقط.'
        return conn.sendMessage(m.chat, { 
            text: info, 
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
        }, { quoted: m });
    }

    // معالجة الأزرار التفاعلية إذا تم النقر عليها
    if (text === 'تشغيل' || text === 'ايقاف') {
        chat.linkguard = (text === 'تشغيل');
        let statusMsg = chat.linkguard ? '✅ تم تفعيل حماية الروابط (Link Guard).' : '✅ تم إيقاف حماية الروابط.';
        return conn.sendMessage(m.chat, { 
            text: statusMsg, 
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
        }, { quoted: m });
    }

    if (text === 'on') {
        chat.linkguard = true;
        let info = '✅ تم تفعيل حماية الروابط (Link Guard).'
        return conn.sendMessage(m.chat, { 
            text: info, 
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
        }, { quoted: m });
    }

    if (text === 'off') {
        chat.linkguard = false;
        let info = '✅ تم إيقاف حماية الروابط.'
        return conn.sendMessage(m.chat, { 
            text: info, 
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
        }, { quoted: m });
    }

    // إرسال رسالة تفاعلية مع أزرار التشغيل والإيقاف
    let status = chat.linkguard ? 'مفعّل ✅' : 'معطّل ❌';
    let bodyText = `🛡️ *نظام حارس الروابط*\n\nالحالة الحالية: *${status}*\n\nيرجى الاختيار من الأزرار أدناه للتحكم بنظام الحماية:`;

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                    body: proto.Message.InteractiveMessage.Body.create({ 
                        text: bodyText 
                    }),
                    footer: proto.Message.InteractiveMessage.Footer.create({ text: "𝑹𝒆𝒛𝒆" }),
                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                        buttons: [
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "🟢 تفعيل",
                                    id: `${usedPrefix + command} تشغيل`
                                })
                            },
                            {
                                name: "quick_reply",
                                buttonParamsJson: JSON.stringify({
                                    display_text: "🔴 إيقاف",
                                    id: `${usedPrefix + command} ايقاف`
                                })
                            }
                        ]
                    })
                })
            }
        }
    }, { quoted: m });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}

handler.help = ['linkguard']
handler.tags = ['group']
handler.command = ['linkguard', 'الحارس']
handler.group = true

export default handler
