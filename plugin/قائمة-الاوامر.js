function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms % 3600000 / 60000);
    let s = Math.floor(ms % 60000 / 1000);
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = pkg;

const handler = async (m, {conn, usedPrefix, usedPrefix: _p, __dirname, text, isPrems}) => {
    let d = new Date(new Date + 3600000);
    let locale = 'ar';
    let week = d.toLocaleDateString(locale, { weekday: 'long' });
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
    let _uptime = process.uptime() * 1000;
    let uptime = clockString(_uptime);
    let user = global.db.data.users[m.sender];
    let name = conn.getName(m.sender)
    let { money, joincount } = global.db.data.users[m.sender];
    let { exp, limit, level, role } = global.db.data.users[m.sender];
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length;
    let more = String.fromCharCode(8206);
    let readMore = more.repeat(850);
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
    let taguser = '@' + m.sender.split("@s.whatsapp.net")[0];
  await conn.sendMessage(m.chat, { react: { text: '📂', key: m.key } })
  const harley = 'https://files.catbox.moe/afjf25.jpg'
  const mentionId = m.key.participant || m.key.remoteJid;
 
conn.relayMessage(m.chat, { viewOnceMessage: { message: { interactiveMessage: { header: { title: `harley`}, body: { text: `
⎔⋅• ━ ╼╃ ⌬〔﷽〕⌬ ╄╾ ━ •⋅⎔
> قال الله تعالى:﴿ادْعُونِي أَسْتَجِبْ لَكُمْ﴾
*⎔⋅ ╼╃ ⊰ •﹝❄️﹞• ⊱ ╄╾ ⋅⎔*
*␥↞مـࢪحـبـا بـك/ي* @${mentionId.split('@')[0]}
*⎔⋅ ╼╃ ⊰ •﹝❄️﹞• ⊱ ╄╾ ⋅⎔*
*␥↞﴿ مـعـلـومـاتـك ﴾⤹*
> 🪔␥بـريـمـيـوم↞﴿ ${user.premiumTime > 0 ? 'مــمـ🔱ـيز' : (isPrems ? 'مــمـ🔱ـيز' : 'عــ🍁ــادي') || ''} ﴾
> 👑␥مـــســـتواك↞﴿ ${level} ﴾
> 💫 ␥رتـبـتـك↞﴿ ${role} ﴾
*⎔⋅ ╼╃ ⊰ •﹝❄️﹞• ⊱ ╄╾ ⋅⎔*
*␥↞﴿الـبـوت﴾⤹*
> 🤖␥اسـم الـبـوت↞﴿ 𝑹𝒆𝒛𝒆 ﴾
> 🐊␥الـمـطـور↞﴿ LexoEyz ﴾
> ⏳␥مـدة الـتـشـغـيـل↞﴿ ${uptime} ﴾
> 👥␥عـدد الـمـسـتـخـدمـين↞﴿ 20 ﴾
*⎔⋅ ╼╃ ⊰ •﹝❄️﹞• ⊱ ╄╾ ⋅⎔*
> © 𝐿𝐸𝑋𝛩𝐸𝑌𝑍 2026
*⎔⋅ ╼╃ ⊰ •﹝❄️﹞• ⊱ ╄╾ ⋅⎔*`,subtitle: "HARLEY",},header: { hasMediaAttachment: true,...(await prepareWAMessageMedia({ image : { url: harley } }, { upload: conn.waUploadToServer }, {quoted: m}))},
                    contextInfo: {
                        mentionedJid: [m.sender],
                        isForwarded: false,
                    },nativeFlowMessage: { buttons: [


                            {
                                name: 'single_select',
                                buttonParamsJson: JSON.stringify({
                                    title: '⌈📜╎الــقــوائـــم╎📜⌋',
                                    sections: [
                                        {
                                            title: 'مــرحـ🛡ـبــا بــك فـي ريـــ🤖ــزي بــوت',
                                            highlight_label: 'بــوت',                                        rows: [
                                                {
                                                    header: 'الــقـ👑ـســم الـاول',
                                                    title: 'استدعاء_قسم_الأعضاء',
                                                    description: 'اوامر متاحة للجميع',
                                                    id: '.قسم الـأعـضـاء'
                                                },
                                                {
                                                    header: 'الــقـ👨🏻‍💻ـســم الــثــانــي',
                                                    title: 'استدعاء_قسم_المشرفين',
                                                    description: 'اوامر متاحة للمشرفين و المطورين فقط',
                                                    id: '.قسم الـمـشـرفـيـن'
                                                },
                                                {
                                                    header: 'الــقـ🕋ـســم الــثــالــث',
                                                    title: 'استدعاء_قسم_الدين',
                                                    description: 'الأوامر الدينية',
                                                    id: '.قسم الـديــن'
                                                },
                                                {
                                                    header: 'الــقـ👑ـســم الــرابــع',
                                                    title: 'استدعاء_قسم_المطور',
                                                    description: 'اوامر متاحة للمطور فقط',
                                                    id: '.قسم الـمـطـور'
                                                },
                                                {
                                                    header: 'الــقــ📥ســم الــخــامــس',
                                                    title: 'استدعاء_قسم_التنزيلات ',
                                                    description: 'اوامر التنزيل و التحميل',
                                                    id: '.قسم الـتـنزيـلات'
                                                },
                                                {
                                                    header: 'الــقـ🕹ـســم الــســادس',
                                                    title: 'استدعاء_قسم_الالعاب ',
                                                    description: 'اوامر الألعاب',
                                                    id: '.قسم الـالـعـاب'
                                                },
                                                {
                                                    header: 'الــقـ🌀ـســم الــســابــع',
                                                    title: 'استدعاء_قسم_التحويلات',
                                                    description: 'اوامر التحويل',
                                                    id: '.قسم الـتـحـويـلات'
                                                },
                                                {
                                                    header: 'الــقـ🤖ـســم الــثـامـن',
                                                    title: 'استدعاء_قسم_الذكاء الاصطناعي',
                                                    description: 'اوامر الدكاء الاصطناعي',
                                                    id: '.قسم الصـــنـ😳ـاعـي'
                                                },
                                                {
                                                    header: 'الــقـ🚨ـســم الــتـاسـع',
                                                    title: 'استدعاء_قسم_الدعم',
                                                    description: 'اوامر الدعم والمساعدة',
                                                    id: '.قسم الـدعـم'
                                                },
                                                {
                                                    header: 'الــقـ🔍ـســم الــعــاشـر',
                                                    title: 'استدعاء_قسم_البحث ',
                                                    description: 'اوامر البحث',
                                                    id: '.قسم الـبـحث'
                                               }
                                            ]
                                        }
                                    ]
                                }),
                  messageParamsJson: ''
                },
                {
              name: "cta_url",
              buttonParamsJson: '{"display_text":"⌈🐤╎مجموعة البوت╎🐤⌋","url":"https://chat.whatsapp.com/CTsXUdXOhV44qx4QHNPyJ1","merchant_url":"https://chat.whatsapp.com/CTsXUdXOhV44qx4QHNPyJ1"}'
                },
                {
              name: "quick_reply",
              buttonParamsJson: '{"display_text":"⌈💻╎الــمـطـور╎💻⌋","id":".المطور"}'
                     },
                     {
               name: "cta_url",
               buttonParamsJson: '{"display_text":"⌈🦅╎قـنـاة الـبـوت╎🦅⌋","url":"https://whatsapp.com/channel/0029Vb8Ol5sIiRompt16Vk1Z","merchant_url":"https://whatsapp.com/channel/0029Vb8Ol5sIiRompt16Vk1Z"}'
                            }
                        ]
                    }
                }
            }
        }
    }, {});
}

handler.help = ['info'];
handler.tags = ['main'];
handler.command = ['menu', 'مهام', 'اوامر','الاوامر','قائمة','القائمة']

export default handler;
