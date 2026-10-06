/**
 * nanobana_ai.js
 * نظام تعديل وتوليد الصور (Nano Banana) لـ 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕
 * تطوير وتعديل: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 
 */

import axios from 'axios';
import FormData from 'form-data';

global.bananaSession = global.bananaSession || {};

async function uploadMedia(m) {
    try {
        const q = m.quoted ? m.quoted : m;
        if (!/image|sticker/.test(q.mimetype || q.msg?.mimetype)) return null;

        const media = await q.download();
        const form = new FormData();
        form.append('file', media, { filename: 'image.jpg' });
        form.append('type', 'permanent');

        const res = await axios.post(
            'https://tmp.malvryx.dev/upload',
            form,
            { headers: form.getHeaders() }
        );

        return res.data?.cdnUrl || res.data?.directUrl || null;
    } catch (e) {
        return null;
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const userId = m.sender;
    const isNanoPro = /نانو-بنانا|نانوبنانا/i.test(command);
    const prompt = text || m.quoted?.text || m.msg?.caption || "";

    // --- النظام الأول: وضع تجميع الصور (نانو-بنانا / نانوبنانا) ---
    if (isNanoPro) {
        if (!global.bananaSession[userId]) global.bananaSession[userId] = { images: [] };

        if (text?.toLowerCase().startsWith('تم')) {
            const session = global.bananaSession[userId];
            const finalPrompt = text.replace(/تم/i, '').trim();

            if (session.images.length < 2) {
                let info = "⚠️ *نـانو بنـانا بـرو*\n\nيرجى إضافة صورتين أو ملصقين على الأقل للدمج.";
                return conn.reply(m.chat, info, fkontak, rcanal);
            }
            if (!finalPrompt) {
                let info = `⚠️ *نقص في البيانات*\n\nيرجى كتابة الوصف بعد كلمة تم.\nمثال: *${usedPrefix + command} تم ادمجهم بأسلوب أنمي*`;
                return conn.reply(m.chat, info, fkontak, rcanal);
            }

            await m.react('⏳');
            try {
                let apiUrl = `https://omegatech-api.dixonomega.tech/api/ai/nanobana-pro-v3?prompt=${encodeURIComponent(finalPrompt)}`;
                session.images.forEach((url, i) => { 
                    apiUrl += `&image${i + 1}=${encodeURIComponent(url)}`; 
                });

                const { data: initRes } = await axios.get(apiUrl);
                if (!initRes.success) throw new Error('فشل بدء المهمة.');

                let resultUrl = null;
                let attempts = 0;
                while (!resultUrl && attempts < 25) {
                    await new Promise(r => setTimeout(r, 5000));
                    const { data: check } = await axios.get(`https://omegatech-api.dixonomega.tech/api/ai/nano-banana2-result?task_id=${initRes.task_id}`);
                    if (check.status === 'completed' && check.image_url) {
                        resultUrl = check.image_url;
                        break;
                    }
                    attempts++;
                }

                if (!resultUrl) throw new Error('انتهى وقت الانتظار.');

                await conn.sendMessage(m.chat, { 
                    image: { url: resultUrl }, 
                    caption: `✅ *تم الدمج والتركيب بنجاح*\n\n📝 *الطلب:* ${finalPrompt}\n\n> *𝒚𝒖𝒕𝒂 𝒃𝒐𝒕*` 
                }, { quoted: m });

                await m.react('✅');
                delete global.bananaSession[userId];
            } catch (e) {
                await m.react('❌');
                conn.reply(m.chat, `❌ *حدث خطأ:* ${e.message}`, fkontak, rcanal);
                delete global.bananaSession[userId];
            }
            return;
        }

        const link = await uploadMedia(m);
        if (!link) {
            let info = `📸 *وضع تجميع الصور*\n\nقم بالرد على *صورة* أو *ملصق* بـ *${usedPrefix + command}* لتجميعها.\nأرسل *${usedPrefix + command} تم <الوصف>* عند الانتهاء من التجميع.`;
            return conn.reply(m.chat, info, fkontak, rcanal);
        }
        
        if (global.bananaSession[userId].images.length >= 4) {
            return conn.reply(m.chat, "❌ وصلت للحد الأقصى (4 صور فقط).", fkontak, rcanal);
        }
        
        global.bananaSession[userId].images.push(link);
        await m.react('📥');
        return conn.reply(m.chat, `✅ تم إضافة العنصر ${global.bananaSession[userId].images.length}/4`, fkontak, rcanal);
    }

    // --- النظام الثاني: وضع التعديل المفرد والتوليد (نانو) ---
    if (command === 'نانو') {
        const imageUrl = await uploadMedia(m);
        
        if (imageUrl) {
            if (!prompt) {
                let info = `⚠️ *مطلوب وصف التعديل*\n\nقم بالرد على الصورة بـ: \`${usedPrefix}نانو اجعلها خلفية سينمائية\``;
                return conn.reply(m.chat, info, fkontak, rcanal);
            }
            
            await m.react('🎨');
            try {
                const { data: init } = await axios.get(`https://omegatech-api.dixonomega.tech/api/ai/nano-banana2?prompt=${encodeURIComponent(prompt)}&image=${encodeURIComponent(imageUrl)}`);
                let resultUrl = null;
                for (let i = 0; i < 20; i++) {
                    await new Promise(r => setTimeout(r, 5000));
                    const { data: check } = await axios.get(`https://omegatech-api.dixonomega.tech/api/ai/nano-banana2-result?task_id=${init.task_id}`);
                    if (check.status === 'completed') { resultUrl = check.image_url; break; }
                }
                if (resultUrl) {
                    await conn.sendMessage(m.chat, { 
                        image: { url: resultUrl }, 
                        caption: `✨ *تم معالجة الصورة بنجاح*\n\n> *𝒚𝒖𝒕𝒂 𝒃𝒐𝒕*` 
                    }, { quoted: m });
                    await m.react('✅');
                }
            } catch (e) {
                await m.react('❌');
                conn.reply(m.chat, "❌ فشلت عملية تعديل الصورة.", fkontak, rcanal);
            }
        } else {
            // توليد صورة من الصفر (Text to Image)
            if (!prompt) {
                let info = `⚠️ *طريقة الاستخدام:*\n\nأرسل: *${usedPrefix}نانو* <وصف الصورة>\nأو رد على صورة بالأمر لتعديلها.`;
                return conn.reply(m.chat, info, fkontak, rcanal);
            }
            await m.react('⏳');
            try {
                const { data } = await axios.get(`https://omegatech-api.dixonomega.tech/api/ai/nano-banana-pro?prompt=${encodeURIComponent(prompt)}`);
                if (data.image) {
                    await conn.sendMessage(m.chat, { 
                        image: { url: data.image }, 
                        caption: `🎨 *رسم ذكاء اصطناعي (Nano Pro)*\n\n> *𝒚𝒖𝒕𝒂 𝒃𝒐𝒕*` 
                    }, { quoted: m });
                    await m.react('✅');
                }
            } catch (e) {
                await m.react('❌');
                conn.reply(m.chat, "❌ فشل توليد الصورة.", fkontak, rcanal);
            }
        }
    }
};

handler.help = ['نانو', 'جيميني'];
handler.tags = ['الصـــنـ😳ـاعـي'];
handler.command = /^(نانو|نانو-بنانا|نانوبنانا)$/i;

export default handler;
