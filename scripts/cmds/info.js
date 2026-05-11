const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "info",
    version: "1.2.6",
    author: "OMOR TE",
    countDown: 5,
    role: 0,
    shortDescription: "Bot & Owner Info",
    longDescription: "Show bot system info and owner details",
    guide: "{pn} info",
    category: "info",
    hide: true
  },

  onStart: async function ({ message, event, users, threads, config }) {
    const { threadID, senderID } = event;
    const { PREFIX, BOTNAME } = config;
    const { commands } = global.client;
    
    const dateNow = Date.now();
    const time = process.uptime();
    const hours = Math.floor(time / (60 * 60));
    const minutes = Math.floor((time % (60 * 60)) / 60);
    const seconds = Math.floor(time % 60);

    // Admin list from config
    const listAdmin = global.config.ADMINBOT || [];
    
    let adminList = [];
    for (const id of listAdmin) {
      if (id) {
        try {
          const name = await users.getNameUser(id);
          adminList.push(`👤 ${name} - ${id}`);
        } catch(e) {
          adminList.push(`👤 ${id}`);
        }
      }
    }

    // Image links (your original links)
    const imageLinks = [
      "https://i.postimg.cc/0jRGknT9/FB-IMG-1744474199349.jpg",
      "https://i.postimg.cc/Y9KK7KC0/Polish-20250526-101350151.jpg",
      "https://i.postimg.cc/brgK1ZHS/Hitube-c-Rb-Pat-Cm-XZ-2025-05-26-10-05-46.jpg",
      "https://i.postimg.cc/MT84479j/Hitube-Bt4-Wyjgo-WZ-2025-05-26-10-05-58.jpg",
      "https://i.postimg.cc/YS8YKk3f/received-395252956651820.jpg",
      "https://i.postimg.cc/0N5ZJVXn/a844a740b33eba79b486744759914953-1.jpg",
      "https://i.postimg.cc/YCtFS03n/FB-IMG-1748855056576.jpg",
      "https://i.postimg.cc/cCDp8r3R/FB-IMG-1748855063027.jpg",
      "https://i.postimg.cc/sxDFXpMf/FB-IMG-1748855065465.jpg",
      "https://i.postimg.cc/DZcknCyY/FB-IMG-1748855075592.jpg"
    ];

    const randomImg = imageLinks[Math.floor(Math.random() * imageLinks.length)];
    const cacheDir = path.join(__dirname, "cache");
    const filePath = path.join(cacheDir, "info_img.png");

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const textMessage = `
🍀---- Hello/Assalamu Alaikum ----🍀

┏━━•❅•••❈•••❈•••❅•━━┓

| ${BOTNAME || "Bot"} |

┗━━•❅•••❈•••❈•••❅•━━┛

______________________________

↓↓ 𝗕𝗢𝗧 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢 ↓↓

» 𝗣𝗿𝗲𝗳𝗶𝘅 𝘀𝘆𝘀𝘁𝗲𝗺: ${PREFIX}

» 𝗧𝗼𝘁𝗮𝗹 𝗠𝗼𝗱𝘂𝗹𝗲𝘀: ${commands.size}

» 𝗣𝗶𝗻𝗴: ${Date.now() - dateNow}ms

______________________________

↓↓ 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 ↓↓

👤 𝗡𝗔𝗠𝗘: Omor T.E

🔗 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: fb.com/Omor.TE.16016

💬 𝗗𝗶𝘀𝗰𝗼𝗿𝗱: https://discord.gg/PQN4P6qSrM

${adminList.length > 0 ? `\n👑 𝗔𝗗𝗠𝗜𝗡 𝗟𝗜𝗦𝗧:\n${adminList.join("\n")}` : ""}

______________________________

⏱️ 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘: ${hours}h ${minutes}m ${seconds}s

______________________________

👥 𝗧𝗢𝗧𝗔𝗟 𝗨𝗦𝗘𝗥𝗦: ${global.data.allUserID?.length || "N/A"}

💬 𝗧𝗢𝗧𝗔𝗟 𝗚𝗥𝗢𝗨𝗣𝗦: ${global.data.allThreadID?.length || "N/A"}

______________________________

✨ Thanks for using ~
🏴‍☠️ MW Legends Official Bot
    `;

    try {
      // Download and send image with text
      const response = await axios({
        method: 'get',
        url: randomImg,
        responseType: 'stream'
      });

      response.data.path = `info_${Date.now()}.png`;

      await message.reply({
        body: textMessage,
        attachment: response.data
      });
    } catch (err) {
      console.error("Image download error:", err);
      // If image fails, send only text
      message.reply(textMessage);
    }
  }
};
