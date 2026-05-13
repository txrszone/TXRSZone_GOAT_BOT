const axios = require("axios");
const { getPrefix } = global.utils;

// সেশন মেমোরি স্টোর
const sessions = {};

module.exports = {
  config: {
    name: "chat",
    version: "6.0.0",
    author: "OMOR TE",
    countDown: 1,
    role: 0,
    shortDescription: "Chat with AI & Generate Image",
    longDescription: "Chat with Verba API, generate images, and ask questions with photos",
    guide: "{p}chat <message>\n{p}chat img: <prompt>\n{p}chat [reply to image/Bot message] <question>",
    category: "ai"
  },

  onStart: async function ({ api, event, args }) {
    const VERBA_API_KEY = "vka_txyELvLw-xJfWKTUsw_upDxhCFCPbRpa";
    const CHARACTER_ID = "/v/mwlegends_hpu";
    const BASE_URL = "https://api.verba.ink";
    
    const threadID = event.threadID;
    const messageID = event.messageID;
    const prefix = getPrefix(threadID);
    const senderID = event.senderID;
    const botID = api.getCurrentUserID();

    let replyingImage = null;
    let userText = args.join(" ").trim();
    let isReplyingToBot = false;

    // ✅ চেক করা: ইউজার কোনো মেসেজ রিপ্লাই করছে কিনা
    if (event.messageReply) {
      const replyMsg = event.messageReply;
      const replySenderID = replyMsg.senderID;
      
      // ✅ বটের মেসেজ রিপ্লাই করলে (টেক্সট রিপ্লাই)
      if (replySenderID === botID) {
        isReplyingToBot = true;
      }
      
      // রিপ্লাই করা মেসেজে ছবি আছে কিনা
      if (replyMsg.attachments) {
        for (const attach of replyMsg.attachments) {
          if (attach.type === "photo" || attach.type === "image") {
            replyingImage = attach.url;
            break;
          }
        }
      }
      
      // যদি ইউজার শুধু রিপ্লাই করে কিছু না লিখে, তাহলে রিপ্লাই করা মেসেজের টেক্সট নিবে
      if (!userText && replyMsg.body) {
        userText = replyMsg.body;
      }
    }

    // সেশন আইডি
    const sessionId = `${threadID}_${senderID}`;

    // হেল্প মেসেজ
    if (!userText && !replyingImage && !event.messageReply) {
      return api.sendMessage(
        `╭───────────────────╮
│      🤖 MW Legends AI      │
╰───────────────────╯

📌 **কিভাবে ব্যবহার করবেন?**

▰▰▰▰▰▰▰▰▰▰▰▰▰

💬 **নতুন কথা**
└─ ${prefix}chat hello

💬 **কথা চালিয়ে যান**
└─ [বটের যেকোনো উত্তর রিপ্লাই] আপনার কথা

🎨 **ইমেজ জেনারেট**
└─ ${prefix}chat img: a cat

🖼️ **ছবি দেখে প্রশ্ন**
└─ [ছবি রিপ্লাই] ${prefix}chat কি দেখছো?

▰▰▰▰▰▰▰▰▰▰▰▰▰

⚡ MW Legends Bot`, threadID, messageID);
    }

    // 🖼️ ইমেজ জেনারেশন
    if (userText && userText.toLowerCase().startsWith("img")) {
      let prompt = userText.slice(3).trim();
      if (prompt.startsWith(":")) prompt = prompt.slice(1).trim();
      if (prompt.startsWith(" ")) prompt = prompt.trim();
      
      if (!prompt) {
        return api.sendMessage("❌ প্রম্পট দিন। যেমন: `chat img: a robot`", threadID, messageID);
      }

      try {
        const response = await axios.post(`${BASE_URL}/v1/image`, {
          character: CHARACTER_ID,
          prompt: prompt,
          size: "1024x1024",
          response_format: "url"
        }, {
          headers: {
            "Authorization": `Bearer ${VERBA_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 120000
        });

        const imageUrl = response.data?.data?.[0]?.url;
        if (!imageUrl) throw new Error("No image URL");

        const imageStream = await axios.get(imageUrl, { responseType: "stream", timeout: 120000 });

        await api.sendMessage({
          body: `🎨 **${prompt}**`,
          attachment: imageStream.data
        }, threadID);

      } catch (error) {
        console.error("Image error:", error);
        let errMsg = error.response?.status === 404 ? "API Error 404" : error.message;
        api.sendMessage(`❌ ${errMsg}`, threadID, messageID);
      }
      return;
    }

    // 💬 টেক্সট চ্যাট
    // কখন API কল হবে?
    // 1. ইউজার সরাসরি "chat hello" টাইপ করলে
    // 2. ইউজার বটের যেকোনো মেসেজ রিপ্লাই করলে (কথা চালিয়ে যেতে)
    if (userText || replyingImage || isReplyingToBot) {
      
      try {
        let requestBody = { 
          character: CHARACTER_ID, 
          messages: []
        };
        
        // আগের সেশন আইডি থাকলে ব্যবহার করব (কথা চালিয়ে যেতে)
        if (sessions[sessionId]) {
          requestBody.session_id = sessions[sessionId];
        }

        if (replyingImage) {
          requestBody.messages = [
            {
              role: "user",
              content: [
                { type: "text", text: userText || "What's in this image?" },
                { type: "image_url", image_url: { url: replyingImage } }
              ]
            }
          ];
        } else {
          requestBody.messages = [{ role: "user", content: userText }];
        }

        const response = await axios.post(`${BASE_URL}/v1/response`, requestBody, {
          headers: {
            "Authorization": `Bearer ${VERBA_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 120000
        });

        let reply = response.data?.choices?.[0]?.message?.content;
        if (!reply) throw new Error("No response");
        
        // নতুন সেশন আইডি সেভ করা
        if (response.data?.session_id) {
          sessions[sessionId] = response.data.session_id;
        }

        if (reply.length > 2000) {
          const parts = reply.match(/[\s\S]{1,2000}/g) || [];
          await api.sendMessage(parts[0], threadID);
          for (let i = 1; i < parts.length; i++) {
            await api.sendMessage(parts[i], threadID);
          }
        } else {
          await api.sendMessage(reply, threadID);
        }

      } catch (error) {
        console.error("Chat error:", error);
        
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          api.sendMessage(`⏳ Verba AI সার্ভার থেকে রেসপন্স আসতে সময় লাগছে। দয়া করে একটু পরে আবার চেষ্টা করুন।`, threadID, messageID);
        } else {
          let errMsg = error.response?.status === 404 ? "API Error 404" : error.message;
          api.sendMessage(`❌ ${errMsg}`, threadID, messageID);
        }
      }
      return;
    }
  }
};
