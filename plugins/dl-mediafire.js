const { cmd } = require('../command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: "mediafire",
    alias: ["mf", "mfire"],
    desc: "Download APK/ZIP files from MediaFire",
    category: "downloader",
    react: "📂",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a MediaFire link.\nExample: `.mediafire <link>`");

        const apiUrl = `https://api.ryzendesu.vip/api/downloader/mediafire?url=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.download) {
            await react("❌");
            return reply("Failed to fetch the MediaFire file. Please check the link and try again.");
        }

        const fileUrl = data.download;
        const fileName = data.filename || "Unknown_File";
        const fileSize = data.size || "Unknown Size";
        const fileType = data.filetype || "Unknown Type";
        const filePath = path.join(__dirname, "..", "temp", fileName);

        await react("⏳");
        const fileResponse = await axios({
            url: fileUrl,
            method: 'GET',
            responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        fileResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        const caption = `📂 *MediaFire File Downloadeder* 📂\n\n` +
                        `📌 *File Name:* ${fileName}\n` +
                        `📏 *Size:* ${fileSize}\n` +
                        `📄 *Type:* ${fileType}\n\n` +
                        `🔹 *Powered By KHAN MD*`;

        await conn.sendMessage(from, {
            document: { url: filePath },
            mimetype: "application/octet-stream",
            fileName: fileName,
            caption: caption
        }, { quoted: mek });

        fs.unlinkSync(filePath); // Delete the file after sending
        await react("✅");

    } catch (e) {
        console.error("Error in MediaFire downloader command:", e);
        await react("❌");
        reply("An error occurred while downloading the file.");
    }
});
