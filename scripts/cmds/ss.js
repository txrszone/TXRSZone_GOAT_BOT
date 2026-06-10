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
    console.log("✅ SS command started");
    
    const url = args.join(" ");
    if (!url) {
      console.log("❌ No URL provided");
      return api.sendMessage("❌ Please provide a URL.\nExample: /ss https://facebook.com", event.threadID, event.messageID);
    }
    
    console.log(`📸 Processing URL: ${url}`);
    
    try {
      // Send loading message first
      const loadingMsg = await api.sendMessage("⏳ Taking screenshot, please wait...", event.threadID);
      
      const screenshotApi = `https://image.thum.io/get/width/1920/crop/800/maxAge/1/${encodeURIComponent(url)}`;
      console.log(`🌐 API URL: ${screenshotApi}`);
      
      const res = await axios.get(screenshotApi, {
        responseType: "stream",
        timeout: 30000
      });
      
      console.log("✅ Screenshot captured, sending...");
      
      await api.sendMessage({
        body: "📸 Screenshot captured successfully!",
        attachment: res.data
      }, event.threadID, event.messageID);
      
      // Remove loading message
      await api.unsendMessage(loadingMsg.messageID);
      console.log("✅ Done!");
      
    } catch (error) {
      console.error("❌ Screenshot error:", error.message);
      api.sendMessage(`❌ Failed to take screenshot: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
