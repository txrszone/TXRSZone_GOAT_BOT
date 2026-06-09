const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "1.5",
    author: "OMOR TE",
    countDown: 5,
    role: 0,
    description: "Change bot prefix in your group or system",
    category: "config",
    guide: {
      en: "{p}{n} <new prefix> - change group prefix\n{p}{n} <new prefix> -g - change system prefix\n{p}{n} reset - reset to default"
    }
  },

  langs: {
    en: {
      reset: "✅ Prefix has been reset to default: `%1`",
      onlyAdmin: "❌ Only bot admin can change system prefix",
      confirmGlobal: "⚠️ Please react to this message to confirm changing **SYSTEM PREFIX** to: `%1`",
      confirmThisThread: "⚠️ Please react to this message to confirm changing **GROUP PREFIX** to: `%1`",
      successGlobal: "✅ System prefix changed to: `%1`",
      successThisThread: "✅ Group prefix changed to: `%1`",
      myPrefix: `
╭──────────────╮
│     🔧 PREFIX INFO     │
╰──────────────╯

      🌐 𝗦𝘆𝘀𝘁𝗲𝗺 𝗣𝗿𝗲𝗳𝗶𝘅:
          └─ ${global.GoatBot.config.prefix}

      🛸 𝗚𝗿𝗼𝘂𝗽 𝗣𝗿𝗲𝗳𝗶𝘅:
          └─ ${utils.getPrefix(event.threadID)}

━━━━━━━━━━━━━━━━━━━━━━━━━━
   💡 Type \`${utils.getPrefix(event.threadID)}help\` for commands
━━━━━━━━━━━━━━━━━━━━━━━━━━
         ⚓ MW Legends ☸️`
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    // শুধু prefix লিখলে স্ট্যাটাস দেখাবে (সুন্দর বক্সে)
    if (!args[0]) {
      return message.reply(getLang("myPrefix"));
    }

    if (args[0] === 'reset') {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const formSet = {
      commandName,
      author: event.senderID,
      newPrefix
    };

    if (args[1] === "-g") {
      if (role < 2) {
        return message.reply(getLang("onlyAdmin"));
      } else {
        formSet.setGlobal = true;
        return message.reply(getLang("confirmGlobal", newPrefix), (err, info) => {
          formSet.messageID = info.messageID;
          global.GoatBot.onReaction.set(info.messageID, formSet);
        });
      }
    } else {
      formSet.setGlobal = false;
      return message.reply(getLang("confirmThisThread", newPrefix), (err, info) => {
        formSet.messageID = info.messageID;
        global.GoatBot.onReaction.set(info.messageID, formSet);
      });
    }
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    const { author, newPrefix, setGlobal } = Reaction;
    if (event.userID !== author) return;
    
    if (setGlobal) {
      global.GoatBot.config.prefix = newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", newPrefix));
    } else {
      await threadsData.set(event.threadID, newPrefix, "data.prefix");
      return message.reply(getLang("successThisThread", newPrefix));
    }
  },

  onChat: async function ({ event, message, getLang }) {
    if (event.body && event.body.toLowerCase() === "prefix") {
      return message.reply(getLang("myPrefix"));
    }
  }
};
