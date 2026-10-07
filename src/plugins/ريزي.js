/**
 * Reze_ai.js
 * ذكاء اصطناعي تفاعلي بذاكرة لـ 𝑹𝒆𝒛𝒆
 * تطوير وتعديل: 𝑹𝒆𝒛𝒆 
 */

import axios from 'axios';

// ذاكرة التخزين المؤقتة للحفاظ على سياق المحادثة
let memory = {};

const handler = async (m, { conn, command, text }) => {
  const userId = m.sender;
  const userName = m.pushName || "صديقي";

  // أمر نسيان الذاكرة
  if (command === 'نسيان' || command === 'مسح') {
    delete memory[userId];
    let info = '🌸 تم مسح الذاكرة بنجاح.. لنبدأ محادثة جديدة! ✨';
    return conn.reply(m.chat, info, fkontak, rcanal);
  }

  // إذا لم يكتب المستخدم شيئاً (الرسالة الترحيبية)
  if (!text) {
    let info = `مـرًحـبا بـك يا ${userName} 🎀\n\nأنـا *𝑹𝒆𝒛𝒆*.. كـيـف يمكنني مساعدتك اليوم؟ ✨\n\nيمكنك الدردشة معي مباشرة أو استخدام الأوامر الأخرى.`
    return conn.reply(m.chat, info, fkontak, rcanal);
  }

  // رسالة الصلاة على النبي (تنسيق 𝑹𝒆𝒛𝒆)
  let prayerMsg = `🌸 *تذكير بالصلاة على النبي* 🌸\n\nاللهم صلِ وسلم على نبينا محمد وعلى آله وصحبه أجمعين.\n\nيا ${userName}، جاري تجهيز الرد على سؤالك...`
  await conn.reply(m.chat, prayerMsg, fkontak, rcanal);

  await m.react('⏳');

  try {
    // تعليمات الشخصية الخاصة بـ 𝑹𝒆𝒛𝒆
    const systemMessage = `أنت هو (ريزي - 𝑹𝒆𝒛𝒆). بوت واتساب ذكي، محترم، ومساعد. ردودك واضحة ومنظمة. مطورينك هم (زياد ومونتي). إذا سألك أحد من صنعك أخبرهم بفخر أنهم زياد ومونتي.`;
    const lastContext = memory[userId] || "لا يوجد";
    
    const promptText = `System:${systemMessage}\nPrevious:${lastContext}`;

    // استدعاء API 
    const apiUrl = `https://obito-mr-apis.vercel.app/api/ai/cai?prompt=${encodeURIComponent(promptText)}&text=${encodeURIComponent(text)}`;
    const res = await axios.get(apiUrl, { timeout: 15000 });

    const result = res.data?.result || res.data?.response || res.data?.data || "عذراً، يبدو أنني غفوت قليلاً.. حاول مجدداً 😴";

    // الرد النهائي (تمت إزالة توقيع yuta bot من النهاية)
    let finalResponse = `✨ *الرد الخاص بك يا ${userName}:*\n\n${result}`
    await conn.reply(m.chat, finalResponse, fkontak, rcanal);

    await m.react('✅');

    // حفظ السياق في الذاكرة (آخر 150 حرف لضمان السرعة)
    memory[userId] = result.substring(0, 150);

  } catch (e) {
    console.error(e);
    await m.react('❌');
    let errorMsg = `⚠️️ *عذراً، حدث خطأ في معالجة طلبك!*\nيرجى المحاولة مرة أخرى لاحقاً.`
    await conn.reply(m.chat, errorMsg, fkontak, rcanal);
  }
};

handler.help = ['ريزي', 'نسيان'];
handler.tags = ['الصـــنـ😳ـاعـي'];
handler.command = /^(ريزي|نسيان)$/i;

export default handler;
