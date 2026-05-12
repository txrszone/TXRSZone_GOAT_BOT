const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "faceswap",
        aliases: ["fs", "swap"],
        version: "1.0.0",
        author: "Omor TE",
        countDown: 3,
        role: 0,
        shortDescription: "Face swap two images",
        longDescription: "Swap faces between two images. Created for testing and educational purposes only.",
        category: "image",
        guide: "{pn} [reply to a message with 2 images]"
    },
    
    onStart: async function ({ message, event }) {
        let sourceUrl, targetUrl;

        if (event.type === "message_reply" && event.messageReply.attachments.length >= 2) {
            sourceUrl = event.messageReply.attachments[0].url;
            targetUrl = event.messageReply.attachments[1].url;
        } else if (event.attachments && event.attachments.length >= 2) {
            sourceUrl = event.attachments[0].url;
            targetUrl = event.attachments[1].url;
        } else {
            return message.reply("⚠️ 𝗣𝗹𝗲𝗮𝘀𝗲 𝘀𝗲𝗻𝗱 𝟮 𝗶𝗺𝗮𝗴𝗲𝘀 𝘁𝗼𝗴𝗲𝘁𝗵𝗲𝗿 𝘄𝗶𝘁𝗵 𝘁𝗵𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗼𝗿 𝗿𝗲𝗽𝗹𝘆 𝘁𝗼 𝗮 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝗰𝗼𝗻𝘁𝗮𝗶𝗻𝗶𝗻𝗴 𝟮 𝗶𝗺𝗮𝗴𝗲𝘀.\n\n(𝗧𝗵𝗲 𝗳𝗶𝗿𝘀𝘁 𝗶𝘀 𝘁𝗵𝗲 𝗦𝗼𝘂𝗿𝗰𝗲 𝗙𝗮𝗰𝗲 𝗮𝗻𝗱 𝘁𝗵𝗲 𝘀𝗲𝗰𝗼𝗻𝗱 𝗶𝘀 𝘁𝗵𝗲 𝗧𝗮𝗿𝗴𝗲𝘁 𝗜𝗺𝗮𝗴𝗲)");
        }

        message.reply("⏳ 𝗙𝗮𝗰𝗲 𝘀𝘄𝗮𝗽𝗽𝗶𝗻𝗴 𝗶𝗻 𝗽𝗿𝗼𝗴𝗿𝗲𝘀𝘀, 𝗽𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁 𝗮 𝗺𝗼𝗺𝗲𝗻𝘁...");

        try {
            const apiKey = "hello_world";
            const encodedSource = encodeURIComponent(sourceUrl);
            const encodedTarget = encodeURIComponent(targetUrl);
            
            const apiUrl = `https://mahbub-ullash.cyberbot.top/api/faceswap?api_key=${apiKey}&sourceUrl=${encodedSource}&targetUrl=${encodedTarget}`;

            const { data } = await axios.get(apiUrl, { responseType: 'stream' });

            const tempPath = path.join(__dirname, "cache", `faceswap_${Date.now()}.png`);
            const writer = fs.createWriteStream(tempPath);

            data.pipe(writer);

            writer.on('finish', () => {
                message.reply({
                    body: "✨ 𝗛𝗲𝗿𝗲 𝗶𝘀 𝘆𝗼𝘂𝗿 𝗳𝗮𝗰𝗲 𝘀𝘄𝗮𝗽 𝗿𝗲𝘀𝘂𝗹𝘁!",
                    attachment: fs.createReadStream(tempPath)
                }, () => {
                    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                });
            });

            writer.on('error', () => {
                message.reply("❌ 𝗔𝗻 𝗶𝗻𝘁𝗲𝗿𝗻𝗮𝗹 𝗲𝗿𝗿𝗼𝗿 𝗼𝗰𝗰𝘂𝗿𝗿𝗲𝗱 𝘄𝗵𝗶𝗹𝗲 𝗽𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲.");
            });

        } catch (error) {
            console.error(error);
            message.reply("❌ 𝗙𝗮𝗶𝗹𝗲𝗱 𝘁𝗼 𝗰𝗼𝗻𝗻𝗲𝗰𝘁 𝘁𝗼 𝘁𝗵𝗲 𝗔𝗣𝗜 𝗼𝗿 𝗻𝗼 𝗳𝗮𝗰𝗲 𝘄𝗮𝘀 𝗳𝗼𝘂𝗻𝗱 𝗶𝗻 𝘁𝗵𝗲 𝗶𝗺𝗮𝗴𝗲𝘀.");
        }
    }
};
