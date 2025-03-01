const { cmd } = require('../command');
const config = require('../config');

// Universal regex to detect all types of links, even plain text (example.com)
const urlPattern = /\b(?:https?:\/\/|www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,}){1,3}(?:\/[^\s]*)?/gi;

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
    // Ensure the bot is an admin and the sender is NOT an admin
    if (!isGroup || !isBotAdmins || isAdmins) {
      return; // Exit if bot is not an admin or if the sender is an admin
    }

    // Check if the message contains a link
    if (urlPattern.test(body) && config.DELETE_LINKS === 'true') {
      let deleted = false;

      // Try deleting up to 5 times, with a slight delay between each attempt
      for (let i = 0; i < 5; i++) {
        setTimeout(async () => {
          if (!deleted) {
            await conn.sendMessage(from, { delete: m.key });
            deleted = true; // Mark as deleted to avoid unnecessary retries
          }
        }, i * 500); // Small delay to ensure proper execution (500ms per attempt)
      }
    }
  } catch (error) {
    console.error('Error in link deletion:', error);
  }
});
