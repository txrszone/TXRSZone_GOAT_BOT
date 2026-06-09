const axios = require("axios");

module.exports = {
  config: {
    name: "ss",
    version: "1.0",
    author: "Omor TE",
    countDown: 5,
    role: 0,
    shortDescription: "Take a screenshot of a website",
    longDescription: "Capture screenshot of any website URL",
    category: "utility",
    guide: "{p}{n} [URL]",
    aliases: ["url", "check", "website", "link"]
  },

  onStart: async function ({ api, event, args }) {
    const url = args.join(" ");
    if (!url) {
      return api.sendMessage("❌ Please provide a URL.\nExample: /ss https://facebook.com\n\n💡 You can also use: /url, /check, /website, /link", event.threadID, event.messageID);
    }
    
    try {
      // Alternative screenshot API (working)
      const screenshotApi = `https://image.thum.io/get/width/1920/crop/800/maxAge/1/${url}`;
      
      const res = await axios.get(screenshotApi, {
        responseType: "stream"
      });
      
      api.sendMessage({
        body: "📸 Screenshot captured successfully!",
        attachment: res.data
      }, event.threadID, event.messageID);
      
    } catch (error) {
      console.error("Screenshot error:", error);
      api.sendMessage("❌ Failed to take screenshot. Make sure the URL is valid and starts with http:// or https://", event.threadID, event.messageID);
    }
  }
};
