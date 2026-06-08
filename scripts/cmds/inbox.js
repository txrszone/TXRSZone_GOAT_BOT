module.exports = {
  config: {
    name: "inbox",
    aliases: ["in"],
    version: "1.0",
    author: "Omor TE",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: "hello goatbot inbox no prefix file enjoy the cmmand"
    },
    longDescription: {
      en: ""
    },
    category: "fun",
    guide: {
      en: ""
    }
  },
  langs: {
    en: {
      gg: ""
    },
    id: {
      gg: ""
    }
  },
  onStart: async function({ api, event, args, message }) {
    try {
      const query = encodeURIComponent(args.join(' '));
      message.reply("✅ SUCCESSFULLY SEND MSG\n\n🔰 Kindly check your inbox", event.threadID);
      api.sendMessage("✅ SUCCESSFULLY ALLOW\n\n🔰 You can now use the bot", event.senderID);
    } catch (error) {
      console.error("Error bro: " + error);
    }
  }
}
