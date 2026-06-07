module.exports = {
  config: {
    name: "fork",
    version: "1.0.0",
    author: "OMOR TE",
    role: 0,
    shortDescription: "Send bot's repository info",
    category: "without prefix"
  },

  onEvent: async function ({ api, event, message }) {
    const { body, senderID } = event;
    
    if (senderID === api.getCurrentUserID()) return;
    if (!body) return;
    
    const msg = body.toLowerCase().trim();
    
    // fake fork info
    const replies = {
      "fork": ["⚡ MW Legends; Latest"]
    };
    
    for (const [keyword, responseList] of Object.entries(replies)) {
      if (msg === keyword || msg.includes(keyword)) {
        const randomReply = responseList[Math.floor(Math.random() * responseList.length)];
        return message.reply(randomReply);
      }
    }
  }
};
