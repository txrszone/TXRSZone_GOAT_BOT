const axios = require("axios");
const { getPrefix } = global.utils;

// সেশন মেমোরি স্টোর
const sessions = {};

module.exports = {
  config: {
    name: "chat",
    version: "5.5.0 FULL SUPPORT UPDATED FIXED",
    author: "OMOR TE",
    countDown: 1,
    role: 0,
    shortDescription: "Chat with AI & Generate Image",
    longDescription: "Chat with AI, generate images, ask questions with photos, GIFs, and stickers",
    guide: "{p}chat <message>\n{p}chat img: <prompt>\n{p}chat [reply to image/GIF/sticker] <question>",
    category: "ai"
  },

  onStart: async function ({ api, event, args, message }) {
    const VERBA_API_KEY = "vka_cFpL63QMTaSj6rD8GOWOANIP5YdLzEyC";
    const CHARACTER_ID = "/v/mwlegends_hpu";
    const BASE_URL = "https://api.verba.ink";

    const threadID = event.threadID;
    const messageID = event.messageID;
    const senderID = event.senderID;
    const prefix = getPrefix(threadID);

    let replyingMedia = [];
    let userText = args.join(" ").trim();

    // 🖼️ Reply media detect (Photo, GIF, Sticker, Video)
    if (event.messageReply && event.messageReply.attachments) {
      for (const attach of event.messageReply.attachments) {
        const supportedTypes = ["photo", "png", "animated_image", "video", "sticker"];
        
        if (supportedTypes.includes(attach.type) && replyingMedia.length < 4) {
          let mediaUrl = attach.url;
          
          if (attach.type === "sticker" && attach.url) {
            mediaUrl = attach.url;
          }
          
          if (attach.type === "animated_image") {
            mediaUrl = attach.url;
          }
          
          replyingMedia.push({
            url: mediaUrl,
            type: attach.type
          });
        }
      }

      const totalMedia = event.messageReply.attachments.filter(a => 
        ["photo", "png", "animated_image", "video", "sticker"].includes(a.type)
      ).length;
      
      if (totalMedia > 4) {
        api.sendMessage(`⚠️ API supports up to 4 images/GIFs/stickers per request. Only the first 4 will be processed.`, threadID, messageID);
      }

      if (!userText && event.messageReply.body) {
        userText = event.messageReply.body;
      }
    }

    const sessionId = `${threadID}_${senderID}`;

    // 📌 Help message
    if (!userText && replyingMedia.length === 0) {
      return api.sendMessage(
        `╭───────────────────╮
│      🤖 MW Legends AI ⚡      │
╰───────────────────╯

📌❓ How to use?

▰▰▰▰▰▰▰▰▰▰▰▰▰

💬 Text Chat
└─ ${prefix}chat hello

🎨 Generate Image
└─ ${prefix}chat img: a cat

🖼️ Ask about images/GIFs/stickers (up to 4)
└─ [reply to photo/GIF/sticker] ${prefix}chat what is this?
└─ [reply to multiple] ${prefix}chat compare these

✨ Supported Media:
   • 📸 Photos
   • 🎞️ GIFs (animated_image)
   • 🏷️ Stickers
   • 🎥 Videos (thumbnail)

▰▰▰▰▰▰▰▰▰▰▰▰▰
📩
-----
☸️ MW Legends Bot ⚡`,
        threadID,
        messageID
      );
    }

    // 🎨 IMAGE GENERATION
    if (userText && userText.toLowerCase().startsWith("img")) {
      let prompt = userText.slice(3).trim();
      if (prompt.startsWith(":")) prompt = prompt.slice(1).trim();
      if (!prompt) {
        return api.sendMessage("❌ Please provide a prompt.\nExample: chat img: a robot warrior", threadID, messageID);
      }
      try {
        const response = await axios.post(`${BASE_URL}/v1/image`, {
          character: CHARACTER_ID,
          prompt: prompt,
          size: "1024x1024",
          response_format: "url"
        }, {
          headers: { Authorization: `Bearer ${VERBA_API_KEY}`, "Content-Type": "application/json" },
          timeout: 120000
        });
        const imageUrl = response.data?.data?.[0]?.url;
        if (!imageUrl) throw new Error("No image URL received");
        const imageStream = await axios.get(imageUrl, { responseType: "stream", timeout: 120000 });
        await api.sendMessage({ body: `🎨 ${prompt}`, attachment: imageStream.data }, threadID);
      } catch (error) {
        console.error("Image Error:", error);
        api.sendMessage(`❌ Image generation failed:\n${error.message}`, threadID, messageID);
      }
      return;
    }

    // 💬 AI CHAT with RETRY + MULTI-MEDIA (max 4)
    const sendWithRetry = async (retryCount = 0) => {
      try {
        let requestBody = {
          character: CHARACTER_ID,
          messages: []
        };

        if (sessions[sessionId]) {
          requestBody.session_id = sessions[sessionId];
        }

        // 🖼️ Multi-media content builder
        if (replyingMedia.length > 0) {
          let mediaTypeText = "images";
          if (replyingMedia.length === 1) {
            const type = replyingMedia[0].type;
            if (type === "animated_image") mediaTypeText = "GIF";
            else if (type === "sticker") mediaTypeText = "sticker";
            else if (type === "video") mediaTypeText = "video";
            else mediaTypeText = "image";
          }
          
          const contentArray = [
            {
              type: "text",
              text: userText || `What's in this ${mediaTypeText}?`
            }
          ];
          
          for (let i = 0; i < Math.min(replyingMedia.length, 4); i++) {
            contentArray.push({
              type: "image_url",
              image_url: { url: replyingMedia[i].url }
            });
          }
          
          requestBody.messages = [{ role: "user", content: contentArray }];
        } else {
          requestBody.messages = [{ role: "user", content: userText }];
        }

        const response = await axios.post(`${BASE_URL}/v1/response`, requestBody, {
          headers: { Authorization: `Bearer ${VERBA_API_KEY}`, "Content-Type": "application/json" },
          timeout: 120000  // 👈 120 seconds রেখেছি
        });

        let reply = response.data?.choices?.[0]?.message?.content;
        if (!reply) throw new Error("No response received");

        if (response.data?.session_id) {
          sessions[sessionId] = response.data.session_id;
        }

        reply = reply.replace(/\n\s*\*\s*\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

        if (reply.length <= 1900) {
          await message.reply(reply);
        } else {
          const chunks = reply.match(/[\s\S]{1,1900}/g) || [];
          for (let i = 0; i < chunks.length; i++) {
            if (i !== 0) await new Promise(resolve => setTimeout(resolve, 400));
            await api.sendMessage(chunks[i], threadID);
          }
        }
        return true;
        
      } catch (error) {
        console.error(`Chat Error (Attempt ${retryCount + 1}):`, error.message);
        
        const retryStatusCodes = [503, 500, 502, 504];
        const status = error.response?.status;
        
        if (retryStatusCodes.includes(status) && retryCount < 3) {
          const waitTime = Math.pow(2, retryCount) * 2000;
          api.sendMessage(`⚠️ Server busy (${status}), retrying in ${waitTime/1000} seconds...`, threadID, messageID);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return sendWithRetry(retryCount + 1);
        }
        throw error;
      }
    };
    
    try {
      await sendWithRetry();
    } catch (error) {
      console.error("Final Chat Error:", error);
      
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        api.sendMessage("⏳ The bot is taking too long to respond due to server latency.\n\nPlease try again in a few moments.", threadID, messageID);
      } else if (error.response?.status === 503) {
        api.sendMessage("⚠️ Bot is temporarily facing high ping issues. The AI server is currently busy.\n\nPlease wait a moment and try again.\n\n💡 Alternative: Use /bing or /gpt commands while this resolves.", threadID, messageID);
      } else if (error.response?.status === 429) {
        api.sendMessage("⏳ Too many requests at once. The bot is rate limited.\n\nPlease wait a few seconds before trying again.", threadID, messageID);
      } else {
        let errMsg = error.response?.status === 404 ? "API endpoint not found. Please report this to bot owner." : error.message;
        api.sendMessage(`❌ Error: ${errMsg}\n\n💡 Tip: Try again in a few minutes.`, threadID, messageID);
      }
    }
  }
};
