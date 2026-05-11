const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "add",
    version: "6.1.0",
    author: "OMOR TE",
    countDown: 5,
    role: 0,
    shortDescription: "Add media to database",
    longDescription: "Reply to an image/video with name to add to database",
    guide: "{pn} <name> (reply to an image/video)",
    category: "media"
  },

  onStart: async function ({ message, event, args }) {
    try {
      // Admin IDs (যাদের নোটিফিকেশন যাবে)
      const adminID = ["100071151280531"];

      // Warning file setup
      const warningFile = path.join(__dirname, "cache", "warnings.json");
      const cacheDir = path.join(__dirname, "cache");

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      if (!fs.existsSync(warningFile)) {
        fs.writeFileSync(warningFile, JSON.stringify({}, null, 2));
      }

      function loadWarnings() {
        return JSON.parse(fs.readFileSync(warningFile));
      }

      function saveWarnings(warnings) {
        fs.writeFileSync(warningFile, JSON.stringify(warnings, null, 2));
      }

      // Get replied attachment
      const imageUrl = event.messageReply?.attachments?.[0]?.url;
      const videoName = args.join(" ").trim();
      const senderID = event.senderID;
      const threadID = event.threadID;

      if (!imageUrl) {
        return message.reply("⚠️ Please reply to an image or video to add.");
      }

      if (!videoName) {
        return message.reply("⚠️ Please provide a name for the media.");
      }

      // Load warnings
      let warnings = loadWarnings();
      if (!warnings[senderID]) warnings[senderID] = 0;

      // Bad words filter
      const badWords = [
        "fuck", "sex", "porn", "nude", "bitch", "cum", "dick", "pussy", "asshole", "boobs", "blowjob", "hentai", "xxx", "rape", "hotgirl", "hotboy",
        "anal", "oral", "tits", "slut", "whore", "nangi", "naked", "desisex", "desi porn", "indian porn", "child porn", "pedo", "child abuse",
        "গুদ", "চোদা", "চোদ", "চুদ", "চুদি", "চোদন", "মাগী", "মাগি", "বেশ্যা", "শুয়োর", "মাদারচোদ", "বাপচোদ", "মা চোদ", "বোন চোদ", "ফাক", "সেক্স", "পর্ন", "হেন্তাই"
      ];

      const pattern = badWords.map(word => {
        return word.split('').map(ch => `[${ch}]+`).join('[\\s\\.\\-\\_]*');
      }).join('|');

      const regex = new RegExp(pattern, 'i');

      // If bad word detected
      if (regex.test(videoName)) {
        warnings[senderID] += 1;
        saveWarnings(warnings);

        const warningMsg = `❌ Inappropriate name detected!\n⚠️ Warning: ${warnings[senderID]}/3\n🛑 3 warnings = action taken.`;

        // Notify in group
        message.reply(warningMsg);

        // Notify admins
        for (const id of adminID) {
          if (id && id.trim() !== "") {
            try {
              await message.reply(`🚫 Bad Word Alert!\nUser: ${senderID}\nName: ${videoName}\nWarning: ${warnings[senderID]}/3`);
            } catch(e) {}
          }
        }

        // Block after 3 warnings
        if (warnings[senderID] >= 3) {
          message.reply(`🚫 User blocked due to 3 warnings.`);
        }
        return;
      }

      // Get APIs
      const apis = await axios.get('https://raw.githubusercontent.com/shaonproject/Shaon/main/api.json');
      const baseAPI = apis.data.api;
      const imgurAPI = apis.data.imgur;

      const isVideo = event.messageReply?.attachments?.[0]?.type === "video";
      const duration = event.messageReply?.attachments?.[0]?.duration || 0;

      let finalUrl;

      if (isVideo && duration > 60) {
        const catRes = await axios.get(`${imgurAPI}/catbox?url=${encodeURIComponent(imageUrl)}`);
        finalUrl = catRes.data.url || catRes.data.link;
      } else {
        const imgurRes = await axios.get(`${imgurAPI}/imgur?link=${encodeURIComponent(imageUrl)}`);
        finalUrl = imgurRes.data.uploaded?.image || imgurRes.data.link;
      }

      if (!finalUrl) {
        return message.reply("❌ Media upload failed. Try again.");
      }

      // Save to database
      const response = await axios.get(`${baseAPI}/video/random?name=${encodeURIComponent(videoName)}&url=${encodeURIComponent(finalUrl)}`);

      message.reply(`✅ ADDED SUCCESSFULLY!\n📛 Name: ${response.data.name}\n🔗 URL: ${response.data.url}`);

    } catch (e) {
      console.error("Add command error:", e);
      message.reply(`❌ Error: ${e.message}`);
    }
  }
};
