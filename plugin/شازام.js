// تعريب وتطوير: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 
// - المبرمج الأصلي: ShadowCore
import acrcloud from 'acrcloud'
import ytsearch from 'yt-search'
import baileys from '@whiskeysockets/baileys'

const { generateWAMessageFromContent, generateWAMessageContent, proto } = baileys

const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: 'c33c767d683f78bd17d4bd4991955d81',
  access_secret: 'bvgaIAEtADBTbLwiPGYlxupWqkNGIjT7J9Ag2vIu'
})

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = q.mimetype || ''
    const mtype = q.mtype || ''

    if (!/audio|video/.test(mime) && !/audioMessage|videoMessage/.test(mtype)) {
      let info = `✔️ *الاسـتـخـدام:* \n\nقـم بـالرد عـلى مـقـطـع صـوتـي أو فـيـديـو بـاسـتـخـدام الأمر: *${usedPrefix + command}* لـمـعـرفـة اسـم الأغـنـيـة.`
      return conn.reply(m.chat, info, fkontak, rcanal)
    }

    await m.react('🕒')

    const buffer = await q.download?.()
    if (!buffer) throw '❌ فـشل تـحـمـيـل الـمـلـف. حـاول مـجدداً.'

    const result = await acr.identify(buffer)
    const { status, metadata } = result

    if (status.code !== 0) throw status.msg || 'لـم يـتـم الـتـعـرف عـلى الـمـوسـيـقـى.'

    const music = metadata.music?.[0]
    if (!music) throw 'لـم يـتـم الـعـثـور عـلى مـعـلـومـات الأغـنـيـة.'

    const title = music.title || 'غـيـر مـعروف'
    const artist = music.artists?.map(v => v.name).join(', ') || 'غـيـر مـعروف'
    const album = music.album?.name || 'غـيـر مـعروف'
    const release = music.release_date || 'غـيـر مـعروف'

    const yt = await ytsearch(`${title} ${artist}`)
    const video = yt.videos.length > 0 ? yt.videos[0] : null

    if (video) {
      const { imageMessage } = await generateWAMessageContent(
        { image: { url: video.thumbnail } },
        { upload: conn.waUploadToServer }
      )

      const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: proto.Message.InteractiveMessage.fromObject({
              body: proto.Message.InteractiveMessage.Body.fromObject({
                text: `*「 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 - مـعـرفـة الـمـوسـيـقـى 」*

🥭 *الـعـنـوان:* ${title}  
📌 *الـفـنـان:* ${artist}  
💿 *الألـبـوم:* ${album}  
📆 *الاصـدار:* ${release}  

━━━━━━━━━━━━━━━
⚔️ *نـتـيـجـة الـبـحث:* ${video.title}  
⏱ *الـمدة:* ${video.timestamp}  
🔥 *الـمـشـاهـدات:* ${video.views.toLocaleString()}  
📺 *الـقـنـاة:* ${video.author.name}  
🔗 *الـرابط:* ${video.url}`
              }),
              footer: proto.Message.InteractiveMessage.Footer.fromObject({
                text: "𝒚𝒖𝒕𝒂 𝒃𝒐𝒕"
              }),
              header: proto.Message.InteractiveMessage.Header.fromObject({
                title: '',
                hasMediaAttachment: true,
                imageMessage
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
                  {
                    name: "cta_copy",
                    buttonParamsJson: JSON.stringify({
                      display_text: "نـسـخ رابـط الأغـنـيـة 📋",
                      id: video.url,
                      copy_code: video.url
                    })
                  },
                  {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({
                      display_text: "🌐 مـشـاهـدة عـلـى YouTube",
                      url: video.url,
                      merchant_url: video.url
                    })
                  }
                ]
              })
            })
          }
        }
      }, { quoted: m })

      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
      await m.react('✔️')
    } else {
       let info = `🎵 *الـعـنـوان:* ${title}\n👤 *الـفـنـان:* ${artist}`
       await conn.reply(m.chat, info, fkontak, rcanal)
       await m.react('✔️')
    }

  } catch (e) {
    console.error(e)
    let info = `> ❌ حـدث خـطأ فـي الـتـعرف عـلى الـمـوسـيـقى:\n${e}`
    await conn.reply(m.chat, info, fkontak, rcanal)
    await m.react('✖️')
  }
}

handler.help = ['شازام <صوت/فيديو>']
handler.tags = ['الـبـحث']
handler.command = ['shazam', 'whatmusic', 'من_هذه_الاغنية', 'شازام']
handler.register = true

export default handler
