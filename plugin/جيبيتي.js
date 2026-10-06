/*
░▒▓█ بوت ذكاء اصطناعي – Pollinations.ai █▓▒░
☆ مجاني، لا يحتاج مفتاح، يعمل للأبد
☆ نموذج GPT-4o-mini سريع ودقيق
☆ يحافظ على السياق لكل مستخدم
تطوير وتعديل: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 
*/

import fetch from 'node-fetch';

// تخزين تاريخ المحادثة لكل مستخدم
const userHistory = new Map();

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        let info = `🧠 *AI Assistant (GPT-4o-mini)*\n\nاستخدم الأمر متبوعاً بسؤالك:\n${usedPrefix}${command} ما هو الذكاء الاصطناعي؟\n\nلبدء محادثة جديدة: ${usedPrefix}${command} مسح`
        return await conn.sendMessage(m.chat, { 
            text: info,
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
        }, { quoted: m });
    }

    if (text.toLowerCase() === 'مسح') {
        userHistory.delete(m.sender);
        let info = '🗑️ تم مسح سياق المحادثة بنجاح.'
        return await conn.sendMessage(m.chat, { 
            text: info,
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
        }, { quoted: m });
    }

    await conn.sendPresenceUpdate('composing', m.chat);
    let history = userHistory.get(m.sender) || [];

    // بناء الرسائل مع السياق (آخر 10 رسائل)
    const messages = [
        { role: 'system', content: 'أنت مساعد ذكي ومفيد اسمك يوتا بوت. تحدث بالعربية بوضوح وأجب بدقة.' },
        ...history.slice(-10),
        { role: 'user', content: text }
    ];

    try {
        const response = await fetch('https://text.pollinations.ai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'openai',
                messages: messages,
                temperature: 0.7
            })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const reply = data.choices[0]?.message?.content;
        if (!reply) throw new Error('لا يوجد رد');

        // تحديث التاريخ
        history.push({ role: 'user', content: text });
        history.push({ role: 'assistant', content: reply });
        if (history.length > 20) history.shift();
        userHistory.set(m.sender, history);

        let info = `${reply}\n\n> *𝒚𝒖𝒕𝒂 𝒃𝒐𝒕*`
        return await conn.sendMessage(m.chat, { 
            text: info,
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
        }, { quoted: m });

    } catch (err) {
        console.error(err);
        let info = `❌ خطأ في الاتصال بالسيرفر: ${err.message}`
        return await conn.sendMessage(m.chat, { 
            text: info,
            contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined 
        }, { quoted: m });
    }
};

handler.help = ['جيبيتي', 'جي'];
handler.tags = ['الصـــنـ😳ـاعـي'];
handler.command = /^(ai|جي|جيبيتي)$/i;

export default handler;