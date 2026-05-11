const axios = require("axios");

module.exports.config = {
    name: "chat",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "Omor & ChatGPT",
    description: "Chat with Shapes API",
    commandCategory: "AI",
    usages: "/chat <message>",
    cooldowns: 2,
    dependencies: { "axios": "" }
};

module.exports.run = async ({ api, event, args }) => {
    const API_KEY = "I38TFQEKOAO1RNA6ONXY5IZQLRZHXYXXOITEYSIRKHM";
    const MODEL_ID = "shapesinc/mwlegendsofficialchatbot-g2rg";
    const API_URL = "https://api.shapes.inc/v1/chat/completions";

    const userMessage = args.join(" ");
    if (!userMessage) {
        return api.sendMessage("⚠ দয়া করে /chat এর পরে আপনার মেসেজ লিখুন।", event.threadID, event.messageID);
    }

    // প্রথমে Typing মেসেজ পাঠানো
    api.sendMessage("💬 Typing...", event.threadID, async (err, info) => {
        try {
            const res = await axios.post(API_URL, {
                model: MODEL_ID,
                messages: [{ role: "user", content: userMessage }]
            }, {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                }
            });

            let reply = res.data?.choices?.[0]?.message?.content || "❌ কোনো উত্তর পাওয়া যায়নি।";

            // Typing মেসেজ মুছে ফেলা
            api.unsendMessage(info.messageID);

            // চূড়ান্ত রিপ্লাই পাঠানো
            api.sendMessage(reply, event.threadID, event.messageID);

        } catch (error) {
            api.unsendMessage(info.messageID);
            api.sendMessage(`❌ API কল ব্যর্থ: ${error.message}`, event.threadID, event.messageID);
        }
    });
};
