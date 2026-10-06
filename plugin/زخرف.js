/**
 * fancyText.js
 * * بلوقن: سوي (نسخة البطاقات المتحركة Carousel مع أزرار النسخ التلقائي)
 */

import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys

const handler = async (m, { conn, text }) => {
  if (!text) {
    let info = "✨ يرجى كتابة النص المراد زخرفته.\n📌 مثال: `.زخرف نص`"
    return conn.reply(m.chat, info, fkontak, rcanal)
  }

  const styles = [
    { name: 'النمط الأول (كلاسيك رفيع)', map: { 'a': '𝒶','b': '𝒷','c': '𝒸','d': '𝒹','e': '𝑒','f': '𝒻','g': '𝒼','h': '𝒽','i': '𝒾','j': '𝒿','k': '𝓀','l': '𝓁','m': '𝓂','n': '𝓃','o': '𝑜','p': '𝓅','q': '𝓆','r': '𝓇','s': '𝓈','t': '𝓉','u': '𝓊','v': '𝓋','w': '𝓌','x': '𝒿','y': '𝓎','z': '𝒿' } },
    { name: 'النمط الثاني (مودرن)', map: { 'a': '𝘢','b': '𝘣','c': '𝘤','d': '𝘥','e': '𝘦','f': '𝘧','g': '𝘨','h': '𝘩','i': '𝘪','j': '𝘫','k': '🇰','l': '𝘭','m': '𝘮','n': '𝘯','o': '𝘰','p': '𝘱','q': '𝘲','r': 'ر','s': '𝘴','t': '𝘵','u': '🇺','v': '𝘷','w': '𝘸','x': '𝘹','y': 'ي','z': '𝘻' } },
    { name: 'النمط الثالث (عريض بارز)', map: { 'a': '𝘼','b': '𝘽','c': '𝘾','d': '𝘿','e': '𝙀','f': '𝙁','g': '𝙂','h': '𝙃','i': '𝙄','j': '𝙅','k': '𝙆','l': '𝙇','m': '𝙈','n': '𝙉','o': '𝙊','p': '𝙋','q': '𝙌','r': '𝙍','s': '𝙎','t': '𝙏','u': '𝙐','v': '𝙑','w': '𝙒','x': '𝙓','y': '𝙔','z': '𝙕' } },
    { name: 'النمط الرابع (ناعم مائل)', map: { 'a': '𝒂','b': '𝒃','c': '𝒄','d': '𝒅','e': '𝒆','f': '𝒇','g': '𝒈','h': '𝒉','i': '𝒊','j': '𝒋','k': '𝒌','l': '𝒍','m': '𝒎','n': '𝒏','o': '𝒐','p': '𝒑','q': '𝒒','r': '𝒓','s': '𝒔','t': '𝒕','u': '𝒖','v': '𝒗','w': '𝒘','x': '𝒙','y': '𝒚','z': '𝒛' } },
    { name: 'النمط الخامس (غامق ملكي)', map: { 'a': '𝐀','b': '𝐁','c': '𝐂','d': '𝐃','e': '𝐄','f': '𝐅','g': '𝐆','h': '𝐇','i': '𝐈','j': '','k': '𝐊','l': '𝐋','m': '𝐌','n': '𝐍','o': '𝐎','p': '𝐏','q': '𝐐','r': '𝐑','s': '𝐒','t': '𝐓','u': '𝐔','v': '𝐕','w': '𝐖','x': '𝐗','y': '𝐘','z': '𝐙' } },
    { name: 'النمط السادس (أنيق مرتفع)', map: { 'a': '𝑨','b': '𝑩','c': '𝑪','d': '𝑫','e': '𝑬','f': '𝑭','g': '𝑮','h': '𝑯','i': '𝑰','j': '𝑱','k': '𝑲','l': '𝑳','m': '𝑴','n': '𝑵','o': '𝑶','p': '𝑷','q': '𝑸','r': '𝑹','s': '𝑺','t': '𝑻','u': '𝑼','v': '𝑽','w': '𝑾','x': '𝑿','y': '𝒀','z': '𝒁' } },
    { name: 'النمط السابع (مربع دوت)', map: { 'a': '𝕒','b': '𝕓','c': '𝕔','d': '𝕕','e': '𝕖','f': '𝕗','g': '𝕘','h': '𝕙','i': '𝕚','j': '𝕛','k': '𝕜','l': '𝕝','m': '𝕞','n': '𝕟','o': '𝕠','p': '𝕡','q': '𝕢','r': '𝕣','s': '𝕤','t': '𝕥','u': '𝕦','v': '𝕧','w': '𝕨','x': '𝕩','y': '𝕪','z': '𝕫' } },
    { name: 'النمط الثامن (أنيق تفصيلي)', map: { 'a': '𝐴','b': '𝐵','c': '𝐶','d': '𝐷','e': '𝐸','f': '𝐹','g': '𝐺','h': '𝐻','i': '𝐼','j': '𝐽','k': '𝐾','l': '𝐿','m': '𝑀','n': '𝑁','o': '𝑂','p': '𝑃','q': '𝑄','r': '𝑅','s': '𝑆','t': '𝑇','u': '𝑈','v': '𝑉','w': '𝑊','x': '𝑋','y': '𝑌','z': '𝑍' } },
    { name: 'النمط التاسع (مطور تكنولوجي)', map: { 'a': '𝙰','b': '𝙱','c': '𝙲','d': '𝙳','e': '𝙴','f': '𝙵','g': '𝙶','h': '𝙷','i': '𝙸','j': '𝚹','k': '𝙺','l': '𝙻','m': '𝙼','n': 'الن','o': '𝙾','p': '𝙿','q': '𝚀','r': '𝚁','s': '𝚂','t': '𝚃','u': '𝚄','v': '𝚅','w': '𝚆','x': '𝚇','y': '𝚈','z': '𝚉' } }
  ];

  try {
    // إنشاء البطاقات (Carousel Cards)
    let cards = [];
    
    for (let i = 0; i < styles.length; i++) {
      let item = styles[i];
      let fancy = text.split('').map(char => item.map[char.toLowerCase()] || char).join('');
      
      cards.push({
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: `✨ ${item.name} (${i + 1}/${styles.length})`,
          hasMediaAttachment: false
        }),
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `النص الأصلي: ${text}\n\n*النتيجة:* \n\`\`\`${fancy}\`\`\``
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: "Text Style"
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: "cta_copy",
              buttonParamsJson: JSON.stringify({
                display_text: `📋 نسخ الزخرفة`,
                copy_code: fancy
              })
            }
          ]
        })
      });
    }

    const interactiveMessage = proto.Message.InteractiveMessage.fromObject({
      body: proto.Message.InteractiveMessage.Body.create({ text: `✨ نتائج زخرفة النص: *${text}*` }),
      footer: proto.Message.InteractiveMessage.Footer.create({ text: "اسحب يميناً ويساراً لاستعراض باقي الأنماط ➔" }),
      carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
        cards: cards
      })
    });

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          interactiveMessage: interactiveMessage
        }
      }
    }, { quoted: m });

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

  } catch (e) {
    console.error(e);
    let info = `⚠︎ حدث خطأ أثناء عرض الأنماط بشكل بطاقات.\n\n${e.message}`;
    return conn.reply(m.chat, info, fkontak, rcanal);
  }
};

handler.help = ['زخرفة'];
handler.command = ['زخرف', 'زخرفة', 'سوي'];
handler.tags = ['الـأعـضـاء'];

export default handler;
