const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports.config = {
    name: "admin",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "OMOR TE", // don't change my credit!
    description: "Show Owner Info",
    commandCategory: "info",
    usages: "",
    cooldowns: 5
};

module.exports.run = async function({ api, event }) {
    const time = moment().tz("Asia/Dhaka").format("DD/MM/YYYY hh:mm:ss A");

    // Random image from this array
    const images = [
        "https://graph.facebook.com/100071151280531/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662",
        "https://i.postimg.cc/L6kG8BS4/received-1875128426597909.png",
        "https://i.postimg.cc/7ZxdGGP3/received-1258556092530363.png"
    ];
    
    const randomImg = images[Math.floor(Math.random() * images.length)];
    const filePath = __dirname + "/cache/admin_random.png";

    const callback = () => api.sendMessage({
        body: `
┏━━━━━━━━━━━━━━━━━━━━━┓
┃   🌟 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢 🪪      
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 👤 𝐍𝐚𝐦𝐞      : Omor T.E
┃ 🚹 𝐆𝐞𝐧𝐝𝐞𝐫    : ...
┃ ❤️ 𝐑𝐞𝐥𝐚𝐭𝐢𝐨𝐧  : ...
┃ 🎂 𝐀𝐠𝐞       : ...
┃ 🕌 𝐑𝐞𝐥𝐢𝐠𝐢𝐨𝐧  : ...
┃ 🏫 𝐄𝐝𝐮𝐜𝐚𝐭𝐢𝐨𝐧 : ...
┃ 🏡 𝐀𝐝𝐝𝐫𝐞𝐬𝐬  : ..., 𝐁𝐚𝐧𝐠𝐥𝐚𝐝𝐞𝐬𝐡
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 📶 Discord ID Tag : Omor.TE.16016
┃ 📢 Discord Server: https://discord.gg/PQN4P6qSrM
┃ 🌐 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 : https://www.facebook.com/Omor.TE.16016
┣━━━━━━━━━━━━━━━━━━━━━┫
┃ 🕒 SYSTEM 𝐓𝐢𝐦𝐞:  ${time}
┗━━━━━━━━━━━━━━━━━━━━━┛
        `,
        attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath));

    request(encodeURI(randomImg))
        .pipe(fs.createWriteStream(filePath))
        .on("close", callback)
        .on("error", (err) => {
            console.error("❌ Image download failed:", err);
            api.sendMessage("⚠️ Could not load admin image.", event.threadID);
        });
};
