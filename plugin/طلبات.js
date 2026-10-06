// تطوير وتعديل: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 

let handler = async (m, { conn, isAdmin, isBotAdmin, usedPrefix }) => {
    if (!m.isGroup) return
    if (!(isAdmin || m.isOwner)) {
        let info = '⚠️ هذا الأمر للمشرفين فقط.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
    if (!isBotAdmin) {
        let info = '⚠️ أحتاج لرتبة مشرف لكي أستطيع التحكم في الطلبات.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }

    try {
        // جلب قائمة الطلبات (الأرقام/IDs)
        let response = await conn.groupRequestParticipantsList(m.chat)

        if (!response || response.length === 0) {
            let info = '✨ لا توجد طلبات انضمام معلقة حالياً.'
            return conn.reply(m.chat, info, fkontak, rcanal)
        }

        let txt = `✨ *قـائـمـة طـلـبـات الانـضـمـام الـمـعـلـقـة*\n\n`
        txt += `📦 *الـعـدد الإجـمـالـي:* ${response.length} طـلـبـات\n\n`
        
        response.forEach((user, i) => {
            txt += `*${i + 1} -* ${user.jid.split('@')[0]}\n`
        })

        // إرسال القائمة مع أزرار التحكم الجماعي
        await conn.sendMessage(m.chat, {
            interactiveMessage: {
                body: { text: txt },
                footer: { text: `𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 • 𝐒𝐲𝐬𝐭𝐞𝐦` },
                nativeFlowMessage: {
                    buttons: [
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "✅ قـبـول الـكـل",
                                id: `${usedPrefix}قبول_الكل`
                            })
                        },
                        {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: "❌ رفـض الـكـل",
                                id: `${usedPrefix}رفض_الكل`
                            })
                        }
                    ]
                }
            }
        }, { quoted: m })

    } catch (err) {
        console.error(err)
        let info = '❌ حدث خطأ أثناء جلب الطلبات.'
        return conn.reply(m.chat, info, fkontak, rcanal)
    }
}

// معالج عمليات القبول والرفض الجماعي
handler.before = async (m, { conn, isAdmin, isBotAdmin }) => {
    if (!m.text || !m.isGroup || !isAdmin || !isBotAdmin) return
    
    let action;
    if (m.text.includes('قبول_الكل')) action = 'approve'
    else if (m.text.includes('رفض_الكل')) action = 'reject'
    else return

    try {
        let response = await conn.groupRequestParticipantsList(m.chat)
        if (!response || response.length === 0) return
        
        let users = response.map(u => u.jid)
        await conn.groupRequestParticipantsUpdate(m.chat, users, action)
        
        let info = `✅ تم ${action === 'approve' ? 'قـبـول' : 'رفـض'} جميع الطلبات (${users.length}) بنجاح.`
        return conn.reply(m.chat, info, fkontak, rcanal)
    } catch (e) {
        console.error(e)
    }
}

handler.help = ['طلبات']
handler.tags = ['الـمـشـرفـيـن']
handler.command = ['طلبات', 'الطلبات']
handler.group = true

export default handler
