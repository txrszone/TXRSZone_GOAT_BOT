const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "ss",
    aliases: ["url", "check", "website", "link"],
    version: "1.0",
    author: "Omor TE",
    countDown: 3,
    role: 0,
    shortDescription: "Take a screenshot of a website",
    longDescription: "Capture screenshot using Thum.io API",
    category: "utility",
    guide: "{p}{n} [URL]"
  },

  onStart: async function ({ api, event, args }) {
    const url = args.join(" ");
    if (!url) {
      return api.sendMessage("❌ Please provide a URL.\nExample: /ss https://facebook.com", event.threadID, event.messageID);
    }
    
    // Add https:// if not present
    let finalUrl = url;
    if (!finalUrl.startsWith("http://") && !finalUrl.startsWith("https://")) {
      finalUrl = "https://" + finalUrl;
    }
    
    // Your Thum.io API Key
    const THUM_API_KEY = "77928";
    
    const loadingMsg = await api.sendMessage("⏳ Taking screenshot via Thum.io...", event.threadID);
    
    try {
      // Using your API Key
      const screenshotUrl = `https://image.thum.io/get/auth/${THUM_API_KEY}/width/1280/crop/800/${encodeURIComponent(finalUrl)}`;
      
      console.log(`📸 Capturing: ${finalUrl}`);
      console.log(`🔑 API URL: ${screenshotUrl}`);
      
      const response = await axios.get(screenshotUrl, {
        responseType: "stream",
        timeout: 30000
      });
      
      await api.sendMessage({
        body: `📸 Screenshot of: ${finalUrl}`,
        attachment: response.data
      }, event.threadID, event.messageID);
      
      await api.unsendMessage(loadingMsg.messageID);
      console.log("✅ Screenshot sent successfully!");
      
    } catch (error) {
      console.error("Thum.io Error:", error.message);
      await api.unsendMessage(loadingMsg.messageID);
      
      // Try without API key as backup
      try {
        console.log("🔄 Trying without API key...");
        const backupUrl = `https://image.thum.io/get/width/1280/crop/800/${encodeURIComponent(finalUrl)}`;
        
        const backupResponse = await axios.get(backupUrl, {
          responseType: "stream",
          timeout: 30000
        });
        
        await api.sendMessage({
          body: `📸 Screenshot of: ${finalUrl} (backup method)`,
          attachment: backupResponse.data
        }, event.threadID, event.messageID);
        
      } catch (backupError) {
        api.sendMessage(`❌ Screenshot failed.\n🔗 Link: ${finalUrl}\n\nError: ${error.message}`, event.threadID, event.messageID);
      }
    }
  }
};
