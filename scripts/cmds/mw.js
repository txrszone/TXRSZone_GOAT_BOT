const axios = require("axios");
const request = require("request");
const fs = require("fs-extra");

module.exports.config = {
  name: "mw",
  version: "2.3.0",
  hasPermssion: 0,
  credits: "OMOR TE",
  description: "Get Random Modern Warships game photos",
  commandCategory: "ModernWarships",
  usages: "mw",
  cooldowns: 4,
  dependencies: {
    "request": "",
    "fs-extra": "",
    "axios": ""
  }
};

module.exports.run = async ({ api, event }) => {
  const links = [
    "https://i.postimg.cc/0jRGknT9/FB-IMG-1744474199349.jpg",
    "https://i.postimg.cc/Y9KK7KC0/Polish-20250526-101350151.jpg",
    "https://i.postimg.cc/brgK1ZHS/Hitube-c-Rb-Pat-Cm-XZ-2025-05-26-10-05-46.jpg",
    "https://i.postimg.cc/MT84479j/Hitube-Bt4-Wyjgo-WZ-2025-05-26-10-05-58.jpg",
    "https://i.postimg.cc/YS8YKk3f/received-395252956651820.jpg",
    "https://i.postimg.cc/0N5ZJVXn/a844a740b33eba79b486744759914953-1.jpg",
    "https://i.postimg.cc/VNvjbDPq/Image-Download-26-05-2025-09-56-48.jpg",
    "https://i.postimg.cc/Kvq0RKdg/Image-Download-02-06-2025-01-03-04.jpg",
"https://i.postimg.cc/T3bnfpGx/Image-Download-02-06-2025-01-03-10.jpg",
"https://i.postimg.cc/76Hz39zP/Image-Download-02-06-2025-01-04-20.jpg",
"https://i.postimg.cc/tgKm6WSG/1752831886121.jpg",
"https://i.postimg.cc/zGdsyLYq/1752831883518.jpg",
"https://i.postimg.cc/X7GCkpr5/Image-Download-02-06-2025-01-04-37.jpg",
"https://i.postimg.cc/Kv69WXZV/1755869112643.jpg",
"https://i.postimg.cc/4NQZf1mW/IMG-20250825-WA0000.jpg",
"https://i.postimg.cc/pr9pC6Lv/Image-Download-02-06-2025-01-05-03.jpg",
"https://i.postimg.cc/nr6MPGXD/Image-Download-02-06-2025-01-05-14.jpg",
"https://i.postimg.cc/28Z1BMtF/Image-Download-02-06-2025-01-05-26.jpg",
"https://i.postimg.cc/BQfGvzfK/Image-Download-02-06-2025-01-12-05.jpg",
"https://i.postimg.cc/XYQMQ7Gf/Image-Download-02-06-2025-01-12-12.jpg",
"https://i.postimg.cc/ncGNhc1y/Image-Download-02-06-2025-01-12-20.jpg",
"https://i.postimg.cc/zBhcZJBP/Image-Download-02-06-2025-01-13-22.jpg",
"https://i.postimg.cc/kMxpTXL2/Image-Download-02-06-2025-01-13-26.jpg",
"https://i.postimg.cc/bwFCZGSB/Image-Download-02-06-2025-01-13-30.jpg",
"https://i.postimg.cc/0y6GHVrV/Image-Download-02-06-2025-01-14-21.jpg",
"https://i.postimg.cc/CxWCybqS/Image-Download-02-06-2025-01-15-20.jpg",
"https://i.postimg.cc/LXSz5RDW/Image-Download-02-06-2025-01-15-29.jpg",
"https://i.postimg.cc/prG8sjvN/Image-Download-02-06-2025-01-15-49.jpg",
"https://i.postimg.cc/sxkfff9Q/Image-Download-02-06-2025-01-15-56.jpg",
"https://i.postimg.cc/YSrrCsg3/Image-Download-02-06-2025-01-16-00.jpg",
"https://i.postimg.cc/63TBd4M4/Image-Download-02-06-2025-01-16-07.jpg",
"https://i.postimg.cc/kXWRVL63/Image-Download-02-06-2025-01-16-45.jpg",
"https://i.postimg.cc/QtBHjzGz/Image-Download-02-06-2025-01-16-54.jpg",
"https://i.postimg.cc/KjBjMgYr/Image-Download-02-06-2025-01-17-48.jpg",
"https://i.postimg.cc/Xq600Y52/1751466896091.jpg",
"https://i.postimg.cc/kXF7qKfW/FB-IMG-1751783081009.jpg",
"https://i.postimg.cc/4d7Jg0S3/FB-IMG-1751783085277.jpg",
"https://i.postimg.cc/zG7DSKhq/FB-IMG-1751783088792.jpg",
"https://i.postimg.cc/0ycQDv93/Image-Download-02-06-2025-01-17-53.jpg",
"https://i.postimg.cc/R0h0TYF0/Image-Download-02-06-2025-01-18-36.jpg",
"https://i.postimg.cc/5tr2KmYS/Screenshot-2025-06-02-13-21-59-497-com-Shooter-Modern-Warships.jpg",
"https://i.postimg.cc/T1MYfYcy/Screenshot-2025-06-02-13-22-06-934-com-Shooter-Modern-Warships.jpg",
"https://i.postimg.cc/XqVmwRjH/Image-Download-02-06-2025-01-55-39.jpg",
"https://i.postimg.cc/jdSBCYkC/Image-Download-02-06-2025-01-56-01.jpg",
"https://i.postimg.cc/25hKgk39/Image-Download-02-06-2025-01-56-07.jpg",
"https://i.postimg.cc/wvkbTwXh/Image-Download-02-06-2025-01-56-11.jpg",
"https://i.postimg.cc/XJnQh9RX/Image-Download-02-06-2025-01-56-33.jpg",
"https://i.postimg.cc/yxdn6sYH/Image-Download-02-06-2025-01-57-06.jpg",
"https://i.postimg.cc/y6QvQgvY/Image-Download-02-06-2025-01-58-16.jpg",
"https://i.postimg.cc/JzJxzTmG/Image-Download-02-06-2025-01-58-19.jpg",
"https://i.postimg.cc/bJ6HBW0F/Image-Download-02-06-2025-01-58-35.jpg",
"https://i.postimg.cc/fbDcTDBr/Image-Download-02-06-2025-01-59-21.jpg",
"https://i.postimg.cc/8cJWn5zj/Image-Download-02-06-2025-01-59-28.jpg",
"https://i.postimg.cc/NF3ThcKb/Image-Download-02-06-2025-01-59-54.jpg",
"https://i.postimg.cc/d0MhqYjT/FB-IMG-1748855056576.jpg",
"https://i.postimg.cc/tghYJMBv/FB-IMG-1748855063027.jpg",
"https://i.postimg.cc/ZnqRfK4X/FB-IMG-1748855065465.jpg",
"https://i.postimg.cc/MZsXnRYw/FB-IMG-1748855075592.jpg",
"https://i.postimg.cc/YCtFS03n/FB-IMG-1748855056576.jpg",
"https://i.postimg.cc/cCDp8r3R/FB-IMG-1748855063027.jpg",
"https://i.postimg.cc/sxDFXpMf/FB-IMG-1748855065465.jpg",
"https://i.postimg.cc/DZcknCyY/FB-IMG-1748855075592.jpg",
  ];

  const imgURL = links[Math.floor(Math.random() * links.length)];
  const filePath = __dirname + "/cache/5.jpg";

  // Make sure cache folder exists
  fs.ensureDirSync(__dirname + "/cache");

  const callback = () => {
    api.sendMessage({
      body: `-» Random Modern Warships game Photo «-\n \n🖼️ Total Available images: ${links.length}`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath));
  };

  request(encodeURI(imgURL))
    .pipe(fs.createWriteStream(filePath))
    .on("close", callback)
    .on("error", err => {
      console.error("Image download failed:", err);
      api.sendMessage("⚠️ Failed to download image.", event.threadID);
    });
};
  
