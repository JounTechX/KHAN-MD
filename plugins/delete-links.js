const { cmd } = require('../command');
const config = require('../config');

// Detects all types of links
const urlPattern = /\b(?:https?:\/\/|www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,}){1,3}(?:\/[^\s]*)?/gi;

const deleteQueue = [];
let isProcessing = false;

// Function to process deletion queue
async function processQueue(conn, from) {
  if (isProcessing) return;
  isProcessing = true;

  while (deleteQueue.length > 0) {
    const { message, retries } = deleteQueue.shift();

    try {
      await conn.sendMessage(from, { delete: message.key });
      console.log(`✅ Deleted: ${message.sender}`);
    } catch (error) {
      console.error(`❌ Deletion failed, retrying (${retries})...`, error);

      if (retries < 5) { // Retry up to 5 times
        deleteQueue.push({ message, retries: retries + 1 });
      }
    }

    await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 1500) + 500)); // Random delay (500-2000ms)
  }

  isProcessing = false;
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
    if (!isGroup || !isBotAdmins || isAdmins) {
      return;
    }

    if (urlPattern.test(body) && config.DELETE_LINKS === 'true') {
      deleteQueue.push({ message: m, retries: 0 });

      if (!isProcessing) {
        processQueue(conn, from);
      }
    }
  } catch (error) {
    console.error('Error in link deletion:', error);
  }
});
