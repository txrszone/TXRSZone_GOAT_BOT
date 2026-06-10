const axios = require("axios");
const { getPrefix } = global.utils;

// সেশন মেমোরি স্টোর
const sessions = {};

module.exports = {
  config: {
    name: "chat",
    version: "5.3.0 NEW FIXED",
    author: "OMOR TE",
    countDown: 2,
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
      "vka_cFpL63QMTaSj6rD8GOWOANIP5YdLzEyC";

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

📌❓ How to use?

▰▰▰▰▰▰▰▰▰▰▰▰▰

💬 Text Chat
└─ ${prefix}chat hello

🎨 Generate Image
└─ ${prefix}chat img: a cat

🖼️ Ask about an image
└─ [reply to image] ${prefix}chat describe this image

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
          "❌ Please provide a prompt. Example:\nchat img: a robot warrior",
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

    // 💬 AI CHAT with RETRY MECHANISM
    const sendWithRetry = async (retryCount = 0) => {
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
            timeout: 60000
          }
        );

        let reply = response.data?.choices?.[0]?.message?.content;

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
          const chunks = reply.match(/[\s\S]{1,1900}/g) || [];

          for (let i = 0; i < chunks.length; i++) {
            if (i !== 0) {
              await new Promise((resolve) => setTimeout(resolve, 400));
            }
            await api.sendMessage(chunks[i], threadID);
          }
        }
        
        return true; // Success
        
      } catch (error) {
        console.error(`Chat Error (Attempt ${retryCount + 1}):`, error.message);
        
        // Retry on specific status codes
        const retryStatusCodes = [503, 500, 502, 504];
        const status = error.response?.status;
        
        if (retryStatusCodes.includes(status) && retryCount < 3) {
          // Wait before retry (exponential backoff)
          const waitTime = Math.pow(2, retryCount) * 2000;
          api.sendMessage(`⚠️ Server busy (${status}), retrying in ${waitTime/1000} seconds...`, threadID, messageID);
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
          return sendWithRetry(retryCount + 1);
        }
        
        // Throw error if retries exhausted
        throw error;
      }
    };
    
    try {
      await sendWithRetry();
    } catch (error) {
      console.error("Final Chat Error:", error);
      
      // ⏳ Timeout
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        api.sendMessage(
          "⏳ The bot is taking too long to respond due to server latency.\n\nPlease try again in a few moments.",
          threadID,
          messageID
        );
      }
      // 503 Service Unavailable
      else if (error.response?.status === 503) {
        api.sendMessage(
          "⚠️ Bot is temporarily facing high ping issues. The AI server is currently busy.\n\nPlease wait a moment and try again.\n\n💡 Alternative: Use /bing or /gpt commands while this resolves.",
          threadID,
          messageID
        );
      }
      // Rate Limit (429)
      else if (error.response?.status === 429) {
        api.sendMessage(
          "⏳ Too many requests at once. The bot is rate limited.\n\nPlease wait a few seconds before trying again.",
          threadID,
          messageID
        );
      }
      // ❌ Other error
      else {
        let errMsg = error.response?.status === 404 
          ? "API endpoint not found. Please report this to bot owner." 
          : error.message;
        
        api.sendMessage(
          `❌ Error: ${errMsg}\n\n💡 Tip: Try again in a few minutes.`,
          threadID,
          messageID
        );
      }
    }
  }
};
