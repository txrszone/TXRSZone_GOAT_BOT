module.exports = {
  config: {
    name: "autoreply",
    version: "1.0.0",
    author: "OMOR TE",
    role: 0,
    shortDescription: "Auto reply to specific words",
    category: "noprefix"
  },

  onEvent: async function ({ api, event, message }) {
    const { body, senderID } = event;
    
    if (senderID === api.getCurrentUserID()) return;
    if (!body) return;
    
    const msg = body.toLowerCase().trim();
    
    // ✅ একাধিক রিপ্লাই (র্যান্ডম)
    const replies = {
      "hi": ["Hello! 👋", "Hi there! 😊", "Hey! How are you?", "Namaste! 🙏"],
      "hello": ["Hello! 👋", "Hi there! 😊", "Hey! How are you?", "Namaste! 🙏"],
      "how are you": ["I'm fine! 🤖", "Doing great! 😊", "All good! How about you?", "I'm always fine! 💪"],
      "thanks": ["Welcome! ❤️", "My pleasure! 😊", "Anytime! 🤗", "You're welcome! 👍"],
      "bye": ["Goodbye! 👋", "See you! 😊", "Take care! ❤️", "Bye bye! 👋"], "fork": ["⚡ MW Legends; latest"
    };
    
    for (const [keyword, responseList] of Object.entries(replies)) {
      if (msg === keyword || msg.includes(keyword)) {
        const randomReply = responseList[Math.floor(Math.random() * responseList.length)];
        return message.reply(randomReply);
      }
    }
  }
};
