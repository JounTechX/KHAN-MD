const { cmd } = require('../command');
const config = require('../config');

// Advanced regex to detect ALL types of links, even plain text ones (example.com)
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
    // Ignore if not a group, admin, or bot is not an admin
    if (!isGroup || isAdmins || !isBotAdmins) {
      return;
    }

    // Check if message contains a link
    if (urlPattern.test(body) && config.DELETE_LINKS === 'true') {
      for (let i = 0; i < 5; i++) {  // Retry up to 5 times to ensure deletion
        await conn.sendMessage(from, { delete: m.key });
      }
    }
  } catch (error) {
    console.error('Error in link deletion:', error);
  }
});
