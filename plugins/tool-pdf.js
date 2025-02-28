const { cmd } = require('../command');
const PDFDocument = require('pdfkit');

cmd({
    pattern: "topdf",
    alias: "pdf",
    desc: "Convert provided text to a PDF file.",
    react: "📄",
    category: "utilities",
    filename: __filename
}, async (conn, mek, m, { from, quoted, args, q, reply }) => {
    try {
        if (!q) return reply("*❌ Please provide text to convert into a PDF.*");

        const doc = new PDFDocument();
        let buffers = [];

        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', async () => {
            const pdfData = Buffer.concat(buffers);

            await conn.sendMessage(from, {
                document: pdfData,
                mimetype: 'application/pdf',
                fileName: 'JawadTech.pdf',
                caption: `*📄 PDF created successfully!*\n\n> © Created By JawadTechX 💜`
            }, { quoted: mek });
        });

        // Add user-provided text to the PDF
        doc.fontSize(14).text(q, { align: 'left' });

        // Finalize the PDF
        doc.end();

    } catch (e) {
        console.error(e);
        reply(`*❌ Error:* ${e.message}`);
    }
});
