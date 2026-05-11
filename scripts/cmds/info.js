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
    shortDescription: "Get Bot & Owner Info",
    longDescription: "Show bot system information and owner details",
    guide: "{pn} info",
    category: "info"
  },

  onStart: async function ({ message, args }) {
    const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm:ss A");

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

    const chosenUrl = imageLinks[Math.floor(Math.random() * imageLinks.length)];

    const textMsg = `
🍀━━━━━━━━━━━━━━━━━━━━━🍀
    ✨ 𝐀𝐒𝐒𝐀𝐋𝐀𝐌𝐔 𝐀𝐋𝐀𝐈𝐊𝐔𝐌 ✨
🍀━━━━━━━━━━━━━━━━━━━━━🍀

┏━━━❖━━━┓
🤖 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢
┗━━━❖━━━┛

▰▰▰▰▰▰▰▰▰▰▰▰▰

🤖 𝗕𝗼𝘁 𝗡𝗮𝗺𝗲 : MW Legends Bot
⚙️ 𝗣𝗿𝗲𝗳𝗶𝘅 : /
📦 𝗧𝗼𝘁𝗮𝗹 𝗠𝗼𝗱𝘂𝗹𝗲𝘀 : 10+
⚡ 𝗦𝘁𝗮𝘁𝘂𝘀 : 𝗔𝗰𝘁𝗶𝘃𝗲 🟢

▰▰▰▰▰▰▰▰▰▰▰▰▰

┏━━━❖━━━┓
👑 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢
┗━━━❖━━━┛

▰▰▰▰▰▰▰▰▰▰▰▰▰

👤 𝗡𝗮𝗺𝗲 : 𝗢𝗺𝗼𝗿 𝗧.𝗘
🌍 𝗖𝗼𝘂𝗻𝘁𝗿𝘆 : 𝗕𝗮𝗻𝗴𝗹𝗮𝗱𝗲𝘀𝗵 🇧🇩
💙 𝗥𝗲𝗹𝗮𝘁𝗶𝗼𝗻 : ...
🕌 𝗥𝗲𝗹𝗶𝗴𝗶𝗼𝗻 : ...

▰▰▰▰▰▰▰▰▰▰▰▰▰

┏━━━❖━━━┓
🔗 𝗦𝗢𝗖𝗜𝗔𝗟 𝗟𝗜𝗡𝗞𝗦
┗━━━❖━━━┛

▰▰▰▰▰▰▰▰▰▰▰▰▰

📘 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 : 
   fb.com/Omor.TE.16016

💬 𝗗𝗶𝘀𝗰𝗼𝗿𝗱 : 
   https://discord.gg/PQN4P6qSrM

🎮 𝗚𝗮𝗺𝗲 : 𝗠𝗼𝗱𝗲𝗿𝗻 𝗪𝗮𝗿𝘀𝗵𝗶𝗽𝘀 ⚓

▰▰▰▰▰▰▰▰▰▰▰▰▰

┏━━━❖━━━┓
⏰ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗧𝗜𝗠𝗘
┗━━━❖━━━┛

▰▰▰▰▰▰▰▰▰▰▰▰▰

🕒 𝗗𝗮𝘁𝗲 & 𝗧𝗶𝗺𝗲 : ${time}
📅 𝗗𝗮𝘁𝗲 : ${moment().tz("Asia/Dhaka").format("DD/MM/YYYY")}

▰▰▰▰▰▰▰▰▰▰▰▰▰

┏━━━❖━━━┓
📊 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗦
┗━━━❖━━━┛

▰▰▰▰▰▰▰▰▰▰▰▰▰

👥 𝗧𝗼𝘁𝗮𝗹 𝗨𝘀𝗲𝗿𝘀 : Active N/A
💬 𝗧𝗼𝘁𝗮𝗹 𝗚𝗿𝗼𝘂𝗽𝘀 : 𝗔𝗰𝘁𝗶𝘃𝗲 N/A
⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲 : 𝗢𝗻𝗹𝗶𝗻𝗲 𝟮𝟰/𝟳

▰▰▰▰▰▰▰▰▰▰▰▰▰

✨ 𝗧𝗵𝗮𝗻𝗸𝘀 𝗳𝗼𝗿 𝘂𝘀𝗶𝗻𝗴 ✨
  †★𝗠𝗪 𝗟𝗲𝗴𝗲𝗻𝗱𝘀★†

🏴‍☠️⚓💙

━━━━━━━━━━━━━━━━━━━━━
  𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗢𝗺𝗼𝗿 𝗧.𝗘
━━━━━━━━━━━━━━━━━━━━━
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
