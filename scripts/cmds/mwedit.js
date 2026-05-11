const fs = require("fs-extra");
const request = require("request");

module.exports.config = {
  name: "mwedit",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "OMOR TE",
  description: "Get Random Modern Warships Editz (Video)",
  commandCategory: "ModernWarships",
  usages: "/mwedit",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  const videoLinks = [
     "https://github.com/user-attachments/assets/05e2b19e-cb56-4804-80bc-df9d35be5c30",
    "https://github.com/user-attachments/assets/9cef1e5b-520e-4ad2-9c99-fa4fc260d108",
   "https://github.com/user-attachments/assets/4c5b17b8-05a1-4675-8ca6-3b42562e97a1",
  "https://github.com/user-attachments/assets/4e7d06e9-8932-42a5-b248-f680e22ca1b8",
 "https://github.com/user-attachments/assets/cf5e4eaf-dc11-4fec-9136-88d47dd2aae5",
"https://github.com/user-attachments/assets/8b1c0353-a704-4b90-b3be-075380db7770",
"https://github.com/user-attachments/assets/25fced15-e946-4e29-b621-8f9b73886609",
"https://github.com/user-attachments/assets/f8634ab2-ba3e-4a39-a3b6-62e7d073a789",
"https://github.com/user-attachments/assets/bb07b9d4-f4fc-4a8b-9de8-d309df72c54c",
"https://github.com/user-attachments/assets/169923d4-3dc6-4121-b569-cb98253aa576",
"https://github.com/user-attachments/assets/84c2be1d-a81b-4a22-8d93-efe3b6b3ac9a",
"https://github.com/user-attachments/assets/0a5a388e-521d-4717-b1a2-4c0cb2f36d90",
"https://github.com/user-attachments/assets/de108605-eca0-4d52-9126-b2cb2eafc29a",
"https://github.com/user-attachments/assets/4748c9cd-907d-4d82-ad60-32be1ad5be13",
"https://github.com/user-attachments/assets/f2d33c8c-e202-4a9e-8986-7eccaf423e22",
"https://github.com/user-attachments/assets/ea8d535d-871c-46dd-b4e6-9e60f1217c8e",
"https://github.com/user-attachments/assets/2ada5e50-ef71-4091-a3a3-78b41fe4b03f",
"https://github.com/user-attachments/assets/8fd8bd35-6014-41d0-b2d6-33682e68719c",
"https://github.com/user-attachments/assets/5123d5bf-8635-4a00-95ac-4c8b2cd566e0",
"https://github.com/user-attachments/assets/7e6c6e5c-13ef-43c3-bd02-a0e12da3e226",
"https://github.com/user-attachments/assets/751f5845-9e70-4277-947f-620e0a60e944",
"https://github.com/user-attachments/assets/9ed58b32-37c5-4b0c-aef4-fd42c74023b5",
"https://github.com/user-attachments/assets/89e8f25a-2e75-4dea-a131-714c663a2fef",
"https://github.com/user-attachments/assets/24a0b167-a1d6-41b0-a05d-0ddc021c14fa",
"https://github.com/user-attachments/assets/19716350-1e17-4a12-9bb8-93b91349777f",
"https://github.com/user-attachments/assets/d1c1e30f-a6cb-4a37-a9c8-3d13ceeaac50",
"https://github.com/user-attachments/assets/0d31ed12-961b-444d-880a-526d12ef1811",
"https://github.com/user-attachments/assets/7c9a206b-6a4c-40a7-8ffa-e77b7f2393c1",
"https://github.com/user-attachments/assets/42bfb237-988a-4b23-948f-7138a1468a7c",
"https://github.com/user-attachments/assets/4a0061f8-ffe2-4841-a8cf-ce70a0137854",
"https://github.com/user-attachments/assets/ebff18e3-3811-4bc3-aba1-31289d65f5a8",
"https://github.com/user-attachments/assets/90f08807-1879-4f1a-994d-ad4ae182e201",
 "https://github.com/user-attachments/assets/83023c99-dd3c-4d40-aaf1-d9496e478886",
  "https://github.com/user-attachments/assets/dd95c868-ec6c-4c18-9a29-58d13b18aa63",
   "https://github.com/user-attachments/assets/4b57c89f-4bcd-434b-93f3-95700f608e1c",
    "https://github.com/user-attachments/assets/e1bd9d3c-c567-4ea4-9143-9aba2e91eced",
     "https://github.com/user-attachments/assets/4e1392b7-8dd6-458f-b94c-b44105bcf273",
    
    // 🔁 Add more direct MP4 video URLs here
  ];

  const totalVideos = videoLinks.length;

  // Send loading message
  api.sendMessage(`📹📦 Random Modern Warships Editz is loading...\n🎥♻️ Total MW Editz videos in stock: ${totalVideos}`, event.threadID, async (err, info) => {
    if (err) return console.error(err);

    // Unsend the loading message after 45 seconds
    setTimeout(() => {
      api.unsendMessage(info.messageID);
    }, 45000);

    // Randomly select a video
    const chosenUrl = videoLinks[Math.floor(Math.random() * videoLinks.length)];
    const filePath = `${__dirname}/cache/mwedit.mp4`;
    fs.ensureDirSync(__dirname + "/cache");

    // Download and send video
    request(encodeURI(chosenUrl))
      .pipe(fs.createWriteStream(filePath))
      .on("close", () => {
        api.sendMessage({
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      })
      .on("error", (err) => {
        console.error("Download error:", err);
        api.sendMessage("⚠️ Something went wrong while fetching video from stock", event.threadID);
      });
  });
};
