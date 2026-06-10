const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "ss",
    aliases: ["url", "check", "website", "link"],
    version: "1.0",
    author: "Omor TE",
    countDown: 5,
    role: 0,
    shortDescription: "Take a screenshot of a website",
    longDescription: "Capture screenshot of any website URL",
    category: "utility",
    guide: "{p}{n} [URL]"
  },

  onStart: async function ({ api, event, args }) {
    const url = args.join(" ");
    if (!url) {
      return api.sendMessage("❌ Please provide a URL.\nExample: /ss https://facebook.com", event.threadID, event.messageID);
    }
    
    // Add http:// if not present
    let finalUrl = url;
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }
    
    const loadingMsg = await api.sendMessage("⏳ Taking screenshot, please wait...", event.threadID);
    
    try {
      // Using free screenshot API (no key needed)
      const screenshotApi = `https://api.screenshotmachine.com/?key=d67a8e&url=${encodeURIComponent(finalUrl)}&dimension=1280x720&cacheLimit=0`;
      
      // Alternative working API
      const altApi = `https://webscreenshot.vercel.app/api?url=${encodeURIComponent(finalUrl)}&width=1280&height=720`;
      
      const response = await axios.get(altApi, {
        responseType: "stream",
        timeout: 30000
      });
      
      await api.sendMessage({
        body: "📸 Screenshot captured successfully!",
        attachment: response.data
      }, event.threadID, event.messageID);
      
      await api.unsendMessage(loadingMsg.messageID);
      
    } catch (error) {
      console.error("Screenshot error:", error.message);
      await api.unsendMessage(loadingMsg.messageID);
      
      // Backup: Send just the link
      api.sendMessage(`❌ Could not capture screenshot.\n🔗 Website link: ${finalUrl}\n\nTry opening it manually.`, event.threadID, event.messageID);
    }
  }
};
