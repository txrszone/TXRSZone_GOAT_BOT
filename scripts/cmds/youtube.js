const axios = require('axios');

module.exports = {
  config: {
    name: "youtube",
    aliases: ["yt", "ytsearch"],
    version: "1.0",
    author: "kennethpanio",
    countDown: 5,
    role: 0,
    shortDescription: "Search videos on YouTube",
    longDescription: "Search for YouTube videos with keywords",
    category: "search",
    guide: "{p}{n} [search query]"
  },

  onStart: async function ({ api, event, args }) {
    console.log("✅ YouTube command started");
    
    const query = args.join(" ");
    if (!query) {
      console.log("❌ No query provided");
      return api.sendMessage("❌ Please provide a search query.\nExample: /youtube BTS songs", event.threadID, event.messageID);
    }
    
    console.log(`🔍 Searching: ${query}`);
    
    // Send loading message
    const loadingMsg = await api.sendMessage("⏳ Searching YouTube, please wait...", event.threadID);

    const apiKey = "AIzaSyDtkiIIDpdjVA8ZbsLrkxEzW12lucdAKSQ";
    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}`;

    try {
      console.log("🌐 Calling YouTube API...");
      const response = await axios.get(url, { timeout: 15000 });
      
      console.log(`📊 API Response status: ${response.status}`);
      
      if (!response.data.items || response.data.items.length === 0) {
        console.log("❌ No results found");
        await api.unsendMessage(loadingMsg.messageID);
        return api.sendMessage("❌ No results found for your search.", event.threadID, event.messageID);
      }
      
      const searchResults = response.data.items;
      let message = "🎬 YOUTUBE SEARCH RESULTS 🎬\n━━━━━━━━━━━━━━━━━━━━\n";
      
      for (let i = 0; i < searchResults.length; i++) {
        const result = searchResults[i];
        const title = result.snippet.title;
        const videoId = result.id.videoId;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const channelName = result.snippet.channelTitle;
        
        message += `\n📌 Result ${i + 1}:\n📹 Title: ${title}\n📢 Channel: ${channelName}\n🔗 Link: ${videoUrl}\n━━━━━━━━━━━━━━━━━━━━\n`;
      }
      
      console.log("✅ Sending results...");
      await api.sendMessage(message, event.threadID, event.messageID);
      
      // Remove loading message
      await api.unsendMessage(loadingMsg.messageID);
      console.log("✅ Done!");
      
    } catch (error) {
      console.error("❌ YouTube error:", error.message);
      await api.unsendMessage(loadingMsg.messageID);
      
      if (error.response && error.response.status === 403) {
        api.sendMessage("❌ YouTube API key has expired. Please update the API key.", event.threadID, event.messageID);
      } else if (error.code === 'ECONNABORTED') {
        api.sendMessage("❌ Request timeout. Please try again.", event.threadID, event.messageID);
      } else {
        api.sendMessage(`❌ An error occurred: ${error.message}`, event.threadID, event.messageID);
      }
    }
  }
};
