/**
 * play.js
 * تحميل وتشغيل الأغاني من يوتيوب
 */

import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const query = text ? text.trim() : '';

    if (!query) {
      let info = `╭───≪ 🍒 𝑷𝑳𝑨𝒀 🍇 ≫───╮\n` +
                 `│ ⌬ هلا، نسيت تكتب اسم الأغنية!\n` +
                 `│ ⌬ عطيني الاسم أو رابط يوتيوب.\n` +
                 `│ ⌬ مثال: ${usedPrefix + command} Dracula\n` +
                 `╰───≪ 🌿🍉🍡 ≫───╯\n\n` +
                 `> ابحث واستمتع`
      return conn.reply(m.chat, info, fkontak, rcanal)
    }

    await conn.sendMessage(m.chat, { react: { text: '⌛', key: m.key } });

    if (query.length > 100) {
      let info = `*_ ❌ الطلب طويل جداً! الحد الأقصى 100 حرف. _*`
      return conn.reply(m.chat, info, fkontak, rcanal)
    }

    const response = await fetch(`https://api.nexray.web.id/downloader/ytplay?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (!data.status || !data.result?.download_url) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
      let info = `*_ ❌ لم أجد نتائج لـ: "${query}" _*`
      return conn.reply(m.chat, info, fkontak, rcanal)
    }

    const result     = data.result;
    const audioUrl   = result.download_url;
    const filename   = result.title    || 'Unknown Song';
    const thumbnail  = result.thumbnail || '';
    const duration   = result.duration  || '';
    const views      = result.views     || '';
    const channel    = result.channel   || '';

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    // 1. إرسال الملف كصوت (وسائط) دون تغيير
    await conn.sendMessage(m.chat, {
      audio: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${filename}.mp3`,
      contextInfo: thumbnail ? {
        externalAdReply: {
          title: filename,
          body: `المدة: ${duration} • المشاهدات: ${views}`,
          thumbnailUrl: thumbnail,
          sourceUrl: result.url || '',
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: true,
        },
      } : undefined,
    }, { quoted: m });

    // 2. تجهيز النص المنسق
    let info = `╭───≪ 🍒 𝒀𝑻 𝑴𝑼𝑺𝑰𝑪 🍇≫───╮\n` +
               `│ ⌬ اسـم الأغـنـيـة: ${filename}\n` +
               `│ ⌬ الـمـمدة: ${duration}\n` +
               `│ ⌬ الـمـشاهـدات: ${views}\n` +
               `│ ⌬ الـقـنـاة: ${channel}\n` +
               `╯───≪ 🌿🍉🍡 ≫───╰\n\n` +
               `> جاري التشغيل`

    // 3. إرسال المستند مدمجاً معه الكابشن وسياق القناة (rcanal) وحساب الاتصال (fkontak)
    return await conn.sendMessage(m.chat, {
      document: { url: audioUrl },
      mimetype: 'audio/mpeg',
      fileName: `${filename.replace(/[<>:"/\\|?*]/g, '_')}.mp3`,
      caption: info,
      contextInfo: rcanal?.contextInfo || undefined
    }, { quoted: fkontak || m });

  } catch (error) {
    console.error('Play error:', error);
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
    let info = `*_ ❌ وقع خطأ أثناء المعالجة: ${error.message} _*`
    return conn.reply(m.chat, info, fkontak, rcanal)
  }
};

handler.help = ['اغنية'];
handler.tags = ['الـتـنزيـلات'];
handler.command = /^(اغنيه|اغنية|play|شغل)$/i;

export default handler;
