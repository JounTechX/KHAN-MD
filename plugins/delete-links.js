const { cmd } = require('../command');
const config = require('../config');

// Ultimate regex to detect all links, even text-based (example.com)
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
    // Ensure bot is an admin & sender is NOT an admin
    if (!isGroup || !isBotAdmins || isAdmins) {
      return; // Exit if bot is not admin or sender is admin
    }

    // Check if message contains a link
    if (urlPattern.test(body) && config.DELETE_LINKS === 'true') {
      let deleted = false;
      let attempt = 0;

      // Exponential backoff retry mechanism (ensures deletion)
      while (!deleted && attempt < 5) {
        try {
          await conn.sendMessage(from, { delete: m.key });
          deleted = true; // Mark as deleted to prevent extra retries
        } catch (err) {
          console.error(`Attempt ${attempt + 1}: Failed to delete, retrying...`);
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 200)); // 200ms, 400ms, 800ms, etc.
        }
        attempt++;
      }
    }
  } catch (error) {
    console.error('Critical error in link deletion:', error);
  }
});
