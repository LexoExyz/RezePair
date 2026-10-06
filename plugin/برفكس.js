// تعريب وتعديل: 𝒚𝒖𝒕𝒂 𝒃𝒐𝒕 
const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    let info = `❀ لـم يـتـم إدخـال أي بـريـفـكـس. يـرجـى كـتـابـة الـرمـز الـذي تـريـده.\n> *مثال: ${usedPrefix + command} #*`
    return conn.reply(m.chat, info, fkontak, rcanal)
  }

  // تحديث البريفكس عالمياً في البوت
  global.prefix = new RegExp('^[' + (text || global.opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');

  let info = `ꕥ تـم تـحـديث الـبـريـفـكـس بـنـجـاح.\nالـرمـز الـجـديـد ➩ ${text}`
  return conn.reply(m.chat, info, fkontak, rcanal)
};

handler.help = ['برفكس']
handler.command = ['برفكس', 'الرمز', 'البريفكس']
handler.tags = ['الـمـطـور']
handler.owner = true // حصري للمطور

export default handler;
