const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "meme",
    aliases: ["memes"],
    version: "1.7",
    author: "Omor TE",
    countDown: 10,
    role: 0,
    shortDescription: "Random Meme Image",
    longDescription: "Get random memes from API or local collection",
    category: "fun",
    guide: "{p}meme"
  },

  onStart: async function({ message, event, api }) {
    // লোকাল ইমেজ লিংক (তোমার পুরোনো meme.js এর সব লিংক)
    const localImageLinks = [
      "https://i.imgur.com/zoQxUwC.jpg", "https://i.imgur.com/bXVBasN.jpg", "https://i.imgur.com/E3bMZMM.jpg", "https://i.imgur.com/pkchwDe.jpg", "https://i.imgur.com/PFV6etU.jpg", "https://i.imgur.com/DLElS0y.jpg", "https://i.imgur.com/6hufzML.jpg", "https://i.imgur.com/ikevA6M.jpg", "https://i.imgur.com/aGuU2tB.jpg", "https://i.imgur.com/tsUsL6B.jpg", "https://i.imgur.com/sAUL2X0.jpg", "https://i.imgur.com/fGSX9z3.jpg", "https://i.imgur.com/TeT8dXA.jpg", "https://i.imgur.com/kCnHvly.jpg", "https://i.imgur.com/wfB1cU7.jpg", "https://i.imgur.com/dmUAjtN.jpg", "https://i.imgur.com/RqaTxa4.jpg", "https://i.imgur.com/gXFNJGi.jpg", "https://i.imgur.com/DwDTSsS.jpg", "https://i.imgur.com/BSreuve.jpg", "https://i.imgur.com/B6TOC4a.jpg", "https://i.imgur.com/S83pmyW.jpg", "https://i.imgur.com/7FNPBkX.jpg", "https://i.imgur.com/SIdbUrD.jpg", "https://i.imgur.com/ErngTHc.jpg", "https://i.imgur.com/onfBoPC.jpg", "https://i.imgur.com/UVk3zcd.jpg", "https://i.imgur.com/3aOuDZ9.jpg", "https://i.imgur.com/OHfqttV.jpg", "https://i.imgur.com/aiNRtVF.jpg", 
      "https://i.imgur.com/rgPnYTJ.jpg", "https://i.imgur.com/YOVZBYH.jpg", "https://i.imgur.com/aiFNcBf.jpg", "https://i.imgur.com/FbI0kGj.jpg", "https://i.imgur.com/QOMUwDy.jpg", "https://i.imgur.com/UP8wysc.jpg", "https://i.imgur.com/seb2NbZ.jpg", "https://i.imgur.com/YdcVmTe.jpg", "https://i.imgur.com/WjkPmwu.jpg", "https://i.imgur.com/z7ZeFky.jpg", "https://i.imgur.com/H8YGlIn.jpg", "https://i.imgur.com/gjCymKq.jpg", "https://i.imgur.com/4XiF5dQ.jpg", "https://i.imgur.com/Nd5nrJW.jpg", "https://i.imgur.com/C4f0pdf.jpg", "https://i.imgur.com/EO0YsOT.jpg", "https://i.imgur.com/dKEAsb9.jpg", "https://i.imgur.com/7zfnhkO.jpg", "https://i.imgur.com/LrOjwMX.jpg", "https://i.imgur.com/7wAImE3.jpg", "https://i.imgur.com/D8Kzo1X.jpg", "https://i.imgur.com/VTXRcYo.jpg", "https://i.imgur.com/BcjRdU8.jpg", "https://i.imgur.com/hNb9WCk.jpg", "https://i.imgur.com/8GM1pn9.jpg"
    ];

    // র‍্যান্ডমলি সোর্স সিলেক্ট (50% API, 50% লোকাল)
    const useApi = Math.random() < 0.5;
    
    try {
      let imageUrl;
      let source = "";
      
      if (useApi && localImageLinks.length > 0) {
        // লোকাল থেকে নিবে
        imageUrl = localImageLinks[Math.floor(Math.random() * localImageLinks.length)];
        source = "📚 Local Meme Collection";
      } else {
        // API থেকে নেওয়ার চেষ্টা
        try {
          const apiUrl = await mahmud();
          const res = await axios.get(`${apiUrl}/api/meme`);
          imageUrl = res.data?.imageUrl;
          source = "🌐 API";
          
          if (!imageUrl) {
            // API fail হলে লোকাল ব্যাকআপ
            imageUrl = localImageLinks[Math.floor(Math.random() * localImageLinks.length)];
            source = "📚 Local Backup";
          }
        } catch (apiError) {
          // API error হলে লোকাল ব্যবহার
          imageUrl = localImageLinks[Math.floor(Math.random() * localImageLinks.length)];
          source = "📚 Local (API failed)";
        }
      }
      
      if (!imageUrl) {
        return message.reply("❌ No memes available. Please try again later.");
      }
      
      const stream = await axios({
        method: "GET",
        url: imageUrl,
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      await message.reply({
        body: `😂 | Here's your random meme!\n📌 Source: ${source}`,
        attachment: stream.data
      });
      
    } catch (error) {
      console.error("Meme error:", error);
      // লাস্ট চান্স: লোকাল থেকে সরাসরি
      try {
        const fallbackUrl = localImageLinks[Math.floor(Math.random() * localImageLinks.length)];
        const fallbackStream = await axios({
          method: "GET",
          url: fallbackUrl,
          responseType: "stream"
        });
        await message.reply({
          body: "😂 | Here's your random meme! (Backup)",
          attachment: fallbackStream.data
        });
      } catch (finalError) {
        message.reply("❌ An error occurred while fetching meme.");
      }
    }
  }
};
