module.exports = {
  config: {
    name: "fork",
    version: "1.0.0",
    author: "Omor TE",
    countDown: 0,
    role: 0,
    shortDescription: "Send bot's repository info",
    longDescription: "Send bot's repository info",
    category: "without prefix"
  },

  onChat: async function ({ api, event }) {
    try {
      const raw = event.body ? event.body.toLowerCase().trim() : "";
      if (!raw) return;

      if (raw === "fork") {
        return api.sendMessage(
          "⚡ MW Legends; Latest",
          event.threadID,
          event.messageID
        );
      }

    } catch (err) {
      console.error(err);
    }
  }
};
