const axios = require("axios");
const { getPrefix } = global.utils;

// সেশন মেমোরি স্টোর
const sessions = {};

module.exports = {
  config: {
    name: "chat",
    version: "5.2.0 FINAL FIXED",
    author: "OMOR TE",
    countDown: 1,
    role: 0,
    shortDescription: "Chat with AI & Generate Image",
    longDescription:
      "Chat with Verba API, generate images, and ask questions with photos",
    guide:
      "{p}chat <message>\n{p}chat img: <prompt>\n{p}chat [reply to image] <question>",
    category: "ai"
  },

  onStart: async function ({ api, event, args, message }) {
    const VERBA_API_KEY =
      "vka_txyELvLw-xJfWKTUsw_upDxhCFCPbRpa";

    const CHARACTER_ID = "/v/mwlegends_hpu";
    const BASE_URL = "https://api.verba.ink";

    const threadID = event.threadID;
    const messageID = event.messageID;
    const senderID = event.senderID;
    const prefix = getPrefix(threadID);

    let replyingImage = null;
    let userText = args.join(" ").trim();

    // 🖼️ Reply image detect
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

    // 🎯 Unique session ID
    const sessionId = `${threadID}_${senderID}`;

    // 📌 Help message
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

      if (prompt.startsWith(":")) {
        prompt = prompt.slice(1).trim();
      }

      if (!prompt) {
        return api.sendMessage(
          "❌ প্রম্পট দিন। যেমন:\nchat img: a robot warrior",
          threadID,
          messageID
        );
      }

      try {
        const response = await axios.post(
          `${BASE_URL}/v1/image`,
          {
            character: CHARACTER_ID,
            prompt: prompt,
            size: "1024x1024",
            response_format: "url"
          },
          {
            headers: {
              Authorization: `Bearer ${VERBA_API_KEY}`,
              "Content-Type": "application/json"
            },
            timeout: 120000
          }
        );

        const imageUrl = response.data?.data?.[0]?.url;

        if (!imageUrl) {
          throw new Error("No image URL received");
        }

        const imageStream = await axios.get(imageUrl, {
          responseType: "stream",
          timeout: 120000
        });

        await api.sendMessage(
          {
            body: `🎨 ${prompt}`,
            attachment: imageStream.data
          },
          threadID
        );
      } catch (error) {
        console.error("Image Error:", error);

        let errMsg =
          error.response?.status === 404
            ? "API Error 404"
            : error.message;

        api.sendMessage(
          `❌ Image generation failed:\n${errMsg}`,
          threadID,
          messageID
        );
      }

      return;
    }

    // 💬 AI CHAT
    try {
      let requestBody = {
        character: CHARACTER_ID,
        messages: []
      };

      // পুরাতন session ব্যবহার
      if (sessions[sessionId]) {
        requestBody.session_id = sessions[sessionId];
      }

      // 🖼️ Image + text
      if (replyingImage) {
        requestBody.messages = [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: userText || "What's in this image?"
              },
              {
                type: "image_url",
                image_url: {
                  url: replyingImage
                }
              }
            ]
          }
        ];
      }

      // 💬 Normal text
      else {
        requestBody.messages = [
          {
            role: "user",
            content: userText
          }
        ];
      }

      const response = await axios.post(
        `${BASE_URL}/v1/response`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${VERBA_API_KEY}`,
            "Content-Type": "application/json"
          },
          timeout: 120000
        }
      );

      let reply =
        response.data?.choices?.[0]?.message?.content;

      if (!reply) {
        throw new Error("No response received");
      }

      // ✅ Save new session
      if (response.data?.session_id) {
        sessions[sessionId] = response.data.session_id;
      }

      // 🧹 Clean weird markdown issue
      reply = reply
        .replace(/\n\s*\*\s*\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      // ✅ Messenger safe sending
      if (reply.length <= 1900) {
        await message.reply(reply);
      } else {
        const chunks =
          reply.match(/[\s\S]{1,1900}/g) || [];

        for (let i = 0; i < chunks.length; i++) {
          if (i !== 0) {
            await new Promise((resolve) =>
              setTimeout(resolve, 400)
            );
          }

          await api.sendMessage(
            chunks[i],
            threadID
          );
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);

      // ⏳ Timeout
      if (
        error.code === "ECONNABORTED" ||
        error.message?.includes("timeout")
      ) {
        api.sendMessage(
          "⏳ MW Legends AI সার্ভার রেসপন্স দিতে বেশি সময় নিচ্ছে। একটু পরে আবার চেষ্টা করুন অথবা সাপোর্টে যোগাযোগ করুন।",
          threadID,
          messageID
        );
      }

      // ❌ Other error
      else {
        let errMsg =
          error.response?.status === 404
            ? "API Error 404"
            : error.message;

        api.sendMessage(
          `❌ Error:\n${errMsg}`,
          threadID,
          messageID
        );
      }
    }
  }
};
