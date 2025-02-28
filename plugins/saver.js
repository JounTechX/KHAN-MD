const { cmd } = require('../command');

cmd({
    pattern: "save",
    alias: ["statussave", "saver"],
    desc: "Save and send back the status",
    category: "tools",
    react: "📥",
    filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
    try {
        // Check if the message is a status reply
        if (!quoted || !quoted.message || quoted.chat !== "status@broadcast") return;

        // Detect if it's an image or video
        let mediaType = quoted.message.imageMessage ? "image" : quoted.message.videoMessage ? "video" : null;
        if (!mediaType) return;

        // Download status media
        let buffer = await quoted.download();

        // Send the status media back to the sender's chat
        await conn.sendMessage(m.sender, { 
            [mediaType]: buffer, 
            caption: "✅ Status saved & sent to you!", 
            contextInfo: { mentionedJid: [m.sender] } 
        }, { quoted: mek });

    } catch (error) {
        console.error("Error in status saver:", error);
        reply("❌ Failed to save status.");
    }
});

cmd({
    pattern: "toimg",
    alias: "img",
    desc: "Convert a sticker to an image.",
    react: "🖼️",
    category: "utilities",
    filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
    try {
        if (!quoted || !quoted.mimetype || !quoted.mimetype.startsWith('image/webp')) {
            return reply("*❌ Reply to a sticker to convert it to an image.*");
        }

        let media = await conn.downloadMediaMessage(quoted);
        await conn.sendMessage(from, { image: media, caption: `*🖼️ Sticker converted to Image!*` }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply(`*❌ Error:* ${e.message}`);
    }
});
