module.exports = {
  config: {
    name: "fork",
    version: "1.0.0",
    author: "OMOR TE",
    role: 0,
    shortDescription: "Send bot's repository info",
    category: "without prefix"
  },

  onEvent: async function ({ api, event }) {
    const { body, senderID, threadID, messageID } = event;
    
    // নিজের মেসেজ ইগনোর
    if (senderID === api.getCurrentUserID()) return;
    if (!body) return;
    
    const msg = body.toLowerCase().trim();
    
    // কীওয়ার্ড চেক
    if (msg === "fork" || msg.includes("fork")) {
      const replyText = "⚡ MW Legends; Latest\nhttps://mw-legends-chatbot.lovable.app/";
      // api.sendMessage ব্যবহার করা নিরাপদ
      return api.sendMessage(replyText, threadID, messageID);
    }
  }
};
