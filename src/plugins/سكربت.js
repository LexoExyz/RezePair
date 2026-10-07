/**
 * get_script.js
 * الحصول على سكربت البوت ورابط المستودع
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';

const { generateWAMessageFromContent, proto } = (await import("@whiskeysockets/baileys")).default;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let handler = async (m, { conn, usedPrefix, command }) => {
    // 1. استيراد الصور من ملف الداتا الخاص بك
    let imageUrls = [];
    const jsonPath = './src/data-photo.json'; 
    try {
        if (fs.existsSync(jsonPath)) {
            const rawData = fs.readFileSync(jsonPath, 'utf-8');
            imageUrls = JSON.parse(rawData);
        }
    } catch (e) {
        imageUrls = ['https://files.catbox.moe/w8ycz1.jpg'];
    }

    let randomImageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)];
    const taguser = '@' + m.sender.split('@')[0];

    // نص الرسالة المزخرف
    const startText = `
╗═══≪ 🌿🍉🍡 ≫═══╔
 .𓏲⋆˙𝑩𝑶𝑻🎀
╝═══≪ 🌿🍉🍡 ≫═══╚

╮──────────────╭
𓆩⃞🍒𓆪  أهلاً بك ${taguser}
𓆩⃞🍇𓆪  في نظام جلب السكربت
𓆩⃞🍉𓆪  .𓏲⋆˙𝑩𝑶𝑻🎀
𓆩⃞🍡𓆪  بوت واتساب مجاني 
𓆩⃞🌿𓆪  يعمل 24/7
╯──────────────╰

╭───≪ 🍒 𝗧𝗢𝗢𝗟𝗦 🍇 ≫───╮
│ اختر من الأسفل الإجراء المطلوب
│ جلب السكربت أو زيارة المستودع
╯───≪ 🌿🍉🍡 ≫───╰`.trim();

    // إعداد الأزرار التفاعلية
    const interactiveMessage = {
        body: { text: startText },
        footer: { text: 'Bot System' },
        header: {
            title: '```⚙️ إعدادات السكربت```',
            hasMediaAttachment: true,
            imageMessage: { url: randomImageUrl }
        },
        nativeFlowMessage: {
            buttons: [
                {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "📤 إرسال السكربت (ZIP)",
                        id: `${usedPrefix}send_script_now`
                    })
                },
                {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🌐 رابط المستودع (GitHub)",
                        url: "https://github.com/LexoEyz/YutaWaBot",
                        merchant_url: "https://github.com/LexoEyz/YutaWaBot"
                    })
                }
            ]
        }
    };

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                interactiveMessage: interactiveMessage
            }
        }
    }, { userJid: conn.user.jid, quoted: m });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    // الرد الموثق الخاص بك
    return conn.reply(m.chat, startText, fkontak, rcanal);
};

// الجزء المسؤول عن إرسال ملف ZIP (يتم استدعاؤه عند الضغط على الزر)
handler.all = async function (m) {
    if (!m.text || !m.text.includes('send_script_now')) return;
    
    const conn = this;
    const zipFilePath = path.join(__dirname, '../bot_script.zip');
    const botFolderPath = path.join(__dirname, '../');

    await conn.sendMessage(m.chat, { text: `🔄 جاري ضغط ملفات البوت... يرجى الانتظار.` }, { quoted: m });

    // أمر الضغط مع استثناء المجلدات الثقيلة
    const zipCommand = `zip -rq "${zipFilePath}" . -x ".npm/*" "node_modules/*" "Sessions/*" ".git/*"`;
    
    exec(zipCommand, { cwd: botFolderPath }, async (error) => {
        if (error) {
            return conn.reply(m.chat, `❌ فشل الضغط: ${error.message}`, fkontak, rcanal);
        }

        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(zipFilePath),
            mimetype: 'application/zip',
            fileName: 'bot_script.zip',
            caption: '✅ تم جلب السكربت بنجاح.'
        }, { quoted: m });

        if (fs.existsSync(zipFilePath)) fs.unlinkSync(zipFilePath);
    });
};

handler.help = ['سكربت'];
handler.tags = ['الـمـطـور'];
handler.command = /^(سكربت|سكربتي|script)$/i;
handler.owner = true; 

export default handler;
