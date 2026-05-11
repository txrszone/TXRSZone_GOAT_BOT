const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "blackpink",
    version: "2.0.0",
    author: "OMOR TE",
    countDown: 3,
    role: 0,
    shortDescription: "Get Blackpink Photos",
    longDescription: "Send random Blackpink member photos",
    guide: "{p}blackpink",
    category: "nsfw"
  },

  onStart: async function ({ message, args }) {
    const imageLinks = [
      "https://i.imgur.com/O1O8p75.jpg",
      "https://i.imgur.com/c7wX46N.jpg",
      "https://i.imgur.com/kCXO20v.jpg",
      "https://i.imgur.com/LY9CBLZ.jpg",
      "https://i.imgur.com/21C7m3c.jpg",
      "https://i.imgur.com/rAVJRct.jpg",
      "https://i.imgur.com/c02iRit.jpg",
      "https://i.imgur.com/TvoAnua.jpg",
      "https://i.imgur.com/Gpx5pHf.jpg",
      "https://i.imgur.com/zg9kvzm.jpg",
      "https://i.imgur.com/WpcezHL.jpg",
      "https://i.imgur.com/qB6zkC4.jpg",
      "https://i.imgur.com/9rcYQEQ.jpg",
      "https://i.imgur.com/FhJs9ZZ.jpg",
      "https://i.imgur.com/mrdy5Xj.jpg",
      "https://i.imgur.com/wjma3bT.jpg",
      "https://i.imgur.com/HSA2UXG.jpg",
      "https://i.imgur.com/einh0qH.jpg",
      "https://i.imgur.com/DosFGp6.jpg",
      "https://i.imgur.com/NsixZ4K.jpg",
      "https://i.imgur.com/Rfag5Rf.jpg",
      "https://i.imgur.com/Ll4qHkX.jpg",
      "https://i.imgur.com/Aafs9t4.jpg",
      "https://i.imgur.com/l2bitnH.jpg",
      "https://i.imgur.com/yKJ71iT.jpg",
      "https://i.imgur.com/reIWRFK.jpg",
      "https://i.imgur.com/M7mmOzW.jpg",
      "https://i.imgur.com/AhdjhUE.jpg",
      "https://i.imgur.com/HelWaOM.jpg",
      "https://i.imgur.com/e7SyGlP.jpg",
      "https://i.imgur.com/RwOsmOz.jpg",
      "https://i.imgur.com/UoKm0jY.jpg",
      "https://i.imgur.com/JMQFJ6G.jpg",
      "https://i.imgur.com/GyzksZw.jpg",
      "https://i.imgur.com/F1n62Ez.jpg",
      "https://i.imgur.com/JYvVhIe.jpg",
      "https://i.imgur.com/ur6tUm0.jpg",
      "https://i.imgur.com/XhTWDVi.jpg",
      "https://i.imgur.com/NvASHOq.jpg",
      "https://i.imgur.com/YbqZtZt.jpg",
      "https://i.imgur.com/6rnwnwF.jpg",
      "https://i.imgur.com/MJ9A4uM.jpg",
      "https://i.imgur.com/dFTv62t.jpg",
      "https://i.imgur.com/zyK3rpz.jpg",
      "https://i.imgur.com/PyyXxIL.jpg",
      "https://i.imgur.com/uz1khCy.jpg",
      "https://i.imgur.com/dm9iK8w.jpg",
      "https://i.imgur.com/JvKifua.jpg",
      "https://i.imgur.com/CsByMZ1.jpg",
      "https://i.imgur.com/pE9Oua1.jpg",
      "https://i.imgur.com/Rto3nAw.jpg",
      "https://i.imgur.com/7mt9YnY.jpg",
      "https://i.imgur.com/pGbTR9B.jpg",
      "https://i.imgur.com/0MUdRd8.jpg",
      "https://i.imgur.com/FrFF4FK.jpg",
      "https://i.imgur.com/ZXSWvJm.jpg",
      "https://i.imgur.com/QsCzbI7.jpg",
      "https://i.imgur.com/rSySknj.jpg",
      "https://i.imgur.com/DvEWRgb.jpg"
    ];

    const totalImages = imageLinks.length;
    const chosenUrl = imageLinks[Math.floor(Math.random() * imageLinks.length)];

    try {
      const response = await axios({
        method: 'get',
        url: chosenUrl,
        responseType: 'stream'
      });

      response.data.path = `blackpink_${Date.now()}.jpg`;

      await message.reply({
        body: `🖤💖 **Requested Blackpink is Ready!** 💖🖤\n━━━━━━━━━━━━━━━━━━━━\n📸 Total photos: ${totalImages}\n━━━━━━━━━━━━━━━━━━━━\n✨ Blackpink forever! ✨`,
        attachment: response.data
      });
    } catch (err) {
      console.error("Blackpink error:", err);
      message.reply("❌ Failed to fetch Blackpink photo. Try again later!");
    }
  }
};
