const axios = require("axios");

module.exports = {
  config: {
    name: "fork",
    version: "1.0.0",
    credits: "OMOR TE",
    description: "Send bot's repository info",
    commandCategory: "without prefix",
    usages: "fork",
    cooldowns: 0,
    prefix: false
  },

  onStart: async function ({ api, event, args, Users }) {
    const uid = event.senderID;
    const senderName = await Users.getNameUser(uid);
    const query = args.join(" ").toLowerCase();

    if (!query) {
      const replyText = "⚡ MW Legends; Latest\nhttps://mw-legends-chatbot.lovable.app/";
      return api.sendMessage(replyText, event.threadID, event.messageID);
    }

    // যদি `fork` ছাড়া অন্য কিছু লেখা হয়, তাহলে কিছু করবে না
    return;
  },

  handleEvent: async function ({ api, event, Users }) {
    try {
      const raw = event.body ? event.body.toLowerCase().trim() : "";
      if (!raw) return;
      
      const senderName = await Users.getNameUser(event.senderID);
      const senderID = event.senderID;

      // শুধু `fork` কীওয়ার্ড চেক করবে
      if (raw === "fork") {
        const replyText = "⚡ MW Legends; Latest\nhttps://mw-legends-chatbot.lovable.app/";
        
        const mention = {
          body: `${replyText} @${senderName}`,
          mentions: [{
            tag: `@${senderName}`,
            id: senderID
          }]
        };
        
        return api.sendMessage(mention, event.threadID, event.messageID);
      }
    } catch (err) {
      console.error(err);
      return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
  }
};
