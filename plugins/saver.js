const fs = require('fs');
const path = require('path');

const cmd = require('../command'); // Adjust if needed

cmd({
    pattern: "save",
    desc: "Download and save WhatsApp status (image/video).",
    category: "downloader",
    react: "📥",
    filename: __filename
}, async (conn, m) => {
    try {
        if (!m.quoted) return; // Ignore if no quoted message
        if (m.quoted.chat !== "status@broadcast") return; // Works only for status updates

        let mime = m.quoted.mimetype || "";
        if (!mime.includes("image") && !mime.includes("video")) return; // Ignore non-media

        let media = await m.quoted.download();
        let ext = mime.includes("image") ? "jpg" : "mp4";
        let filePath = path.join(__dirname, `status.${ext}`);

        await fs.promises.writeFile(filePath, media);
        let caption = m.quoted.text || "";

        if (mime.includes("image")) {
            await conn.sendMessage(m.chat, { image: fs.readFileSync(filePath), caption }, { quoted: m });
        } else if (mime.includes("video")) {
            await conn.sendMessage(m.chat, { video: fs.readFileSync(filePath), mimetype: "video/mp4", caption }, { quoted: m });
        }

        fs.unlinkSync(filePath); // Delete after sending
    } catch (err) {
        console.error("❌ Error in .status command:", err);
    }
});
