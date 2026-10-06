// تطوير وتعديل: RezeBOT 

const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"))
import baileys from '@whiskeysockets/baileys'
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = baileys
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util'
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'
let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""
let rtx = "*🛠️ دليل تنصيب - 𝐑𝐞𝐳𝐞 𝐁𝐨𝐭 🛠️*\n\nمرحبًا بك في عائلة البوت! \nإليك الخطوات اللازمة لتنصيب البوت على حاسوبك لتصبح فرد من العائلة:\n\n💻 *الخطوات الأساسية:*\n\nأولاً وقبل كل شيء تأكد أن لا يوجد أجهزة مرتبطة سابقاً، إذا وجدت قم بمسحها واتبع التعليمات\n1. سيتم ارسال نسخة من مربع qr\n2. قم بالضغط عليه \n3. انتقل الى الأجهزة المرتبطة\n4. اضغط على ربط جهاز\n5. وجه كاميرا حاسوبك نحو المربع\n\n⚡ *متطلبات التشغيل:*\n\nواتساب نسخة رسمية (احسن)\nاتصال انترنت مستقر \n\n⛔ *ملاحظات هامة:*\n\n- لتجنب الحظر اجعل البوت في رقم خاص ولا تتحدث منه\n- استخدم واتس مسنجر ليعمل معك التنصيب بشكل ممتاز\n- ستجد كل اخبار وتحديثات البوت بالقناة يلي تحت\n\n📢 *لا تنسى تتابع قناة البوت يامز :*\n> https://whatsapp.com/channel/0029Vb8Ol5sIiRompt16Vk1Z\n🤖*جروب دعم و تنصيب البوت :*\n> https://chat.whatsapp.com/CTsXUdXOhV44qx4QHNPyJ1\n\n*مع تحيات، المطور*\n˚₊·—̳͟͞𝒍𝒆𝒙𝒐"
let rtx2 = "*🛠️ دليل تنصيب - 𝐑𝐞𝐳𝐞 𝐁𝐨𝐭 🛠️*\n\nمرحبًا بك في عائلة البوت!\nإليك الخطوات اللازمة لتنصيب البوت لتصبح فرد من العائلة:\n\n📱 *الخطوات الأساسية:*\n\nأولاً وقبل كل شي تأكد أنه لا يوجد أجهزة مرتبطة سابقاً، إذا وجدت قم بمسحها واتبع التعليمات :\n1. سيظهر الرمز المكون من ثمانية أرقام في الأسفل \n2. قم بالضغط عليه ضغط مطول وقم بنسخه بالكامل\n3. اذهب إلى الإشعار الخاص بالواتساب الذي ظهر في الأعلى\n4. اضغط على تأكيد\n5. الصق الرمز الذي نسخته سابقاً\n\n⚡ *متطلبات التشغيل:*\n\nواتساب نسخة رسمية (احسن)\nاتصال إنترنت مستقر\n\n⛔  *ملاحظات هامة:*\n\nلتجنب الحظر اجعل البوت في رقم خاص ولا تتحدث منه\n استخدم واتس مسنجر ليعمل معك التنصيب بشكل ممتاز \nستجد كل اخبار وتحديثات البوت بالقناة يلي تحت\n\n📢 *لا تنسى تتابع قناة البوت يامز :*\n> https://whatsapp.com/channel/0029Vb8Ol5sIiRompt16Vk1Z\n\n🤖*جروب دعم و تنصيب البوت :*\n> https://chat.whatsapp.com/CTsXUdXOhV44qx4QHNPyJ1\n\n\n*مع تحيات، المطور*\n—̳͟͞𝒍𝒆𝒙𝒐"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const kanekiAIJBOptions = {}
if (global.conns instanceof Array) console.log()
else global.conns = []
function isSubBotConnected(jid) { return global.conns.some(sock => sock?.user?.jid && sock.user.jid.split("@")[0] === jid.split("@")[0]) }
let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
if (!globalThis.db.data.settings[conn.user.jid].jadibotmd) return m.reply(`ꕥ الأمر *${command}* معطل حالياً.`)
let time = global.db.data.users[m.sender].Subs + 120000
if (new Date - global.db.data.users[m.sender].Subs < 120000) return conn.reply(m.chat, `ꕥ يجب عليك الانتظار ${msToTime(time - new Date())} لإعادة ربط *البوت الفرعي (Sub-Bot).*`, fkontak, rcanal)
let socklimit = global.conns.filter(sock => sock?.user).length
if (socklimit >= 100) {
return m.reply(`ꕥ عذراً، لا توجد مساحات متوفرة للبوتات الفرعية حالياً.`)
}
let mentionedJid = await m.mentionedJid
let who = mentionedJid && mentionedJid[0] ? mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let id = `${who.split`@`[0]}`
let pathkanekiAIJadiBot = path.join(`./${jadi}/`, id)
if (!fs.existsSync(pathkanekiAIJadiBot)){
fs.mkdirSync(pathkanekiAIJadiBot, { recursive: true })
}
kanekiAIJBOptions.pathkanekiAIJadiBot = pathkanekiAIJadiBot
kanekiAIJBOptions.m = m
kanekiAIJBOptions.conn = conn
kanekiAIJBOptions.args = args
kanekiAIJBOptions.usedPrefix = usedPrefix
kanekiAIJBOptions.command = command
kanekiAIJBOptions.fromCommand = true
kanekiAIJadiBot(kanekiAIJBOptions)
global.db.data.users[m.sender].Subs = new Date * 1
}
handler.help = ['كود', 'تنصيب']
handler.tags = ['الـأعـضـاء']
handler.command = ['كود', 'تنصيب']
export default handler 

export async function kanekiAIJadiBot(options) {
let { pathkanekiAIJadiBot, m, conn, args, usedPrefix, command } = options
if (command === 'تنصيب') {
command = 'كود'
args.unshift('code')
} else if (command === 'كود' && !args.includes('code')) {
args.unshift('code')
}
const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
let txtCode, codeBot, txtQR
if (mcode) {
args[0] = args[0].replace(/^--code$|^code$/, "").trim()
if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
if (args[0] == "") args[0] = undefined
}
const pathCreds = path.join(pathkanekiAIJadiBot, "creds.json")
if (!fs.existsSync(pathkanekiAIJadiBot)){
fs.mkdirSync(pathkanekiAIJadiBot, { recursive: true })}
try {
args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
} catch {
conn.reply(m.chat, `ꕥ يرجى استخدام الأمر بشكل صحيح » ${usedPrefix + command}`, fkontak, rcanal)
return
}
const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
const drmer = Buffer.from(drm1 + drm2, `base64`)
let { version, isLatest } = await fetchLatestBaileysVersion()
const msgRetry = (MessageRetryMap) => { }
const msgRetryCache = new NodeCache()
const { state, saveState, saveCreds } = await useMultiFileAuthState(pathkanekiAIJadiBot)
const connectionOptions = {
logger: pino({ level: "fatal" }),
printQRInTerminal: false,
auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
msgRetry,
msgRetryCache, 
browser: ['Windows', 'FireFox'],
version: version,
generateHighQualityLinkPreview: true
}
let sock = makeWASocket(connectionOptions)
sock.isInit = false
let isInit = true
setTimeout(async () => {
if (!sock.user) {
try { fs.rmSync(pathkanekiAIJadiBot, { recursive: true, force: true }) } catch {}
try { sock.ws?.close() } catch {}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)
if (i >= 0) global.conns.splice(i, 1)
console.log(`[تنظيف تلقائي] تم حذف الجلسة ${path.basename(pathkanekiAIJadiBot)} بسبب بيانات اعتماد غير صالحة.`)
}}, 60000)
async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update
if (isNewLogin) sock.isInit = false
if (qr && !mcode) {
if (m?.chat) {
txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
} else {
return 
}
if (txtQR && txtQR.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 30000)
}
return
} 
if (qr && mcode) {
let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
secret = secret.match(/.{1,4}/g)?.join("-")
// إرسال الصورة مع التعليمات
txtCode = await conn.sendMessage(m.chat, { image: { url: 'https://files.catbox.moe/bix9sd.jpg' }, caption: rtx2 }, { quoted: fkontak })

// إرسال كود الربط مع زر النسخ التفاعلي
let mediaMsg = await prepareWAMessageMedia({ image: { url: 'https://files.catbox.moe/bix9sd.jpg' } }, { upload: conn.waUploadToServer })
let msgInteractive = generateWAMessageFromContent(m.chat, {
viewOnceMessage: {
message: {
interactiveMessage: proto.Message.InteractiveMessage.fromObject({
body: proto.Message.InteractiveMessage.Body.create({ text: `📌 *كود الربط الخاص بك:* \n\n\`${secret}\`` }),
footer: proto.Message.InteractiveMessage.Footer.create({ text: "اضغط على الزر أدناه لنسخ الكود" }),
nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
buttons: [
{ name: "copy_code", buttonParamsJson: JSON.stringify({ display_text: "📋 نسخ الكود", copy_code: secret }) }
]
})
})
}
}
}, { quoted: fkontak })

codeBot = await conn.relayMessage(m.chat, msgInteractive.message, { messageId: msgInteractive.key.id })
console.log(secret)
}
if (txtCode && txtCode.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key })}, 30000)
}
if (codeBot && codeBot.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key })}, 30000)
}
const endSesion = async (loaded) => {
if (!loaded) {
try {
sock.ws.close()
} catch {
}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)                
if (i < 0) return 
delete global.conns[i]
global.conns.splice(i, 1)
}}
const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (connection === 'close') {
if (reason === 428) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ تم إغلاق الاتصال (+${path.basename(pathkanekiAIJadiBot)}) بشكل مفاجئ. جاري محاولة إعادة الاتصال...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
await creloadHandler(true).catch(console.error)
}
if (reason === 408) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ فقد الاتصال أو انتهت صلاحيته (+${path.basename(pathkanekiAIJadiBot)}). السبب: ${reason}. جاري محاولة إعادة الاتصال...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
await creloadHandler(true).catch(console.error)
}
if (reason === 440) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ تم استبدال الاتصال (+${path.basename(pathkanekiAIJadiBot)}) بجلسة نشطة أخرى.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
try {
if (options.fromCommand) m?.chat ? await conn.reply(`${path.basename(pathkanekiAIJadiBot)}@s.whatsapp.net`, '⚠︎ لقد اكتشفنا جلسة جديدة، يرجى حذف الجلسة القديمة للمتابعة.\n\n> ☁︎ إذا كانت هناك مشكلة، حاول الاتصال مرة أخرى.', fkontak, rcanal) : ""
} catch (error) {
console.error(chalk.bold.yellow(`⚠︎ خطأ 440: تعذر إرسال رسالة إلى: +${path.basename(pathkanekiAIJadiBot)}`))
}}
if (reason == 405 || reason == 401) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ تم إغلاق الجلسة (+${path.basename(pathkanekiAIJadiBot)}). بيانات الاعتماد غير صالحة أو تم فصل الجهاز يدوياً.\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
try {
if (options.fromCommand) m?.chat ? await conn.reply(`${path.basename(pathkanekiAIJadiBot)}@s.whatsapp.net`, '⚠︎ الجلسة معلقة.\n\n> ☁︎ يرجى المحاولة مرة أخرى لتصبح *SUB-BOT*.', fkontak, rcanal) : ""
} catch (error) {
console.error(chalk.bold.yellow(`⚠︎ خطأ 405: تعذر إرسال رسالة إلى: +${path.basename(pathkanekiAIJadiBot)}`))
}
fs.rmdirSync(pathkanekiAIJadiBot, { recursive: true })
}
if (reason === 500) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ فقد الاتصال في الجلسة (+${path.basename(pathkanekiAIJadiBot)}). جاري مسح البيانات...\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
if (options.fromCommand) m?.chat ? await conn.reply(`${path.basename(pathkanekiAIJadiBot)}@s.whatsapp.net`, '⚠︎ فقد الاتصال.\n\n> ☁︎ حاول الاتصال يدوياً لتصبح *SUB-BOT* مرة أخرى.', fkontak, rcanal) : ""
return creloadHandler(true).catch(console.error)
}
if (reason === 515) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ إعادة تشغيل تلقائية للجلسة (+${path.basename(pathkanekiAIJadiBot)}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
await creloadHandler(true).catch(console.error)
}
if (reason === 403) {
console.log(chalk.bold.magentaBright(`\n╭┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡\n┆ الجلسة مغلقة أو الحساب تحت المراجعة للجلسة (+${path.basename(pathkanekiAIJadiBot)}).\n╰┄┄┄┄┄┄┄┄┄┄┄┄┄┄ • • • ┄┄┄┄┄┄┄┄┄┄┄┄┄┄⟡`))
fs.rmdirSync(pathkanekiAIJadiBot, { recursive: true })
}}
if (global.db.data == null) loadDatabase()
if (connection == `open`) {
if (!global.db.data?.users) loadDatabase()
await joinChannels(conn)
let userName, userJid 
userName = sock.authState.creds.me.name || 'مجهول'
userJid = sock.authState.creds.me.jid || `${path.basename(pathkanekiAIJadiBot)}@s.whatsapp.net`
console.log(chalk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• بوت فرعي •】⸺⸺⸺⸺❒\n│\n│ ❍ ${userName} (+${path.basename(pathkanekiAIJadiBot)}) متصل بنجاح.\n│\n❒⸺⸺⸺【• متصل •】⸺⸺⸺❒`))
sock.isInit = true
global.conns.push(sock)
m?.chat ? await conn.reply(m.chat, isSubBotConnected(m.sender) ? `
 🌿 @${m.sender.split('@')[0]}, أنت متصل بالفعل، جاري قراءة الرسائل الواردة...` : `❀ لقد سجلت بوتاً فرعياً جديداً! [@${m.sender.split('@')[0]}]\n\n> يمكنك رؤية معلومات البوت باستخدام الأمر *.اوامر*`, fkontak, rcanal) : ''
}}
setInterval(async () => {
if (!sock.user) {
try { sock.ws.close() } catch (e) {}
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)
if (i < 0) return
delete global.conns[i]
global.conns.splice(i, 1)
}}, 60000)
let handler = await import('../handler.js')
let creloadHandler = async function (restatConn) {
try {
const Handler = await import(`../handler.js?update=${Date.now()}`).catch(console.error)
if (Object.keys(Handler || {}).length) handler = Handler
} catch (e) {
console.error('⚠︎ خطأ جديد: ', e)
}
if (restatConn) {
const oldChats = sock.chats
try { sock.ws.close() } catch { }
sock.ev.removeAllListeners()
sock = makeWASocket(connectionOptions, { chats: oldChats })
isInit = true
}
if (!isInit) {
sock.ev.off("messages.upsert", sock.handler)
sock.ev.off("connection.update", sock.connectionUpdate)
sock.ev.off('creds.update', sock.credsUpdate)
}
sock.handler = handler.handler.bind(sock)
sock.connectionUpdate = connectionUpdate.bind(sock)
sock.credsUpdate = saveCreds.bind(sock, true)
sock.ev.on("messages.upsert", sock.handler)
sock.ev.on("connection.update", sock.connectionUpdate)
sock.ev.on("creds.update", sock.credsUpdate)
isInit = false
return true
}
creloadHandler(false)
})
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));}
function msToTime(duration) {
var milliseconds = parseInt((duration % 1000) / 100),
seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60),
hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
hours = (hours < 10) ? '0' + hours : hours
minutes = (minutes < 10) ? '0' + minutes : minutes
seconds = (seconds < 10) ? '0' + seconds : seconds
return minutes + ' د و ' + seconds + ' ث '
}

async function joinChannels(sock) {
for (const value of Object.values(global.ch)) {
if (typeof value === 'string' && value.endsWith('@newsletter')) {
await sock.newsletterFollow(value).catch(() => {})
}}}
