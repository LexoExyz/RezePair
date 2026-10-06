import { watchFile, unwatchFile } from "fs"
import chalk from "chalk"
import { fileURLToPath } from "url"
import fs from "fs"
import { prepareWAMessageMedia } from '@whiskeysockets/baileys'

global.botNumber = "" 
global.owner = ["212696987737", "212648377456"]
global.suittag = ["212696987737"] 
global.prems = ["212696987737"]


global.vs = "^1 • Latest"
global.sessions = "Sessions/Principal"
global.jadi = "Sessions/SubBot"
global.kanekiAIJadibts = true

global.botname = "𖹭  ׄ  ְ 🍃 𝐑𝐞𝐳𝐞 › 𝐁𝐨𝐭 ✩"
global.namebot = "𝐑𝐞𝐳𝐞𝐁𝐨𝐭, ᑲᥡ 𝙻𝙴𝚇𝙾𝙴𝚈𝚉 ˙ꨂﾟ"
global.dev = "© mᥲძᥱ ᑲᥡ 𝐥𝐞𝐱𝐨"
global.author = "ƈαɾʅσʂ.ɾʋ"
global.etiqueta = "✫ 𝐿𝐸𝑋𝑂𝐸𝑌𝑍  ⊹꙰ "
global.currency = "g᥆𝗍іᥴᥲs"
global.banner = "https://files.catbox.moe/0a9fq6.jpg"
global.icono = "https://files.catbox.moe/6e8m80.jpg"

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*


global.links = {
  group: "https://chat.whatsapp.com/LCLYalnd56n2s5MBIgcSFR?s=cl&p=a&mlu=4&ilr=4",
  community: "https://chat.whatsapp.com/LCLYalnd56n2s5MBIgcSFR?s=cl&p=a&mlu=4&ilr=4",
  channel: "https://whatsapp.com/channel/0029VbDby949WtC6u3UcOg1J",
  github: "https://github.com/LexoExyz/RezeBot-MD",
  gmail: "publexo@gmail.com",
  api: "https://nexus-light.onrender.com/",
}

global.ch = {
  ch1: "120363430108854249@newsletter",
  ch2: "120363430108854249@newsletter"
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

global.gojo = prepareWAMessageMedia
global.APIs = {
vreden: { url: "https://api.vreden.web.id", key: null },
delirius: { url: "https://api.delirius.store", key: null },
siputzx: { url: "https://api.siputzx.my.id", key: null },
stellar: { url: "https://api.stellarwa.xyz", key: "this-xyz"},
light: { url: "https://nexus-light-7uyb.onrender.com", key: "shadow" } // poble att: el creador 
}

//*─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
unwatchFile(file)
console.log(chalk.redBright("Update 'settings'"))
import(`${file}?update=${Date.now()}`)
})
