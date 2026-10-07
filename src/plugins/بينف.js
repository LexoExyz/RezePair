/**
 * pinterest_downloader.js
 * تحميل من بينترست (فيديو وصور)
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const url = args[0]
  
  if (!url) {
    let info = `*📌 يـرجـى وضـع الـرابط بـعـد الأمـر*\nمثال:\n${usedPrefix + command} https://pin.it/xxxx`
    return conn.reply(m.chat, info, fkontak, rcanal)
  }

  await m.react('⏳')
  let waitMsg = `*⏳ جـاري الـتـحـمـيـل بـدقـة عـالـيـة...*`
  await conn.reply(m.chat, waitMsg, fkontak, rcanal)

  try {
    const result = await snappinDownload(url)
    if (!result.status) throw result.message

    const captionText = `✅ *تـم الـتـحـمـيـل بـنـجـاح*\n\n> *قسم التنزيلات • System*`

    if (result.video) {
      await conn.sendMessage(m.chat, { 
          video: { url: result.video }, 
          caption: captionText,
          mimetype: 'video/mp4',
          contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined
      }, { quoted: m })
    } else if (result.image) {
      await conn.sendMessage(m.chat, { 
          image: { url: result.image }, 
          caption: captionText,
          contextInfo: typeof rcanal !== 'undefined' ? rcanal.contextInfo : undefined
      }, { quoted: m })
    } else {
      let info = `*❌ لـم يـتـم الـعـثـور عـلى وسـائط.*`
      return conn.reply(m.chat, info, fkontak, rcanal)
    }

    return await m.react('✅')

  } catch (err) {
    console.error(err)
    await m.react('❌')
    let info = `*❌ فـشـل الـتـحـمـيـل:* ${err}`
    return conn.reply(m.chat, info, fkontak, rcanal)
  }
}

handler.help = ['بينف']
handler.tags = ['الـتـنزيـلات']
handler.command = ['بينف', 'بينترست-فيديو', 'بينفي', 'بينفيديو']

export default handler

// ===== 🔽 FUNCTION: Snappin Scraper
export async function snappinDownload(pinterestUrl) {
  try {
    const { csrfToken, cookies } = await getSnappinToken()

    const postRes = await axios.post(
      'https://snappin.app/',
      { url: pinterestUrl },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
          Cookie: cookies,
          Referer: 'https://snappin.app',
          Origin: 'https://snappin.app',
          'User-Agent': 'Mozilla/5.0'
        }
      }
    )

    const $ = cheerio.load(postRes.data)
    const thumb = $('img').attr('src')

    const downloadLinks = $('a.button.is-success')
      .map((_, el) => $(el).attr('href'))
      .get()

    let videoUrl = null
    let imageUrl = null

    for (const link of downloadLinks) {
      const fullLink = link.startsWith('http') ? link : 'https://snappin.app' + link
      const head = await axios.head(fullLink).catch(() => null)
      const contentType = head?.headers?.['content-type'] || ''

      if (link.includes('/download-file/')) {
        if (contentType.includes('video')) {
          videoUrl = fullLink
        } else if (contentType.includes('image')) {
          imageUrl = fullLink
        }
      } else if (link.includes('/download-image/')) {
        imageUrl = fullLink
      }
    }

    return {
      status: true,
      thumb,
      video: videoUrl,
      image: videoUrl ? null : imageUrl
    }

  } catch (err) {
    return {
      status: false,
      message: err?.response?.data?.message || err.message || 'Unknown Error'
    }
  }
}

async function getSnappinToken() {
  const { headers, data } = await axios.get('https://snappin.app/')
  const cookies = headers['set-cookie'].map(c => c.split(';')[0]).join('; ')
  const $ = cheerio.load(data)
  const csrfToken = $('meta[name="csrf-token"]').attr('content')
  return { csrfToken, cookies }
}
