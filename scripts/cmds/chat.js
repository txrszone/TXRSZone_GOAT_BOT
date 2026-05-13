const axios = require("axios");

module.exports = {
  config: {
    name: "chat",
    version: "3.2.0",
    author: "OMOR TE",
    countDown: 1,
    role: 0,
    shortDescription: "Chat with AI & Generate Image",
    longDescription: "Chat with Verba API, generate images, and ask questions with photos",
    guide: "{p}chat <message>\n{p}chat img: <prompt>\n{p}chat [reply to image] <question>",
    category: "ai"
  },

  onStart: async function ({ message, event, args, api }) {
    const VERBA_API_KEY = "vka_txyELvLw-xJfWKTUsw_upDxhCFCPbRpa";
    const CHARACTER_ID = "/v/mwlegends_hpu";
    const BASE_URL = "https://api.verba.ink";
    
    const messageID = event.messageID;

    let replyingImage = null;
    let userText = args.join(" ").trim();

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

    if (!userText && !replyingImage) {
      return message.reply(`🤖 **Verba AI**\n━━━━━━━━━━━━━━━━━━━━\n📌 chat hello\n📌 chat img: a cat\n📌 [ছবি রিপ্লাই] chat কি দেখছো?\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }

    // 📨 রিঅ্যাক্ট (API call শুরু হলে)
    api.setMessageReaction("📨", messageID, (err) => {
      if (err) console.log("React error:", err);
    });

    // 🖼️ ইমেজ জেনারেশন
    if (userText && userText.toLowerCase().startsWith("img")) {
      let prompt = userText.slice(3).trim();
      if (prompt.startsWith(":")) prompt = prompt.slice(1).trim();
      if (prompt.startsWith(" ")) prompt = prompt.trim();
      
      if (!prompt) {
        return message.reply("❌ প্রম্পট দিন। যেমন: `chat img: a robot`");
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
          timeout: 15000
        });

        const imageUrl = response.data?.data?.[0]?.url;
        if (!imageUrl) throw new Error("No image URL");

        const imageStream = await axios.get(imageUrl, { responseType: "stream", timeout: 15000 });

        await message.reply({
          body: `🎨 **${prompt}**`,
          attachment: imageStream.data
        });

      } catch (error) {
        console.error("Image error:", error);
        let errMsg = error.response?.status === 404 ? "API Error 404" : error.message;
        message.reply(`❌ ${errMsg}`);
      }
      return;
    }

    // 💬 টেক্সট চ্যাট
    try {
      let requestBody = { character: CHARACTER_ID, messages: [] };

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
        timeout: 30000
      });

      let reply = response.data?.choices?.[0]?.message?.content;
      if (!reply) throw new Error("No response");

      if (reply.length > 2000) {
        const parts = reply.match(/[\s\S]{1,2000}/g) || [];
        await message.reply(parts[0]);
        for (let i = 1; i < parts.length; i++) {
          await message.reply(parts[i]);
        }
      } else {
        await message.reply(reply);
      }

    } catch (error) {
      console.error("Chat error:", error);
      let errMsg = error.response?.status === 404 ? "API Error 404" : error.message;
      message.reply(`❌ ${errMsg}`);
    }
  }
};
