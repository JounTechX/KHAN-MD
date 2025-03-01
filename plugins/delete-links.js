const { cmd } = require('../command');
const config = require('../config');

// Universal regex to detect any type of link
const urlPattern = /\b(?:https?:\/\/|www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,}){1,3}(?:\/[^\s]*)?/gi;

// Message queue to process link deletions one by one
const deleteQueue = [];

// Function to process the queue
async function processQueue(conn, from) {
  while (deleteQueue.length > 0) {
    const m = deleteQueue.shift(); // Get the first message in the queue

    try {
      await conn.sendMessage(from, { delete: m.key });
      console.log(`✅ Deleted message from ${m.sender}`);
    } catch (error) {
      console.error(`❌ Failed to delete message, retrying...`, error);
      deleteQueue.push(m); // Re-add to queue for another attempt
    }

    await new Promise(resolve => setTimeout(resolve, 1500)); // Controlled delay (1.5 seconds per delete)
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
    // Ensure bot is an admin & sender is NOT an admin
    if (!isGroup || !isBotAdmins || isAdmins) {
      return; // Exit if bot is not admin or sender is admin
    }

    // Check if message contains a link
    if (urlPattern.test(body) && config.DELETE_LINKS === 'true') {
      deleteQueue.push(m); // Add message to queue

      if (deleteQueue.length === 1) {
        processQueue(conn, from); // Start processing only if queue was empty
      }
    }
  } catch (error) {
    console.error('Critical error in link deletion:', error);
  }
});
