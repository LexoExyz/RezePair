// تطوير وتعديل: 𝑹𝒆𝒛𝒆
import fs from 'fs'
import path from 'path'
// دالة لحساب المسافة بين الكلمات (Levenshtein Distance) لاقتراح الأسماء القريبة
function levenshteinDistance(a, b) {
if (a.length === 0) return b.length
if (b.length === 0) return a.length
const matrix = []
for (let i = 0; i <= b.length; i++) matrix[i] = [i]
for (let j = 0; j <= a.length; j++) matrix[0][j] = j
for (let i = 1; i <= b.length; i++) {
for (let j = 1; j <= a.length; j++) {
if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1]
else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
}
}
return matrix[b.length][a.length]
}
function findClosestMatch(input, options, maxDistance = 3) {
let closest = null
let minDistance = Infinity
for (const option of options) {
const distance = levenshteinDistance(input.toLowerCase(), option.toLowerCase())
if (distance < minDistance && distance <= maxDistance) {
minDistance = distance
closest = option
}
}
return closest
}
let handler = async (m, { conn, text, isOwner, usedPrefix, command }) => {
// 1. التحقق من أن المستخدم هو المطور فقط
if (!isOwner) {
let info = '❌ هذا الأمر مخصص للمطور فقط.'
return conn.reply(m.chat, info, fkontak, rcanal)
}
const pluginsDir = path.resolve('./plugins')
const pluginFiles = fs.readdirSync(pluginsDir)
.filter(file => file.endsWith('.js') && !file.startsWith('_'))
const pluginNames = pluginFiles.map(v => v.replace('.js', ''))
// 2. عرض القائمة إذا لم يتم إدخال نص
if (!text) {
const pluginList = pluginNames.map((v, index) =>
`│ ${(index + 1).toString().padStart(2)}.${v}`
).join('\n')
let info = `╭───〔 📁 ملفات 𝑹𝒆𝒛𝒆 〕───⬣
│ 🔢 الإجمالي: ${pluginNames.length} ملف
├─────⊷
${pluginList}
╰─────⊷
✍️ أرسل *الرقم* أو *الاسم* للحصول على الكود`
return conn.reply(m.chat, info, fkontak, rcanal)
}
let selectedPlugin = ''
// 3. التحقق مما إذا كان المدخل رقماً
if (/^\d+$/.test(text)) {
const index = parseInt(text) - 1
if (index >= 0 && index < pluginNames.length) {
selectedPlugin = pluginNames[index]
} else {
let info = `⚠️ الرقم غير صحيح! أدخل رقم بين 1 و ${pluginNames.length}`
return conn.reply(m.chat, info, fkontak, rcanal)
}
} else {
// 4. التحقق مما إذا كان المدخل اسماً
if (pluginNames.includes(text)) {
selectedPlugin = text
} else {
const closestMatch = findClosestMatch(text, pluginNames)
let info = `⚠️ *الملف "${text}" غير موجود!*`
if (closestMatch) info += `\n🔎 ربما تقصد: *${closestMatch}*`
info += `\n\n📂 أرسل الأوامر بدون نص لعرض القائمة.`
return conn.reply(m.chat, info, fkontak, rcanal)
}
}
// 5. إرسال الملف والكود
try {
const filePath = path.join(pluginsDir, `${selectedPlugin}.js`)
const content = fs.readFileSync(filePath, 'utf-8')
// إرسال كملف Document
let info = `✅ تم جلب ملف : *${selectedPlugin}.js*`
await conn.sendMessage(m.chat, {
document: fs.readFileSync(filePath),
mimetype: 'application/javascript',
fileName: `${selectedPlugin}.js`,
caption: info
}, { quoted: m })
// إرسال الكود كنص (مقسم إذا كان طويلاً)
const chunks = content.match(/[\s\S]{1,4000}/g) || []
for (let i = 0; i < chunks.length; i++) {
let chunkText = `📄 *${selectedPlugin}.js* (${i + 1}/${chunks.length}):\n\n\`\`\`javascript\n${chunks[i]}\n\`\`\``
await conn.sendMessage(m.chat, {
text: chunkText
}, { quoted: m })
}
} catch (e) {
console.error(e)
let info = `❌ حدث خطأ أثناء تحميل الملف: ${e.message}`
return conn.reply(m.chat, info, fkontak, rcanal)
}
}
handler.help = ['هات']
handler.tags = ['الـمـطـور']
handler.command = /^(هات)$/i
handler.rowner = true
export default handler
