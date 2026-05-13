const axios = require("axios");
const { getPrefix } = global.utils;

// সেশন মেমোরি স্টোর
const sessions = {};

// Verba AI উত্তর চিহ্নিত করার জন্য মার্কার
const VERBA_MARKER = "🎨 **"; // ইমেজ জেনারেশনের মার্কার

module.exports = {
  config: {
    name: "chat",
    version: "7.0.0",
    author: "OMOR TE",
    countDown: 1,
    role: 0,
    shortDescription: "Chat with AI & Generate Image",
    longDescription: "Chat with Verba API. Reply to Verba AI's response to continue conversation.",
    guide: "{p}chat <message> - নতুন কথা\n[Verba AI এর উত্তর রিপ্লাই] <message> - কথা চালিয়ে যান\n{p}chat img: <prompt> - ইমেজ জেনারেট",
    category: "ai"
  },

  onStart: async function ({ api, event, args }) {
    const VERBA_API_KEY = "vka_txyELvLw-xJfWKTUsw_upDxhCFCPbRpa";
    const CHARACTER_ID = "/v/mwlegends_hpu";
    const BASE_URL = "https://api.verba.ink";
    
    const threadID = event.threadID;
    const messageID = event.messageID;
    const senderID = event.senderID;
    const prefix = getPrefix(threadID);
    
    // বটের আইডি
    const botID = api.getCurrentUserID();

    let replyingImage = null;
    let userText = args.join(" ").trim();
    let isReplyingToVerbaResponse = false;
    let repliedMessageText = "";

    // ✅ চেক করা: ইউজার কোনো মেসেজ রিপ্লাই করছে কিনা
    if (event.messageReply) {
      const replyMsg = event.messageReply;
      const replySenderID = replyMsg.senderID;
      const replyMsgBody = replyMsg.body || "";
      
      // ✅ শুধু বটের মেসেজ রিপ্লাই করলে, এবং সেটি Verba AI এর উত্তর কিনা চেক
      if (replySenderID === botID) {
        // Verba AI এর উত্তর চিহ্নিত করার উপায়:
        // 1. Verba AI উত্তর গুলো সাধারণত নির্দিষ্ট ফরম্যাটে হয় না, কিন্তু আমরা session এর মাধ্যমে ট্র্যাক করব
        // 2. আমরা replyMsgBody থেকে বোঝার চেষ্টা করব
        
        // সেশন চেক করা: এই থ্রেডে আগে কোনো Verba chat হয়েছে কিনা
        const lastSessionKey = `${threadID}_last_verba`;
        
        // যদি আগের Verba সেশন থাকে এবং এটি সেই সেশনের উত্তর হয়
        if (sessions[`${threadID}_${senderID}`]) {
          isReplyingToVerbaResponse = true;
        }
        
        // অথবা মেসেজে Verba AI চিহ্নিতকারী মার্কার আছে কিনা
        if (replyMsgBody.includes("╭───────────────────╮") === false && 
            replyMsgBody.startsWith("🎨") === false &&
            replyMsgBody.includes("Mixed Emoji") === false &&
            replyMsgBody.length > 10) {
          // লম্বা টেক্সট মেসেজ সম্ভবত Verba AI উত্তর
          if (!sessions[`${threadID}_${senderID}`]) {
            isReplyingToVerbaResponse = true;
          }
        }
        
        repliedMessageText = replyMsgBody;
      }
      
      // ছবি চেক
      if (replyMsg.attachments) {
        for (const attach of replyMsg.attachments) {
          if (attach.type === "photo" || attach.type === "image") {
            replyingImage = attach.url;
            break;
          }
        }
      }
    }

    // সেশন আইডি
    const sessionId = `${threadID}_${senderID}`;

    // হেল্প মেসেজ
    if (!userText && !replyingImage && !event.messageReply) {
      return api.sendMessage(
        `╭───────────────────╮
│      🤖  MW Legends AI  ⚡      │
╰───────────────────╯

📌 **কিভাবে ব্যবহার করবেন?**

▰▰▰▰▰▰▰▰▰▰▰▰▰

💬 **নতুন কথা**
└─ ${prefix}chat hello

💬 **কথা চালিয়ে যান**
└─ [Verba AI এর উত্তর রিপ্লাই] আপনার কথা

🎨 **ইমেজ জেনারেট**
└─ ${prefix}chat img: a cat

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
          timeout: 60000
        });

        const imageUrl = response.data?.data?.[0]?.url;
        if (!imageUrl) throw new Error("No image URL");

        const imageStream = await axios.get(imageUrl, { responseType: "stream", timeout: 60000 });

        await api.sendMessage({
          body: `🎨 **${prompt}**`,
          attachment: imageStream.data
        }, threadID);
        
        // ইমেজ জেনারেশন সফল হলে সেশন সেভ
        sessions[sessionId] = "image_session";

      } catch (error) {
        console.error("Image error:", error);
        let errMsg = error.response?.status === 404 ? "API Error 404" : error.message;
        api.sendMessage(`❌ ${errMsg}`, threadID, messageID);
      }
      return;
    }

    // 💬 চ্যাট হ্যান্ডলিং
    // কখন API কল হবে?
    // 1. ইউজার সরাসরি "chat hello" টাইপ করলে
    // 2. ইউজার Verba AI এর উত্তর রিপ্লাই করলে (আবার chat না লিখে)
    
    const shouldCallAPI = (userText && !event.messageReply) || isReplyingToVerbaResponse;
    
    if (shouldCallAPI) {
      
      // যদি শুধু রিপ্লাই করে কিছু না লেখে
      if (isReplyingToVerbaResponse && !userText && !replyingImage) {
        return api.sendMessage(`❌ দয়া করে আপনার মেসেজ লিখুন।\n\n💡 Verba AI এর উত্তর রিপ্লাই করে আপনার কথা লিখুন।`, threadID, messageID);
      }
      
      // যদি সরাসরি chat কমান্ড দেওয়া হয় কিন্তু কোনো মেসেজ না থাকে
      if (!userText && !replyingImage && !isReplyingToVerbaResponse) {
        return api.sendMessage(`❌ দয়া করে একটি মেসেজ লিখুন।\n\n💡 যেমন: ${prefix}chat hello`, threadID, messageID);
      }

      try {
        let requestBody = { 
          character: CHARACTER_ID, 
          messages: []
        };
        
        // আগের সেশন আইডি থাকলে ব্যবহার করব
        if (sessions[sessionId] && sessions[sessionId] !== "image_session") {
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
          timeout: 60000
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
        let errMsg = error.response?.status === 404 ? "API Error 404" : error.message;
        
        if (error.code === 'ECONNABORTED' || errMsg.includes('timeout')) {
          errMsg = "API response slow, please try again";
        }
        
        api.sendMessage(`❌ ${errMsg}`, threadID, messageID);
      }
      return;
    }
    
    // অন্য যেকোনো রিপ্লাই (যেমন: weather, mwmeme এর উত্তর) - চুপ থাকবে
    if (event.messageReply && !isReplyingToVerbaResponse) {
      // কিছু করবে না
      return;
    }
  }
};
