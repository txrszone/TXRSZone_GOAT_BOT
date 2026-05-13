const axios = require("axios");

module.exports = {
  config: {
    name: "chat",
    version: "3.0.0",
    author: "OMOR TE",
    countDown: 1,
    role: 0,
    shortDescription: "Chat with AI & Generate Image",
    longDescription: "Chat with Verba API, generate images, and ask questions with photos",
    guide: "{p}chat <message>\n{p}chat img:<prompt>\n{p}chat [reply to image] <question>",
    category: "ai"
  },

  onStart: async function ({ message, event, args, api }) {
    const VERBA_API_KEY = "vka_txyELvLw-xJfWKTUsw_upDxhCFCPbRpa";
    const VERB_ID = "41f803c01969e6fb1db498fc";
    const BASE_URL = "https://api.verba.ink";

    // রিপ্লাই করা ছবি চেক করা
    let replyingImage = null;
    let userText = args.join(" ").trim();

    if (event.messageReply && event.messageReply.attachments) {
      for (const attach of event.messageReply.attachments) {
        if (attach.type === "photo" || attach.type === "image") {
          replyingImage = attach.url;
          break;
        }
      }
      // যদি শুধু ছবি রিপ্লাই করে থাকে (কোনো টেক্সট না থাকে)
      if (!userText && event.messageReply.body) {
        userText = event.messageReply.body;
      }
    }

    // খালি মেসেজ চেক
    if (!userText && !replyingImage) {
      return message.reply(`🤖 **Verba AI**\n━━━━━━━━━━━━━━━━━━━━\n📌 টেক্সট চ্যাট: chat hello\n📌 ইমেজ জেনারেট: chat img:a cat\n📌 ছবি বুঝতে: [ছবি রিপ্লাই করে] chat এই ছবিতে কি আছে?\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW Legends Bot`);
    }

    // 🖼️ ইমেজ জেনারেশন (img: দিয়ে শুরু হলে)
    if (userText && userText.startsWith("img:")) {
      const prompt = userText.slice(4).trim();
      if (!prompt) {
        return message.reply("❌ ইমেজ তৈরির জন্য প্রম্পট দিন। যেমন: `chat img:a robot`");
      }

      try {
        const response = await axios.post(`${BASE_URL}/v1/image`, {
          character: VERB_ID,
          prompt: prompt,
          size: "1024x1024",
          response_format: "url"
        }, {
          headers: {
            "Authorization": `Bearer ${VERBA_API_KEY}`,
            "Content-Type": "application/json"
          }
        });

        const imageUrl = response.data?.data?.[0]?.url;
        if (!imageUrl) throw new Error("No image URL returned");

        const imageStream = await axios.get(imageUrl, { responseType: "stream" });

        await message.reply({
          body: `🎨 **ইমেজ জেনারেটেড**\n━━━━━━━━━━━━━━━━━━━━\n📝 প্রম্পট: ${prompt}`,
          attachment: imageStream.data
        });

      } catch (error) {
        console.error("Image gen error:", error);
        message.reply(`❌ ইমেজ জেনারেট করতে ব্যর্থ হয়েছে।\n💡 ${error.message}`);
      }
      return;
    }

    // 💬 টেক্সট চ্যাট (ছবি থাকলে ভিজন, না থাকলে সাধারণ চ্যাট)
    try {
      let requestBody = {
        character: VERB_ID,
        stream: false
      };

      // ছবি থাকলে vision format এ পাঠানো
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
        requestBody.messages = [
          { role: "user", content: userText }
        ];
      }

      const response = await axios.post(`${BASE_URL}/v1/response`, requestBody, {
        headers: {
          "Authorization": `Bearer ${VERBA_API_KEY}`,
          "Content-Type": "application/json"
        }
      });

      let reply = response.data?.choices?.[0]?.message?.content;
      if (!reply) throw new Error("Empty response from API");

      // লম্বা রিপ্লাই স্প্লিট করে পাঠানো
      if (reply.length > 2000) {
        const parts = reply.match(/[\s\S]{1,2000}/g) || [];
        const firstPart = parts.shift();
        await message.reply(firstPart);
        for (const part of parts) {
          await message.reply(part);
        }
      } else {
        await message.reply(reply);
      }

    } catch (error) {
      console.error("Chat error:", error);
      message.reply(`❌ Verba API কল ব্যর্থ: ${error.message}`);
    }
  }
};
