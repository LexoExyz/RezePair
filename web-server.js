// web-server.js — موقع ربط الأرقام: يعطي المستخدم كود ربط ويشغّل له بوتًا فرعيًا على رقمه
import express from 'express'
import fs from 'fs'
import path from 'path'
import pino from 'pino'
import chalk from 'chalk'
import NodeCache from 'node-cache'
import { fileURLToPath } from 'url'
import { makeWASocket } from './lib/simple.js'

const baileys = await import('@whiskeysockets/baileys')
const { DisconnectReason, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = baileys

const __dir = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000
const MAX_SESSIONS = Number(process.env.MAX_SESSIONS || 100)
const CODE_TTL = 150_000 // مهلة انتظار إدخال الكود قبل حذف الجلسة غير المكتملة

if (!Array.isArray(global.conns)) global.conns = []

class HttpError extends Error { constructor(status, msg) { super(msg); this.status = status } }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const sessionsRoot = () => path.resolve(global.jadi || 'Sessions/SubBot')
const wipe = (dir) => { try { fs.rmSync(dir, { recursive: true, force: true }) } catch {} }
const bare = (jid = '') => jid.split(/[@:]/)[0]
const isLinked = (number) => global.conns.some((s) => s?.user?.jid && bare(s.user.jid) === number)
const pending = new Map()

async function spawnSock(number, dir, { wantCode = false } = {}) {
  const { state, saveCreds } = await useMultiFileAuthState(dir)
  const { version } = await fetchLatestBaileysVersion()
  const sock = makeWASocket({
    logger: pino({ level: 'fatal' }),
    printQRInTerminal: false,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
    msgRetryCounterCache: new NodeCache(),
    browser: ['Windows', 'FireFox'],
    version,
    generateHighQualityLinkPreview: true,
  })
  sock.isInit = false

  const cleanup = () => {
    try { sock.ws.close() } catch {}
    sock.ev.removeAllListeners()
    const i = global.conns.indexOf(sock)
    if (i >= 0) global.conns.splice(i, 1)
  }

  // نفس معالج الرسائل الذي يستخدمه البوت الرئيسي
  const { handler } = await import('./handler.js')
  sock.handler = handler.bind(sock)
  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('messages.upsert', sock.handler)

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      sock.isInit = true
      if (!global.conns.includes(sock)) global.conns.push(sock)
      console.log(chalk.cyanBright(`[ ✿ ] بوت فرعي متصل: +${number}`))
    }
    if (connection === 'close') {
      const reason = lastDisconnect?.error?.output?.statusCode
      const paired = !!sock.authState?.creds?.me
      cleanup()
      if (reason === 440) return // الجلسة مستبدلة بجلسة أخرى
      if (!paired || [DisconnectReason.loggedOut, 401, 403, 405].includes(reason)) return wipe(dir) // فُصل الجهاز أو لم يكتمل الربط
      setTimeout(() => spawnSock(number, dir).catch(console.error), 3000) // إعادة اتصال (يشمل إعادة التشغيل بعد الربط 515)
    }
  })

  if (!wantCode) return null

  // حذف الجلسة إن لم يُدخل المستخدم الكود في الوقت المحدد
  setTimeout(() => {
    if (!sock.user && !sock.authState?.creds?.me) { cleanup(); wipe(dir) }
  }, CODE_TTL)

  await sleep(3000)
  const raw = await sock.requestPairingCode(number)
  return raw.match(/.{1,4}/g)?.join('-') || raw
}

export async function createWebSession(number) {
  if (isLinked(number)) throw new HttpError(409, 'هذا الرقم مربوط بالفعل. افصل الجهاز من واتساب ثم أعد المحاولة.')
  if (pending.has(number)) throw new HttpError(429, 'يوجد طلب قيد التنفيذ لهذا الرقم، انتظر قليلًا.')
  if (global.conns.filter((s) => s?.user).length >= MAX_SESSIONS) throw new HttpError(503, 'لا توجد مساحة متاحة حاليًا، حاول لاحقًا.')

  const dir = path.join(sessionsRoot(), number)
  wipe(dir) // جلسة قديمة غير متصلة: نبدأ من جديد
  fs.mkdirSync(dir, { recursive: true })
  pending.set(number, Date.now())
  setTimeout(() => pending.delete(number), CODE_TTL)
  try {
    return await spawnSock(number, dir, { wantCode: true })
  } catch (e) {
    wipe(dir); pending.delete(number)
    throw e
  }
}

// ===== الخادم =====
const app = express()
app.set('trust proxy', 1)
app.use(express.json({ limit: '1kb' }))

const hits = new Map()
const limited = (ip) => {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60_000)
  arr.push(now); hits.set(ip, arr)
  return arr.length > 5
}
setInterval(() => hits.clear(), 10 * 60_000)

app.post('/api/pair', async (req, res) => {
  if (limited(req.ip)) return res.status(429).json({ error: 'محاولات كثيرة، انتظر قليلًا.' })
  const number = String(req.body?.number || '').replace(/\D/g, '')
  if (number.length < 8 || number.length > 15) return res.status(400).json({ error: 'رقم غير صحيح' })
  try {
    res.json({ code: await createWebSession(number) })
  } catch (e) {
    if (!e.status) console.error(e)
    res.status(e.status || 500).json({ error: e.status ? e.message : 'تعذر إنشاء الكود، حاول بعد قليل.' })
  }
})

app.use(express.static(path.join(__dir, 'public')))
app.listen(PORT, () => console.log(chalk.green(`[ ✿ ] موقع الربط يعمل على المنفذ ${PORT}`)))
