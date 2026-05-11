const fs = require("fs-extra");
const request = require("request");

module.exports.config = {
  name: "mwmeme",
  version: "10.5.0",
  hasPermssion: 0,
  credits: "OMOR TE",
  description: "Get Random Modern Warships Meme (Image/Video)",
  commandCategory: "ModernWarships",
  usages: "/mwmeme",
  cooldowns: 5
};

module.exports.run = async ({ api, event }) => {
  const imageLinks = [
    "https://i.postimg.cc/MKVXGB2K/FB-IMG-1748861685846.jpg",
   "https://i.postimg.cc/mDgTNc5M/FB-IMG-1748861673272.jpg",
  "https://i.postimg.cc/wvwTS5m0/FB-IMG-1748861651145.jpg",
 "https://i.postimg.cc/rsgWZtVk/FB-IMG-1748861589902.jpg",
"https://i.postimg.cc/6ppzKtgc/FB-IMG-1748855776596.jpg",
"https://i.postimg.cc/L5M5k4jM/FB-IMG-1748861829020.jpg",
"https://i.postimg.cc/76JJMQcS/FB-IMG-1748861812682.jpg",
"https://i.postimg.cc/BnZ80ySR/Screenshot-2024-05-30-21-39-36-899-com-Shooter-Modern-Warships.jpg",
"https://i.postimg.cc/5tRQp3MT/1745496681398.jpg",
"https://i.postimg.cc/T3xj2GsF/FB-IMG-1748861744514.jpg",
"https://i.postimg.cc/G3MxjZHs/FB-IMG-1748861725207.jpg",
"https://i.postimg.cc/DfQtyfp3/FB-IMG-1748861717322.jpg",
"https://i.postimg.cc/rsxDr0bT/IMG-20250603-121416.jpg",
"https://i.postimg.cc/3Ngrwm6D/1749751154951.jpg",
"https://i.postimg.cc/kGrX9fjm/1749751142339.jpg",
"https://i.postimg.cc/SRSbJpsb/FB-IMG-1751103103448.jpg",
"https://i.postimg.cc/0NByX8Dr/1749751139546.jpg",
"https://i.postimg.cc/SN1X34hc/IMG-20250603-005215.jpg",
"https://i.postimg.cc/4dpVRS5s/FB-IMG-1748861884278.jpg",
"https://i.postimg.cc/Hnf29yBk/FB-IMG-1748861865724.jpg",
"https://i.postimg.cc/6Q6kSH84/FB-IMG-1748855701752.jpg",
"https://i.postimg.cc/JzQwpwzW/FB-IMG-1748855720095.jpg",
"https://i.postimg.cc/pXn11wk6/FB-IMG-1748855730590.jpg",
"https://i.postimg.cc/PqHcDSWF/FB-IMG-1748855752755.jpg",
"https://i.postimg.cc/L4QrWBSn/FB-IMG-1748855776596.jpg",
"https://i.postimg.cc/GhJSCFwF/FB-IMG-1748855538807.jpg",
"https://i.postimg.cc/ZYNMfkwD/FB-IMG-1748855594151.jpg",
"https://i.postimg.cc/G2WSczmQ/FB-IMG-1748855628374.jpg",
"https://i.postimg.cc/R0bDYvr2/FB-IMG-1748855642088.jpg",
"https://i.postimg.cc/GmKNkkXL/FB-IMG-1748855691179.jpg",
"https://i.postimg.cc/kggwPLyC/FB-IMG-1748854791532.jpg",
"https://i.postimg.cc/jdXv9RPv/FB-IMG-1748854975662.jpg",
"https://i.postimg.cc/NGRd6603/FB-IMG-1748854983062.jpg",
"https://i.postimg.cc/fbF8K5mN/FB-IMG-1748855117998.jpg",
"https://i.postimg.cc/8CsyMxF4/FB-IMG-1748855132380.jpg",
"https://i.postimg.cc/yYb3W5Hs/FB-IMG-1748854764352.jpg",
"https://i.postimg.cc/J4nBr8Sp/FB-IMG-1748854769313.jpg",
"https://i.postimg.cc/YqqQvYLf/FB-IMG-1748854777766.jpg",
"https://i.postimg.cc/Kv69WXZV/1755869112643.jpg",
"https://i.postimg.cc/YqCGwjSL/1755806643369.jpg",
"https://i.postimg.cc/sfJpfwxg/FB-IMG-1748854781882.jpg",
"https://i.postimg.cc/Y08gXqZW/FB-IMG-1748854786320.jpg",
"https://i.postimg.cc/NMsjd7cd/FB-IMG-1748854160577.jpg",
"https://i.postimg.cc/BQktJKTv/FB-IMG-1748854233403.jpg",
"https://i.postimg.cc/BbwbL8RM/FB-IMG-1748854285199.jpg",
"https://i.postimg.cc/HnLjk0vr/FB-IMG-1748854686532.jpg",
"https://i.postimg.cc/5twX72F2/FB-IMG-1748854725373.jpg",
"https://i.postimg.cc/XqZ3PsDk/FB-IMG-1748854105530.jpg",
"https://i.postimg.cc/JnzRNrNg/FB-IMG-1748854113932.jpg",
"https://i.postimg.cc/xdR0NJzM/FB-IMG-1748854120098.jpg",
"https://i.postimg.cc/FKmrKg7h/FB-IMG-1748854130123.jpg",
"https://i.postimg.cc/zXbX2GsY/FB-IMG-1748854147170.jpg",
"https://i.postimg.cc/nL8k9MJF/FB-IMG-1748853904481.jpg",
"https://i.postimg.cc/0QDhKh33/FB-IMG-1748853979693.jpg",
"https://i.postimg.cc/fL1TM4dr/FB-IMG-1748854013776.jpg",
"https://i.postimg.cc/YSnCyLCk/FB-IMG-1748854061174.jpg",
"https://i.postimg.cc/L6Lh6sNB/FB-IMG-1748854084653.jpg",
"https://i.postimg.cc/Qdc7Pb2D/Screenshot-2024-05-30-21-39-36-899-com-Shooter-Modern-Warships.jpg",
"https://i.postimg.cc/rszWPLkZ/Image-Download-02-06-2025-02-43-31.jpg",
 "https://i.postimg.cc/fbjx3KCC/Image-Download-02-06-2025-02-43-47.jpg",
  "https://i.postimg.cc/dVCRFvTz/Image-Download-02-06-2025-02-43-53.jpg",
   "https://i.postimg.cc/vTS7YZhd/Image-Download-02-06-2025-02-44-07.jpg",
    "https://i.postimg.cc/prG8sjvN/Image-Download-02-06-2025-01-15-49.jpg",

    // ⬆️ Add more image URLs here
  ];

  const videoLinks = [
    "https://github.com/user-attachments/assets/3ef93d9d-ccde-4203-aba0-884416cb5711",
   "https://github.com/user-attachments/assets/b8f8a86f-74e3-4931-9073-a6ea110e79d6",
  "https://github.com/user-attachments/assets/7ef11b79-f0fc-4008-a952-b5e0351f9d1b",
 "https://github.com/user-attachments/assets/70a2be53-5b7b-47b8-9838-bcbcee1f9e2b",
"https://github.com/user-attachments/assets/5b02c324-e13e-41b2-84f8-566eb31f4628",
"https://github.com/user-attachments/assets/494ea0be-b48e-4227-879a-530d13e92f7f",
"https://github.com/user-attachments/assets/a20d1b34-9650-43db-a747-d517b31b581a",
"https://github.com/user-attachments/assets/20f45d08-1cba-4813-b847-efad05c644f5",
"https://github.com/user-attachments/assets/c79182a6-08a2-4071-ba5f-b72182778d83",
"https://github.com/user-attachments/assets/ec691840-e406-44d1-b306-8302c4db7a0c",
"https://github.com/user-attachments/assets/751f5845-9e70-4277-947f-620e0a60e944",
"https://github.com/user-attachments/assets/81494d39-5e29-461b-a1f8-78975141ee46",
"https://github.com/user-attachments/assets/46fd132f-e6d7-45e4-b046-f79f9587a76c",
"https://github.com/user-attachments/assets/46b32242-974a-44b1-8f19-c327901b3b55",
"https://github.com/user-attachments/assets/608e54a9-c111-4f05-9bbc-7aa681094f17",
"https://github.com/user-attachments/assets/e46cca48-ae90-41de-b284-8080627cf4f8",
"https://github.com/user-attachments/assets/9a0df82a-a9fe-44aa-ac25-db25bb7e307a",
"https://github.com/user-attachments/assets/5b0274b6-edc5-48c0-b42b-c111e7282526",
"https://github.com/user-attachments/assets/36cf2130-9523-44bd-8f96-fbce8c972ec6",
"https://github.com/user-attachments/assets/c985bc23-43b7-4d0a-90b8-b82571e5d2e4",
"https://github.com/user-attachments/assets/0786064b-b00a-46c2-b9ad-4a9042fbe669",
"https://github.com/user-attachments/assets/100c33d1-3569-466b-8f66-2a0085a3f393",
"https://github.com/user-attachments/assets/8107f897-0426-478a-ab20-502ec8d596d7",
"https://github.com/user-attachments/assets/d08a0235-d652-47e3-952d-d2ce157bac94",
"https://github.com/user-attachments/assets/88a25dcf-6932-4975-b7b2-daa5a28ef036",
"https://github.com/user-attachments/assets/e2997238-6326-474e-b3e5-6db6ab7f5ae1",
"https://github.com/user-attachments/assets/e8bb1978-d843-412a-b780-ee4f9324078c",
"https://github.com/user-attachments/assets/7362cfce-0391-4c3a-b688-84bf6fd2b4c8",
"https://github.com/user-attachments/assets/e6b50251-cec4-4473-aa4d-482a0a1e2343",
"https://github.com/user-attachments/assets/45b74ba8-a993-40e6-8534-ce534f333e3e",
"https://github.com/user-attachments/assets/09165223-6056-4079-947d-575b97da963c",
"https://github.com/user-attachments/assets/523c097b-71e6-40b5-ade0-1e657c8bbffe",
"https://github.com/user-attachments/assets/ff64fade-bec7-4682-b95c-0a6c518a9bc2",
"https://github.com/user-attachments/assets/1b67e477-8893-4dee-a7cb-0c1aceedb62a",
"https://github.com/user-attachments/assets/6d4c4720-66a0-4da7-b5bd-4503cd2e3089",
"https://github.com/user-attachments/assets/24bd11f3-4c6f-4110-b8ca-01bd6eeb6701",
"https://github.com/user-attachments/assets/240cabf1-0b26-4ad7-9cc8-913b7efa67e1",
"https://github.com/user-attachments/assets/6941fea9-4537-4031-bca1-a2d2211f1ac3",
"https://github.com/user-attachments/assets/deb05791-1fa8-4408-83e9-95bc0a07e6aa",
 "https://github.com/user-attachments/assets/1e0fd697-f08d-4662-9dea-514cbfb49966",
  "https://github.com/user-attachments/assets/474c300f-8e94-43b7-a307-5e16b74bd75c",
   "https://github.com/user-attachments/assets/892fc556-fb4c-4f4b-bb77-7065a83207e4",
    "https://github.com/user-attachments/assets/273347e8-1430-443a-a90e-5e784d38db58",
    
    // ⬆️ Add more video URLs here (Must be direct MP4 links)
  ];

  const totalMemes = imageLinks.length + videoLinks.length;

  // Send confirmation message
  api.sendMessage(`📦 Random Modern Warships Meme is loading...\n🖼️♻️ Total memes in stock: ${totalMemes}`, event.threadID, async (err, info) => {
    if (err) return console.error(err);

    // Unsend confirmation message after 45 seconds = 45000 milliseconds
    setTimeout(() => {
      api.unsendMessage(info.messageID);
    }, 45000);

    // Randomly choose image or video section
    const isVideo = Math.random() < 0.5 && videoLinks.length > 0;
    const chosenLinks = isVideo ? videoLinks : imageLinks;
    const chosenUrl = chosenLinks[Math.floor(Math.random() * chosenLinks.length)];
    const ext = isVideo ? ".mp4" : ".jpg";
    const filePath = `${__dirname}/cache/mwmeme${ext}`;
    fs.ensureDirSync(__dirname + "/cache");

    // Download and send meme
    request(encodeURI(chosenUrl))
      .pipe(fs.createWriteStream(filePath))
      .on("close", () => {
        api.sendMessage({
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      })
      .on("error", (err) => {
        console.error("Download error:", err);
        api.sendMessage("⚠️ Failed to fetch meme.", event.threadID);
      });
  });
};
      
