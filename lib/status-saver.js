const fs = require('fs');

async function saveStatus(conn, m) {
    try {
        if (!m.quoted || !m.quoted.key || !m.quoted.mimetype) return;

        let mime = m.quoted.mimetype || "";
        if (!mime.includes("image") && !mime.includes("video")) return;

        // Ensure it's a WhatsApp Status update
        if (!m.quoted.key.remoteJid || !m.quoted.key.remoteJid.endsWith("status@broadcast")) return;

        let media = await m.quoted.download();
        let extension = mime.includes("image") ? "jpg" : "mp4";
        let filePath = `./status.${extension}`;

        await fs.promises.writeFile(filePath, media);
        let caption = m.quoted.text || "";

        if (mime.includes("image")) {
            await conn.sendMessage(m.chat, { image: fs.readFileSync(filePath), caption }, { quoted: m });
        } else if (mime.includes("video")) {
            await conn.sendMessage(m.chat, { video: fs.readFileSync(filePath), mimetype: "video/mp4", caption }, { quoted: m });
        }

        fs.unlinkSync(filePath); // Delete file after sending
    } catch (err) {
        console.error("❌ Error in saveStatus:", err);
    }
}

module.exports = { saveStatus };
