const axios = require('axios');

module.exports = {
  config: {
    name: "youtube",
    version: "1.0",
    author: "Omor TE",
    countDown: 5,
    role: 0,
    shortDescription: "Search videos on YouTube",
    longDescription: "Search for YouTube videos with keywords",
    category: "search",
    guide: "{p}{n} [search query]"
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query) {
      return api.sendMessage("❌ Please provide a search query.\nExample: /youtube BTS songs", event.threadID, event.messageID);
    }

    // Note: This API key might expire. Better to use your own or alternative API
    const apiKey = "AIzaSyDtkiIIDpdjVA8ZbsLrkxEzW12lucdAKSQ";
    const url = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}`;

    try {
      const response = await axios.get(url);
      
      if (!response.data.items || response.data.items.length === 0) {
        return api.sendMessage("❌ No results found for your search.", event.threadID, event.messageID);
      }
      
      const searchResults = response.data.items;
      let message = "🎬 YOUTUBE SEARCH RESULTS 🎬\n━━━━━━━━━━━━━━━━━━━━\n";
      
      searchResults.forEach((result, index) => {
        const title = result.snippet.title;
        const videoId = result.id.videoId;
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const channelName = result.snippet.channelTitle;
        
        message += `\n📌 Result ${index + 1}:\n📹 Title: ${title}\n📢 Channel: ${channelName}\n🔗 Link: ${videoUrl}\n━━━━━━━━━━━━━━━━━━━━\n`;
      });
      
      api.sendMessage(message, event.threadID, event.messageID);
      
    } catch (error) {
      console.error(error);
      
      if (error.response && error.response.status === 403) {
        api.sendMessage("❌ YouTube API key has expired. Please update the API key.", event.threadID, event.messageID);
      } else {
        api.sendMessage("❌ An error occurred while searching YouTube. Please try again later.", event.threadID, event.messageID);
      }
    }
  }
};
