const { cmd } = require('../command');
const config = require('../config');

// Stronger regex for ALL links (detects even text-based links)
const urlPattern = /\b(?:https?:\/\/|www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,}){1,3}(?:\/[^\s]*)?/gi;

// Message queue for handling deletions one by one
const deleteQueue = [];

// Function to delete messages with retry logic
async function processQueue(conn, from) {
  while (deleteQueue.length > 0) {
    const { message, retries } = deleteQueue.shift(); // Get first message

    try {
      await conn.sendMessage(from, { delete: message.key });
      console.log(`✅ Deleted message from ${message.sender}`);
    } catch (error) {
      console.error(`❌ Failed to delete, retrying... (${retries})`, error);
      
      if (retries < 3) { // Retry max 3 times
        deleteQueue.push({ message, retries: retries + 1 });
      }
    }

    await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay per delete (prevents WhatsApp limits)
  }
}

cmd({
  on: 'body'
}, async (conn, m, store, {
  from,
  body,
  sender,
  isGroup,
  isAdmins,
  isBotAdmins
}) => {
  try {
    // Ensure bot is admin & sender is NOT admin
    if (!isGroup || !isBotAdmins || isAdmins) {
      return;
    }

    // Check if message contains a link
    if (urlPattern.test(body) && config.DELETE_LINKS === 'true') {
      deleteQueue.push({ message: m, retries: 0 }); // Add to queue with 0 retries

      if (deleteQueue.length === 1) {
        processQueue(conn, from); // Start processing if queue was empty
      }
    }
  } catch (error) {
    console.error('Critical error in link deletion:', error);
  }
});
