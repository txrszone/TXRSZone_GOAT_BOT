const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ OMOR TE ]"; 

module.exports = {
  config: {
    name: "help",
    version: "2.00",
    author: "Omor TE",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "View command usage and list all commands directly",
    },
    longDescription: {
      en: "View command usage and list all commands directly",
    },
    category: "info",
    guide: {
      en: "{p}help <cmdName> ",
    },
    priority: 1,
  },

  onStart: async function ({ message, args, event, threadsData, role }) {
    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    const prefix = getPrefix(threadID);

    if (args.length === 0) {
      const categories = {};
      let msg = "╭───────❁";

      msg += `\n│ 𝗛𝗘𝗟𝗣 𝗟𝗜𝗦𝗧\n╰────────────❁`; 

      for (const [name, value] of commands) {
        if (value.config.role > 1 && role < value.config.role) continue;

        const cmdCategory = value.config.category || "Uncategorized";
        categories[cmdCategory] = categories[cmdCategory] || { commands: [] };
        categories[cmdCategory].commands.push(name);
      }

      Object.keys(categories).forEach((catName) => {
        if (catName !== "info") {
          msg += `\n╭─────✰『  ${catName.toUpperCase()}  』`;

          const names = categories[catName].commands.sort();
          for (let i = 0; i < names.length; i += 3) {
            const cmds = names.slice(i, i + 2).map((item) => `⭔${item}`);
            msg += `\n│${cmds.join(" ".repeat(Math.max(1, 5 - cmds.join("").length)))}`;
          }

          msg += `\n╰────────────✰`;
        }
      });

      const totalCommands = commands.size;
      msg += `\n\n╭─────✰𝗘𝗡𝗝𝗢𝗬!\n│>𝗧𝗢𝗧𝗔𝗟 𝗖𝗠𝗗𝗦: [${totalCommands}].\n│𝗧𝗬𝗣𝗘𝖳:[ ${prefix}𝗛𝗘𝗟𝗣 <CMD>\n│ 𝗧𝗢 𝗟𝗘𝗔𝗥𝗡 𝗧𝗛𝗘 𝗨𝗦𝗔𝗚𝗘.]\n╰────────────✰`;
      msg += ``;
      msg += `\n╭─────✰\n│ ♥︎╣[❉Omor TE❉]╠♥︎\n╰────────────✰`; 

      const helpListImages = [ "https://i.postimg.cc/0jRGknT9/FB-IMG-1744474199349.jpg", "https://i.postimg.cc/Y9KK7KC0/Polish-20250526-101350151.jpg", "https://i.postimg.cc/VNvjbDPq/Image-Download-26-05-2025-09-56-48.jpg", "https://i.postimg.cc/brgK1ZHS/Hitube-c-Rb-Pat-Cm-XZ-2025-05-26-10-05-46.jpg", "https://i.postimg.cc/MT84479j/Hitube-Bt4-Wyjgo-WZ-2025-05-26-10-05-58.jpg", "https://i.postimg.cc/YS8YKk3f/received-395252956651820.jpg", "https://i.postimg.cc/0N5ZJVXn/a844a740b33eba79b486744759914953-1.jpg", "https://i.postimg.cc/L6kG8BS4/received-1875128426597909.png", "https://i.postimg.cc/7ZxdGGP3/received-1258556092530363.png" ];
      const helpListImage = helpListImages[Math.floor(Math.random() * helpListImages.length)];

      await message.reply({
        body: msg,
        attachment: await global.utils.getStreamFromURL(helpListImage)
      });
    } else {
      const commandName = args[0].toLowerCase();
      const command = commands.get(commandName) || commands.get(aliases.get(commandName));

      if (!command) {
        await message.reply(`Command "${commandName}" not found.`);
      } else {
        const configCommand = command.config;
        const roleText = roleTextToString(configCommand.role);
        const author = configCommand.author || "Unknown";
        const cmdCategory = configCommand.category || "Uncategorized";
        const longDescription = configCommand.longDescription?.en || configCommand.longDescription || "No description available";
        
        // Guide/Usage build
        let guideText = "No guide available.";
        if (configCommand.guide) {
          if (typeof configCommand.guide === 'object') {
            guideText = configCommand.guide.en || Object.values(configCommand.guide)[0] || "No guide available";
          } else {
            guideText = configCommand.guide;
          }
        }
        
        const usage = guideText.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);

        const response = `
╭───⊙
│ 🔶 ${configCommand.name}
├── INFO
│ 📦 Category: ${cmdCategory}
│ 📝 Description: ${longDescription}
│ 👑 Author: ${author}
├── USAGE
│ ${usage}
│ 🔯 Version: ${configCommand.version || "1.0"}
│ ♻ Role: ${roleText}
╰────────────⊙`;

        await message.reply(response);
      }
    }
  },
};

function roleTextToString(roleValue) {
  switch (roleValue) {
    case 0:
      return "0 (All users)";
    case 1:
      return "1 (Group administrators)";
    case 2:
      return "2 (Admin bot)";
    default:
      return "Unknown role";
  }
               }
