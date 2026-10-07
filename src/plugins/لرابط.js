/**
 * tourl.js
 * تحويل الميديا (صور/فيديو) إلى روابط مباشرة
 */

import fs from 'fs'
import path from 'path'
import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

const handler = async (m, { conn, command }) => {
  const q = m.quoted || m
  const mime = (q.msg || q).mimetype || q.mediaType || ''
  
  if (!mime) {
    let info = `⚠️ يرجى إرسال صورة أو فيديو مع الأمر *${command}* أو الرد على ميديا لتحويلها إلى رابط.`
    return conn.reply(m.chat, info, fkontak, rcanal)
  }

  await m.react('⏳')
  let waitMsg = `*⏳ جاري رفع الميديا... يرجى الانتظار.*`
  await conn.reply(m.chat, waitMsg, fkontak, rcanal)

  // تحميل الميديا وحفظها مؤقتاً
  const media = await q.download()
  const tempDir = './temp'
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir)

  const ext = mime.split('/')[1] || 'dat'
  const fileName = `media_${Date.now()}.${ext}`
  const filePath = path.join(tempDir, fileName)
  fs.writeFileSync(filePath, media)
  const buffer = fs.readFileSync(filePath)

  // خدمات الرفع
  const uploadToSupa = async (buffer) => {
    try {
      const form = new FormData()
      form.append('file', buffer, 'upload.jpg')
      const res = await axios.post('https://i.supa.codes/api/upload', form, {
        headers: form.getHeaders()
      })
      return res.data?.link || null
    } catch { return null }
  }

  const uploadToTmpFiles = async (filePath) => {
    try {
      const buf = fs.readFileSync(filePath)
      const { ext, mime } = await fileTypeFromBuffer(buf)
      const form = new FormData()
      form.append('file', buf, { filename: `${Date.now()}.${ext}`, contentType: mime })
      const res = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
        headers: form.getHeaders()
      })
      return res.data.data.url.replace('s.org/', 's.org/dl/')
    } catch { return null }
  }

  const uploadToUguu = async (filePath) => {
    try {
      const form = new FormData()
      form.append('files[]', fs.createReadStream(filePath))
      const res = await axios.post('https://uguu.se/upload.php', form, {
        headers: form.getHeaders()
      })
      return res.data.files?.[0]?.url || null
    } catch { return null }
  }

  // تنفيذ الرفع المتوازي
  const [supa, tmp, uguu] = await Promise.all([
    uploadToSupa(buffer),
    uploadToTmpFiles(filePath),
    uploadToUguu(filePath),
  ])

  let message = `✅ *تم تحويل الميديا بنجاح:*\n`
  if (supa) message += `\n🔗 *الرابط الأول:* ${supa}`
  if (tmp) message += `\n🔗 *الرابط الثاني:* ${tmp}`
  if (uguu) message += `\n🔗 *الرابط الثالث:* ${uguu}`

  await m.react('✅')
  await conn.reply(m.chat, message, fkontak, rcanal)

  // حذف الملف المؤقت
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
}

handler.help = ['لرابط']
handler.tags = ['الـأعـضـاء']
handler.command = /^(لرابط|tourl)$/i
handler.limit = true

export default handler
