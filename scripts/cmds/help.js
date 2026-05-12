const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

module.exports = {
  config: {
    name: "help",
    version: "2.00",
    author: "Omor TE",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Show all commands"
    },
    longDescription: {
      en: "View command usage and list all commands"
    },
    category: "info",
    guide: {
      en: "{p}help / {p}help <cmd>"
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "";

      // Header
      msg += `╭─❅─❅─❅─❅─❅─╮\n`;
      msg += `│  ✨ 𝗛𝗘𝗟𝗣 𝗠𝗘𝗡𝗨 ✨  │\n`;
      msg += `╰─❅─❅─❅─❅─❅─╯\n\n`;

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;
        const cmdCategory = value.config.category || "Other";
        if (!categories[cmdCategory]) categories[cmdCategory] = [];
        categories[cmdCategory].push(name);
      }

      // Categories sorted
      const sortedCategories = Object.keys(categories).sort();
      
      for (const catName of sortedCategories) {
        if (catName === "info") continue;
        
        msg += `◇─────◇ ${catName.toUpperCase()} ◇─────◇\n`;
        const names = categories[catName].sort();
        let line = "";
        
        for (let i = 0; i < names.length; i++) {
          line += `  ${names[i]}`;
          if ((i + 1) % 3 === 0 || i === names.length - 1) {
            msg += line + "\n";
            line = "";
          }
        }
        msg += `◇───────────────◇\n\n`;
      }

      const totalCommands = commands.size;
      msg += `📊 𝗧𝗢𝗧𝗔𝗟 𝗖𝗠𝗗𝗦: ${totalCommands}\n`;
      msg += `💡 𝗧𝗬𝗣𝗘: ${prefix}help <command>\n`;
      msg += `━━━━━━━━━━━━━━━━━━━━\n`;
      msg += `✨ 𝗠𝗪 𝗟𝗲𝗴𝗲𝗻𝗱𝘀 𝗕𝗼𝘁 ✨\n`;

      const helpImages = [
        "https://i.postimg.cc/0jRGknT9/FB-IMG-1744474199349.jpg",
        "https://i.postimg.cc/Y9KK7KC0/Polish-20250526-101350151.jpg",
        "https://i.postimg.cc/VNvjbDPq/Image-Download-26-05-2025-09-56-48.jpg",
        "https://i.postimg.cc/brgK1ZHS/Hitube-c-Rb-Pat-Cm-XZ-2025-05-26-10-05-46.jpg"
      ];
      const randomImg = helpImages[Math.floor(Math.random() * helpImages.length)];

      await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(randomImg)
      });
      
    } else {
      // Single command info
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        return message.reply(`❌ "${commandName}" খুঁজে পাওয়া যায়নি।`);
      }

      const cfg = command.config;
      const roleText = getRoleText(cfg.role);
      
      let guideText = "No guide available";
      if (cfg.guide) {
        if (typeof cfg.guide === 'object') {
          guideText = cfg.guide.en || Object.values(cfg.guide)[0];
        } else {
          guideText = cfg.guide;
        }
      }
      const usage = guideText.replace(/{p}/g, prefix).replace(/{n}/g, cfg.name);

      const response = `
╭─❅─❅─❅─❅─╮
│  📌 ${cfg.name.toUpperCase()}  │
╰─❅─❅─❅─❅─╯

📦 ${cfg.category || "Other"}
📝 ${cfg.description || cfg.shortDescription?.en || "No description"}
👑 ${cfg.author || "Unknown"}

📖 𝗨𝗦𝗔𝗚𝗘:
${usage}

🔄 𝗩𝗲𝗿𝘀𝗶𝗼𝗻: ${cfg.version || "1.0"}
🔐 𝗥𝗼𝗹𝗲: ${roleText}
━━━━━━━━━━━━━━━━━━━━`;

      await message.reply(response);
    }
  }
};

function getRoleText(role) {
  if (role === 0) return "👤 সবাই";
  if (role === 1) return "👑 গ্রুপ এডমিন";
  if (role === 2) return "⚡ বট এডমিন";
  return "❓ অজানা";
}
