const { cmd } = require('../command');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const fs = require('fs');
const path = require('path');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

cmd({
    pattern: "tomp3",
    desc: "Convert a video to MP3 format.",
    react: "🎵",
    category: "utilities",
    filename: __filename
}, async (conn, mek, m, { from, quoted, reply }) => {
    try {
        if (!quoted || !quoted.mimetype || !quoted.mimetype.startsWith('video/')) {
            return reply("*❌ Reply to a video to convert it to MP3.*");
        }

        let media = await conn.downloadMediaMessage(quoted);
        let inputPath = path.join(__dirname, '../temp/input.mp4');
        let outputPath = path.join(__dirname, '../temp/output.mp3');

        fs.writeFileSync(inputPath, media);
        ffmpeg(inputPath)
            .toFormat('mp3')
            .on('end', async () => {
                let audioData = fs.readFileSync(outputPath);
                await conn.sendMessage(from, {
                    document: audioData,
                    mimetype: 'audio/mpeg',
                    fileName: 'converted.mp3',
                    caption: `*🎵 MP3 file generated successfully!*`
                }, { quoted: mek });

                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            })
            .on('error', (err) => {
                console.error(err);
                reply(`*❌ Error:* Failed to convert video.`);
            })
            .save(outputPath);

    } catch (e) {
        console.error(e);
        reply(`*❌ Error:* ${e.message}`);
    }
});
