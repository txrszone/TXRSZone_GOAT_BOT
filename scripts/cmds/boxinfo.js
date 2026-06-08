const fs = require("fs-extra");
const request = require("request");
const path = require("path");

module.exports = {
  config: {
    name: "groupinfo",
    aliases: ['boxinfo', 'gcinfo'],
    version: "1.0",
    author: "OMOR TE",
    countDown: 5,
    role: 0,
    shortDescription: "See Group Info",
    longDescription: "Get detailed information about the current group",
    category: "box chat",
    guide: {
      en: "{p}groupinfo"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const threadMem = threadInfo.participantIDs.length;
      
      // Gender count
      let maleCount = 0;
      let femaleCount = 0;
      let otherCount = 0;
      
      for (const user of threadInfo.userInfo) {
        if (user.gender === "MALE") maleCount++;
        else if (user.gender === "FEMALE") femaleCount++;
        else otherCount++;
      }
      
      // Admin list
      let adminList = '';
      const adminIDs = threadInfo.adminIDs || [];
      for (let i = 0; i < adminIDs.length; i++) {
        try {
          const userInfo = await api.getUserInfo(adminIDs[i].id);
          const name = userInfo[adminIDs[i].id]?.name || "Unknown";
          adminList += `  👑 ${name}\n`;
        } catch(e) {
          adminList += `  👑 ${adminIDs[i].id}\n`;
        }
      }
      
      const approvalMode = threadInfo.approvalMode ? "ON ✅" : "OFF ❌";
      const emoji = threadInfo.emoji || "None";
      const threadName = threadInfo.threadName || "Unnamed Group";
      const threadID = threadInfo.threadID;
      const messageCount = threadInfo.messageCount || 0;
      const nicknames = Object.keys(threadInfo.nicknames || {}).length;
      
      const groupInfoText = `
╭───────────────╮
│      📊 GROUP INFO       │
╰───────────────╯

📛 **Name:** ${threadName}
🆔 **ID:** ${threadID}
━━━━━━━━━━━━━━━━━━━━

👥 **MEMBERS**
├ 👤 Total: ${threadMem}
├ 👨 Male: ${maleCount}
├ 👩 Female: ${femaleCount}
└ 🔄 Other: ${otherCount}

━━━━━━━━━━━━━━━━━━━━

👑 **ADMINS (${adminIDs.length})**
${adminList || '  None'}
━━━━━━━━━━━━━━━━━━━━

📝 **OTHER INFO**
├ 🔐 Approval: ${approvalMode}
├ 😊 Emoji: ${emoji}
├ 💬 Total Messages: ${messageCount}
├ 🏷️ Nicknames Set: ${nicknames}
└ 📅 Created: ${new Date(threadInfo.threadCreated || Date.now()).toLocaleDateString()}

━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot
      `;
      
      // Handle group image
      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
      
      const imagePath = path.join(cacheDir, "groupinfo.png");
      
      if (threadInfo.imageSrc) {
        request(encodeURI(threadInfo.imageSrc))
          .pipe(fs.createWriteStream(imagePath))
          .on("close", () => {
            api.sendMessage({
              body: groupInfoText,
              attachment: fs.createReadStream(imagePath)
            }, event.threadID, () => {
              try { fs.unlinkSync(imagePath); } catch(e) {}
            }, event.messageID);
          })
          .on("error", () => {
            api.sendMessage(groupInfoText, event.threadID, event.messageID);
          });
      } else {
        api.sendMessage(groupInfoText, event.threadID, event.messageID);
      }
      
    } catch (error) {
      console.error("Group info error:", error);
      api.sendMessage(`❌ Error fetching group info: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
