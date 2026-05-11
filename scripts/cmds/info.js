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
🍀----Hello/Assalamu Alaikum----🍀

┏━━•❅•••❈•••❈•••❅•━━┓

| MW Legends Bot.  |

┗━━•❅•••❈•••❈•••❅•━━┛

______________________________

↓↓ 𝗕𝗢𝗧 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢 ↓↓

» 𝗣𝗿𝗲𝗳𝗶𝘅 𝘀𝘆𝘀𝘁𝗲𝗺: !

» 𝗧𝗼𝘁𝗮𝗹 𝗠𝗼𝗱𝘂𝗹𝗲𝘀: Available

» 𝗣𝗶𝗻𝗴: Active

______________________________

↓↓ 𝗕𝗢𝗧 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 ↓↓

𝗡𝗔𝗠𝗘 : Omor T.E

𝗢𝘄𝗻𝗲𝗿 𝗜𝗱 𝗹𝗶𝗻𝗸: https://www.facebook.com/Omor.TE.16016

Discord Server Link: https://discord.gg/PQN4P6qSrM

______________________________

----↓↓ 𝗕𝗢𝗧 𝗨𝗣𝗧𝗜𝗠𝗘 ↓↓----

Online & Running

______________________________

» 𝗧𝗢𝗧𝗔𝗟 𝗨𝗦𝗘𝗥𝗦: Active

» 𝗧𝗢𝗧𝗔𝗟 𝗚𝗥𝗢𝗨𝗣: Active

______________________________

Thanks for using~ 
†★MW Legends★† Official Facebook Messenger Bot! 

--------------------------------------------------

🏴‍☠️⛵⚡

🕒 System Time: ${time}
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
