const axios = require("axios");
const { getPrefix } = global.utils;

// 🧠 Session memory
const sessions = {};

module.exports = {
  config: {
    name: "chat",
    version: "5.5.0 FINAL",
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

    // 🖼️ Detect replied image
    if (event.messageReply?.attachments) {

      for (const attach of event.messageReply.attachments) {

        if (
          attach.type === "photo" ||
          attach.type === "image"
        ) {
          replyingImage = attach.url;
          break;
        }
      }

      if (!userText && event.messageReply.body) {
        userText = event.messageReply.body;
      }
    }

    // 🧠 Unique Session
    const sessionId = `${threadID}_${senderID}`;

    // 📌 Help Message
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
    if (
      userText &&
      userText.toLowerCase().startsWith("img")
    ) {

      let prompt = userText.slice(3).trim();

      if (prompt.startsWith(":")) {
        prompt = prompt.slice(1).trim();
      }

      if (!prompt) {

        return api.sendMessage(
          "❌ Prompt দিন\nExample:\nchat img: futuristic battleship",
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

        const imageUrl =
          response.data?.data?.[0]?.url;

        if (!imageUrl) {
          throw new Error("No image URL");
        }

        const imageStream = await axios.get(
          imageUrl,
          {
            responseType: "stream",
            timeout: 120000
          }
        );

        await api.sendMessage(
          {
            body: `🎨 ${prompt}`,
            attachment: imageStream.data
          },
          threadID
        );

      } catch (error) {

        console.error("Image Error:", error);

        const errMsg =
          error.response?.status === 404
            ? "API Error 404"
            : error.message;

        api.sendMessage(
          `❌ ${errMsg}`,
          threadID,
          messageID
        );
      }

      return;
    }

    // 💬 CHAT SYSTEM
    try {

      let requestBody = {
        character: CHARACTER_ID,
        messages: []
      };

      // 🧠 Use old session
      if (sessions[sessionId]) {
        requestBody.session_id =
          sessions[sessionId];
      }

      // 🖼️ Image Question
      if (replyingImage) {

        requestBody.messages = [
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  userText ||
                  "What's in this image?"
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

      } else {

        // 💬 Normal Text
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
        throw new Error("No response");
      }

      // 🧠 Save session
      if (response.data?.session_id) {

        sessions[sessionId] =
          response.data.session_id;
      }

      // 🧹 Clean weird markdown
      reply = reply
        .replace(/\n\s*\*\s*\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

      // ✅ 300 Character Smart Split
      const chunkSize = 300;

      const responses = [];

      let currentChunk = "";

      const words = reply.split(" ");

      for (const word of words) {

        if (
          (currentChunk + word).length >
          chunkSize
        ) {

          responses.push(
            currentChunk.trim()
          );

          currentChunk = word + " ";

        } else {

          currentChunk += word + " ";
        }
      }

      // last chunk
      if (currentChunk.trim()) {

        responses.push(
          currentChunk.trim()
        );
      }

      // 🚀 Send messages one by one
      for (let i = 0; i < responses.length; i++) {

        if (i !== 0) {

          await new Promise(resolve =>
            setTimeout(resolve, 500)
          );
        }

        await api.sendMessage(
          responses[i],
          threadID
        );
      }

    } catch (error) {

      console.error("Chat Error:", error);

      // ⏳ Timeout
      if (
        error.code === "ECONNABORTED" ||
        error.message?.includes("timeout")
      ) {

        api.sendMessage(
          "⏳ MW Legends AI সার্ভার রেসপন্স দিতে বেশি সময় নিচ্ছে। পরে আবার চেষ্টা করুন।",
          threadID,
          messageID
        );

      } else {

        const errMsg =
          error.response?.status === 404
            ? "API Error 404"
            : error.message;

        api.sendMessage(
          `❌ ${errMsg}`,
          threadID,
          messageID
        );
      }
    }
  }
};
