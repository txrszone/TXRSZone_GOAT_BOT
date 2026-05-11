const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "info",
    version: "2.0.0",
    author: "OMOR TE",
    countDown: 5,
    role: 0,
    shortDescription: "Bot & Owner Info",
    longDescription: "Show beautiful bot system information",
    guide: "{pn} info",
    category: "info"
  },

  onStart: async function ({ message, args }) {
    const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm:ss A");
    const date = moment().tz("Asia/Dhaka").format("DD MMMM YYYY");
    const day = moment().tz("Asia/Dhaka").format("dddd");

    const imageLinks = [
      "https://i.postimg.cc/0jRGknT9/FB-IMG-1744474199349.jpg",
      "https://i.postimg.cc/Y9KK7KC0/Polish-20250526-101350151.jpg",
      "https://i.postimg.cc/brgK1ZHS/Hitube-c-Rb-Pat-Cm-XZ-2025-05-26-10-05-46.jpg",
      "https://i.postimg.cc/MT84479j/Hitube-Bt4-Wyjgo-WZ-2025-05-26-10-05-58.jpg",
      "https://i.postimg.cc/YS8YKk3f/received-395252956651820.jpg",
      "https://i.postimg.cc/0N5ZJVXn/a844a740b33eba79b486744759914953-1.jpg"
    ];

    const chosenUrl = imageLinks[Math.floor(Math.random() * imageLinks.length)];

    const textMsg = `
╔═══════════════════════════╗
║🌟 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 𝗧𝗢 𝗠𝗪 𝗟𝗘𝗚𝗘𝗡𝗗𝗦 🌟 ║
╚═══════════════════════════╝

┌──────────────────────────┐
│     🤖 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡      │
└──────────────────────────┘

✨ 𝗡𝗮𝗺𝗲        : MW Legends Bot
⚙️ 𝗣𝗿𝗲𝗳𝗶𝘅      : !
📦 𝗠𝗼𝗱𝘂𝗹𝗲𝘀     : 25+
🟢 𝗦𝘁𝗮𝘁𝘂𝘀      : Active
💻 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺   : Messenger Bot

┌─────────────────────────┐
│       👑 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢        │
└─────────────────────────┘

👤 𝗡𝗮𝗺𝗲     : 𝗢𝗺𝗼𝗿 𝗧.𝗘
🎂 𝗕𝗶𝗿𝘁𝗵      : --
🌍 𝗖𝗼𝘂𝗻𝘁𝗿𝘆   : 𝗕𝗮𝗻𝗴𝗹𝗮𝗱𝗲𝘀𝗵 🇧🇩
💙 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻   : --
🕌 𝗥𝗲𝗹𝗶𝗴𝗶𝗼𝗻   : --
🎮 𝗚𝗮𝗺𝗲     : 𝗠𝗼𝗱𝗲𝗿𝗻 𝗪𝗮𝗿𝘀𝗵𝗶𝗽𝘀 ⚓

┌─────────────────────────┐
│      🔗 𝗦𝗢𝗖𝗜𝗔𝗟 𝗟𝗜𝗡𝗞𝗦        │
└─────────────────────────┘

📘 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸   : fb.com/Omor.TE.16016
💬 𝗗𝗶𝘀𝗰𝗼𝗿𝗱   : discord.gg/PQN4P6qSrM
📧 𝗚𝗺𝗮𝗶𝗹     : omorte@example.com

┌─────────────────────────┐
│       ⏰ 𝗧𝗜𝗠𝗘 𝗜𝗡𝗙𝗢          │
└─────────────────────────┘

📅 𝗗𝗮𝘁𝗲      : ${date}
📆 𝗗𝗮𝘆       : ${day}
🕒 𝗧𝗶𝗺𝗲      : ${time}
🌏 𝗧𝗶𝗺𝗲𝘇𝗼𝗻𝗲 : 𝗔𝘀𝗶𝗮/𝗗𝗵𝗮𝗸𝗮

┌─────────────────────────┐
│      📊 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗦          │
└─────────────────────────┘

👥 𝗨𝘀𝗲𝗿𝘀      : ${global.data?.allUserID?.length || 'N/A'}
💬 𝗚𝗿𝗼𝘂𝗽𝘀     : ${global.data?.allThreadID?.length || 'N/A'}
⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲     : 𝟮𝟰/𝟳 𝗔𝗰𝘁𝗶𝘃𝗲
🚀 𝗣𝗲𝗿𝗳𝗼𝗿𝗺𝗮𝗻𝗰𝗲 : 𝗙𝗮𝘀𝘁

╔══════════════════════════╗
║   ✨ 𝗧𝗛𝗔𝗡𝗞𝗦 𝗙𝗢𝗥 𝗨𝗦𝗜𝗡𝗚 ✨    ║
║     †★ 𝗠𝗪 𝗟𝗲𝗴𝗲𝗻𝗱𝘀 ★†        ║
║        🏴‍☠️ ⚓ 💙              ║
╚══════════════════════════╝

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
       𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗢𝗺𝗼𝗿 𝗧.𝗘
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `;

    try {
      const response = await axios({
        method: 'get',
        url: chosenUrl,
        responseType: 'stream'
      });

      response.data.path = `info_${Date.now()}.jpg`;

      await message.reply({
        body: textMsg,
        attachment: response.data
      });
    } catch (err) {
      message.reply(textMsg);
    }
  }
};
