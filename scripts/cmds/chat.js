const axios = require("axios");
const { getPrefix } = global.utils;

// সেশন মেমোরি স্টোর
const sessions = {};

// ✅ ইউটিউব ভিডিও আইডি বের করার ফাংশন (সব ফরম্যাট সাপোর্ট করে)
function extractYouTubeVideoId(url) {
  if (!url) return null;
  
  const patterns = [
    // youtube.com/watch?v=ID
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+?&v=)([\w-]{11})/i,
    // youtu.be/ID
    /youtu\.be\/([\w-]{11})/i,
    // youtube.com/embed/ID
    /youtube\.com\/embed\/([\w-]{11})/i,
    // youtube.com/shorts/ID
    /youtube\.com\/shorts\/([\w-]{11})/i,
    // youtube.com/live/ID
    /youtube\.com\/live\/([\w-]{11})/i,
    // youtube.com/v/ID
    /youtube\.com\/v\/([\w-]{11})/i,
    // youtube.com/e/ID
    /youtube\.com\/e\/([\w-]{11})/i,
    // music.youtube.com/watch?v=ID
    /music\.youtube\.com\/watch\?v=([\w-]{11})/i,
    // m.youtube.com/watch?v=ID
    /m\.youtube\.com\/watch\?v=([\w-]{11})/i,
    // m.youtube.com/shorts/ID
    /m\.youtube\.com\/shorts\/([\w-]{11})/i,
    // youtube-nocookie.com
    /youtube-nocookie\.com\/embed\/([\w-]{11})/i
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// ✅ ইউটিউব ভিডিও থেকে ট্রান্সক্রিপ্ট আনার ফাংশন
async function getYouTubeTranscript(userText) {
  try {
    const videoId = extractYouTubeVideoId(userText);
    if (!videoId) return null;
    
    // পাবলিক API ব্যবহার করে ট্রান্সক্রিপ্ট আনা
    const transcriptApi = `https://pipedproxy.kavin.rocks/api/v1/captions/${videoId}`;
    const response = await axios.get(transcriptApi, { timeout: 15000 });
    
    if (response.data && response.data.captions && response.data.captions.length > 0) {
      // ইংরেজি সাবটাইটেল খোঁজা, না থাকলে প্রথমটা
      let caption = response.data.captions.find(c => c.languageCode === 'en');
      if (!caption) caption = response.data.captions[0];
      
      if (caption && caption.url) {
        const subtitleResponse = await axios.get(caption.url, { timeout: 15000 });
        let text = subtitleResponse.data;
        text = text.replace(/<[^>]*>/g, ' ');
        text = text.replace(/\s+/g, ' ').trim();
        if (text.length > 3000) text = text.substring(0, 3000);
        return { text, videoId };
      }
    }
    return null;
  } catch (error) {
    console.error("YouTube transcript error:", error.message);
    return null;
  }
}

module.exports = {
  config: {
    name: "chat",
    version: "6.0.0",
    author: "OMOR TE",
    countDown: 1,
    role: 0,
    shortDescription: "Chat with AI & Generate Image",
    longDescription: "Chat with Verba API, generate images, ask questions with photos, and analyze YouTube videos",
    guide: "{p}chat <message>\n{p}chat img: <prompt>\n{p}chat [reply to image] <question>\n{p}chat [youtube_link] summarize this video",
    category: "ai"
  },

  onStart: async function ({ api, event, args, message }) {
    const VERBA_API_KEY = "vka_txyELvLw-xJfWKTUsw_upDxhCFCPbRpa";
    const CHARACTER_ID = "/v/mwlegends_hpu";
    const BASE_URL = "https://api.verba.ink";
    
    const threadID = event.threadID;
    const messageID = event.messageID;
    const senderID = event.senderID;
    const prefix = getPrefix(threadID);

    let replyingImage = null;
    let userText = args.join(" ").trim();

    // 🖼️ রিপ্লাই করা ছবি চেক করা
    if (event.messageReply && event.messageReply.attachments) {
      for (const attach of event.messageReply.attachments) {
        if (attach.type === "photo" || attach.type === "image") {
          replyingImage = attach.url;
          break;
        }
      }
      if (!userText && event.messageReply.body) {
        userText = event.messageReply.body;
      }
    }

    // সেশন আইডি
    const sessionId = `${threadID}_${senderID}`;

    // 🎯 হেল্প মেসেজ
    if (!userText && !replyingImage) {
      return api.sendMessage(
        `╭───────────────────╮
│      🤖  MW Legends AI  ⚡      │
╰───────────────────╯

📌❓ কিভাবে ব্যবহার করবেন?

▰▰▰▰▰▰▰▰▰▰▰▰▰

💬 টেক্সট চ্যাট 
└─ ${prefix}chat hello

🎨 ইমেজ জেনারেট
└─ ${prefix}chat img: a cat

🖼️ ছবি দেখে প্রশ্ন
└─ [ছবি রিপ্লাই] ${prefix}chat ছবিটি সম্পর্কে বর্ণনা দাও

🎬 ইউটিউব ভিডিও বিশ্লেষণ
└─ ${prefix}chat https://youtu.be/... এই ভিডিওর সারাংশ দাও

▰▰▰▰▰▰▰▰▰▰▰▰▰
📩
--
☸️ MW Legends Bot ⚡`, threadID, messageID);
    }

    // 🎬 ইউটিউব ভিডিও ট্রান্সক্রিপ্ট ফিচার
    const youtubePattern = /(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/|youtube\.com\/live\/|youtube\.com\/embed\/|m\.youtube\.com|music\.youtube\.com)[\w-]+/i;
    const isYouTube = youtubePattern.test(userText);
    
    if (isYouTube && !userText.toLowerCase().startsWith("img")) {
      // কনফার্মেশন মেসেজ
      const processingMsg = await api.sendMessage("🎬 ইউটিউব ভিডিও থেকে ট্রান্সক্রিপ্ট সংগ্রহ করা হচ্ছে...", threadID);
      
      try {
        const transcriptData = await getYouTubeTranscript(userText);
        
        if (transcriptData && transcriptData.text && transcriptData.text.length > 50) {
          // ট্রান্সক্রিপ্ট সফল হলে Verba API-তে পাঠানো
          const aiResponse = await axios.post(`${BASE_URL}/v1/response`, {
            character: CHARACTER_ID,
            messages: [{ role: "user", content: `Based on this video transcript, answer the question: "${userText}"\n\nVideo Transcript:\n${transcriptData.text}` }]
          }, {
            headers: { "Authorization": `Bearer ${VERBA_API_KEY}`, "Content-Type": "application/json" },
            timeout: 90000
          });
          
          let reply = aiResponse.data?.choices?.[0]?.message?.content;
          if (reply) {
            // মেসেঞ্জারের জন্য ফরম্যাট করা
            reply = reply.replace(/\*\*(.*?)\*\*/g, '*$1*');
            reply = reply.replace(/\n{3,}/g, '\n\n');
            reply = reply.replace(/\{user\}/gi, '');
            reply = reply.trim();
          } else {
            reply = "❌ ভিডিও থেকে তথ্য সংগ্রহ করতে পারলাম না।";
          }
          
          // প্রসেসিং মেসেজ ডিলিট করে উত্তর দেওয়া
          try { await api.unsendMessage(processingMsg.messageID); } catch(e) {}
          await message.reply(reply);
        } else {
          try { await api.unsendMessage(processingMsg.messageID); } catch(e) {}
          await message.reply("❌ এই ভিডিওতে কোনো সাবটাইটেল/ট্রান্সক্রিপ্ট নেই। ভিডিওটি ইংরেজি সাবটাইটেল সহ আপলোড করা থাকলেই কেবল বিশ্লেষণ সম্ভব।");
        }
      } catch (ytError) {
        console.error("YouTube error:", ytError);
        try { await api.unsendMessage(processingMsg.messageID); } catch(e) {}
        await message.reply("❌ ইউটিউব ভিডিও প্রসেস করতে ব্যর্থ হয়েছে। ভিডিওটি পাবলিক কিনা এবং ইংরেজি সাবটাইটেল আছে কিনা চেক করুন।");
      }
      return;
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
    try {
      let requestBody = { 
        character: CHARACTER_ID, 
        messages: []
      };

      // আগের সেশন আইডি থাকলে ব্যবহার করব
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

      // মেসেঞ্জারের জন্য ফরম্যাট করা
      reply = reply.replace(/\*\*(.*?)\*\*/g, '*$1*');
      reply = reply.replace(/\n{3,}/g, '\n\n');
      reply = reply.replace(/\{user\}/gi, '');
      reply = reply.trim();

      if (reply.length > 2000) {
        const parts = reply.match(/[\s\S]{1,1900}/g) || [];
        await message.reply(parts[0]);
        for (let i = 1; i < parts.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 400));
          await api.sendMessage(parts[i], threadID);
        }
      } else {
        await message.reply(reply);
      }

    } catch (error) {
      console.error("Chat error:", error);
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        api.sendMessage(`⏳ সার্ভার থেকে রেসপন্স আসতে সময় লাগছে। একটু পরে আবার চেষ্টা করুন।`, threadID, messageID);
      } else {
        let errMsg = error.response?.status === 404 ? "API Error 404" : error.message;
        api.sendMessage(`❌ ${errMsg}`, threadID, messageID);
      }
    }
  }
};
