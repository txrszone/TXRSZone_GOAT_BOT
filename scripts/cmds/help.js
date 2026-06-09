const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;
const doNotDelete = "[ OMOR TE ]";

module.exports = {
config: {
name: "help",
version: "4.0.0",
author: "Omor TE",
countDown: 4,
role: 0,
shortDescription: {
en: "View all commands and usage",
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
  let msg = "╭─────────────────❁\n";  
  msg += "│ 𝐇𝐄𝐋𝐏 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 𝐌𝐄𝐍𝐔\n";  
  msg += "╰─────────────────❁\n\n";   

  for (const [name, value] of commands) {  
    if (value.config.role > 1 && role < value.config.role) continue;  

    const cmdCategory = value.config.category || "Uncategorized";  
    categories[cmdCategory] = categories[cmdCategory] || { commands: [] };  
    categories[cmdCategory].commands.push(name);  
  }  

  // Sort categories alphabetically
  const sortedCategories = Object.keys(categories).sort();
  
  for (const catName of sortedCategories) {  
    if (catName !== "info") {  
      msg += `╭─────✰『  ${catName.toUpperCase()}  』✰─────\n`;  

      const names = categories[catName].commands.sort();  
      // Display commands in rows of 3
      for (let i = 0; i < names.length; i += 3) {  
        const cmds = names.slice(i, i + 3).map((item) => `✦ ${item}`);  
        msg += `│ ${cmds.join("  •  ")}\n`;  
      }  

      msg += `╰───────────────────✰\n\n`;  
    }  
  }  

  const totalCommands = commands.size;  
  msg += `╭─────────────────✰\n`;  
  msg += `│ 📊 𝐓𝐎𝐓𝐀𝐋 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒: ${totalCommands}\n`;  
  msg += `│ 💡 𝐓𝐘𝐏𝐄: ${prefix}help <CmdName>\n`;  
  msg += `│ 🔍 𝐄𝐗𝐀𝐌𝐏𝐋𝐄: ${prefix}help rank\n`;  
  msg += `╰─────────────────✰\n\n`;  
  msg += `╭─────────────────✰\n`;  
  msg += `│ ❉  𝐎𝐌𝐎𝐑 𝐓𝐄  ❉\n`;  
  msg += `╰─────────────────✰`;   

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
    await message.reply(`❌ Command "${commandName}" not found.`);  
  } else {  
    const configCommand = command.config;  
    const roleText = roleTextToString(configCommand.role);  
    const cmdCategory = configCommand.category || "Uncategorized";  
      
    const shortDesc = configCommand.shortDescription?.en || configCommand.shortDescription || "";  
    const longDesc = configCommand.longDescription?.en || configCommand.longDescription || "";  
      
    let guideText = "No guide available.";  
    if (configCommand.guide) {  
      if (typeof configCommand.guide === 'object') {  
        guideText = configCommand.guide.en || Object.values(configCommand.guide)[0] || "No guide available";  
      } else {  
        guideText = configCommand.guide;  
      }  
    }  
      
    const usage = guideText.replace(/{p}/g, prefix).replace(/{n}/g, configCommand.name);  

    let descriptionLines = "";  
    if (shortDesc) {  
      descriptionLines += `│ 📝 Short Description: ${shortDesc}\n`;  
    }  
    if (longDesc) {  
      descriptionLines += `│ 📖 Long Description: ${longDesc}\n`;  
    }  
    if (!shortDesc && !longDesc) {  
      descriptionLines = `│ 📝 Description: No description available\n`;  
    }  

    const response = `
╭───⊙
│ 🔶 ${configCommand.name}
├── INFO
│ 📦 Category: ${cmdCategory}
${descriptionLines}├── USAGE:
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
return "👤 সবাই (Everyone)";
case 1:
return "👑 গ্রুপ এডমিন (Group Admins)";
case 2:
return "⚡ বট এডমিন (Bot Admins)";
default:
return "❓ অজানা (Unknown)";
}
    }
