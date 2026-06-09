module.exports = {
  config: {
    name: "reply",
    version: "1.0.0",
    author: "OMOR TE",
    role: 2,
    shortDescription: "Reply to user",
    longDescription: "Send a reply to a user who sent a notice reply",
    category: "owner",
    guide: "{p}{n} <userID> <message>"
  },

  onStart: async function ({ api, event, args }) {
    const userID = args[0];
    const msg = args.slice(1).join(" ");
    
    if (!userID || !msg) {
      return api.sendMessage(`❌ Usage: reply <userID> <message>\n📝 Example: reply 100071151280531 Hello!`, event.threadID);
    }
    
    try {
      await api.sendMessage(`📩 Reply from Admin:\n━━━━━━━━━━━━━━━━━━━━\n📝 ${msg}\n━━━━━━━━━━━━━━━━━━━━\n☸️ MW Legends Bot ⚡`, userID);
      api.sendMessage(`✅ Reply sent to user ${userID}`, event.threadID);
    } catch(e) {
      api.sendMessage(`❌ Failed to send reply: ${e.message}`, event.threadID);
    }
  }
};
