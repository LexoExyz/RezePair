// تطوير وتعديل: 𝑹𝒆𝒛𝒆 
import { canLevelUp, xpRange } from '../lib/levelling.js'

let handler = async (m, { conn }) => {
    let mentionedJid = m.mentionedJid
    let who = mentionedJid[0] || (m.quoted ? m.quoted.sender : m.sender)
    let user = global.db.data.users[who]
    
    // جلب اسم المستخدم بمرونة
    let name = user.name || await conn.getName(who)
    
    if (!user) {
        let info = "ꕥ عذراً، لم يتم العثور على بيانات لهذا المستخدم."
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    let { min, xp } = xpRange(user.level, global.multiplier)
    let before = user.level * 1

    // التحقق من إمكانية رفع المستوى
    while (canLevelUp(user.level, user.exp, global.multiplier)) user.level++

    if (before !== user.level) {
        let info = `ᥫ᭡ تـهـانـيـنـا! لـقـد ارتـفـع مـسـتـواك.\n\n`
        info += `*${before}* ➔ *${user.level}*\n\n`
        info += `• ✰ *الـمـسـتـوى الـسـابـق* : ${before}\n`
        info += `• ✧ *الـمـسـتـوى الـجـديـد* : ${user.level}\n`
        info += `• ❖ *الـتـاريـخ* : ${new Date().toLocaleDateString('ar-EG')}\n\n`
        info += `> ➨ ملاحظة: *كلما زاد تفاعلك مع البوت، زاد مستواك.*`
        
        return conn.reply(m.chat, info, fkontak, rcanal)
        
    } else {
        // حساب الترتيب
        let users = Object.entries(global.db.data.users).map(([key, value]) => {
            return { ...value, jid: key }
        })
        let sortedLevel = users.sort((a, b) => (b.level || 0) - (a.level || 0))
        let rank = sortedLevel.findIndex(u => u.jid === who) + 1
        
        let percent = Math.floor(((user.exp - min) / xp) * 100)
        
        let info = `*「✦」الـمـسـتـخـدم* ◢ ${name} ◤\n\n`
        info += `✧ الـمـسـتـوى » *${user.level}*\n`
        info += `✰ الـخـبـرة » *${user.exp}*\n`
        info += `➨ الـتـقـدم » *${user.exp - min} => ${xp}* _(${percent}%)_\n`
        info += `# الـتـرتـيـب » *${rank}* مـن أصـل *${sortedLevel.length}*\n`
        info += `❒ إجـمـالـي التفاعل » *${user.commands || 0}*`

        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

handler.help = ['ليفل']
handler.tags = ['الـأعـضـاء']
handler.command = ['ليفل', 'مستوى', 'lvl', 'level', 'levelup']
handler.group = true

export default handler
