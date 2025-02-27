const fs = require('fs');
const { cmd, commands } = require('../command'); // Adjusted to match your structure
const { saveStatus } = require('../lib/status-saver'); // Importing the status saver function

cmd({
    pattern: "status",
    desc: "Save and resend a WhatsApp Status (image/video).",
    category: "downloader",
    react: "📥",
    filename: __filename
}, async (conn, m) => {
    try {
        await saveStatus(conn, m); // Call the status saver function
    } catch (err) {
        console.error("❌ Error in .status command:", err);
    }
});
