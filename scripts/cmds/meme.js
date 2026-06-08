const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "meme",
    aliases: ["memes"],
    version: "1.8",
    author: "Omor TE",
    countDown: 10,
    role: 0,
    shortDescription: "Random Meme Image & Video",
    longDescription: "Get random memes from API or local collection (images & videos)",
    category: "fun",
    guide: "{p}meme"
  },

  onStart: async function({ message, event, api }) {
    // লোকাল ইমেজ লিংক
    const localImageLinks = [
      "https://i.imgur.com/zoQxUwC.jpg", "https://i.imgur.com/bXVBasN.jpg", "https://i.imgur.com/E3bMZMM.jpg", "https://i.imgur.com/pkchwDe.jpg", "https://i.imgur.com/PFV6etU.jpg", "https://i.imgur.com/DLElS0y.jpg", "https://i.imgur.com/6hufzML.jpg", "https://i.imgur.com/ikevA6M.jpg", "https://i.imgur.com/aGuU2tB.jpg", "https://i.imgur.com/tsUsL6B.jpg", "https://i.imgur.com/sAUL2X0.jpg", "https://i.imgur.com/fGSX9z3.jpg", "https://i.imgur.com/TeT8dXA.jpg", "https://i.imgur.com/kCnHvly.jpg", "https://i.imgur.com/wfB1cU7.jpg", "https://i.imgur.com/dmUAjtN.jpg", "https://i.imgur.com/RqaTxa4.jpg", "https://i.imgur.com/gXFNJGi.jpg", "https://i.imgur.com/DwDTSsS.jpg", "https://i.imgur.com/BSreuve.jpg", "https://i.imgur.com/B6TOC4a.jpg", "https://i.imgur.com/S83pmyW.jpg", "https://i.imgur.com/7FNPBkX.jpg", "https://i.imgur.com/SIdbUrD.jpg", "https://i.imgur.com/ErngTHc.jpg", "https://i.imgur.com/onfBoPC.jpg", "https://i.imgur.com/UVk3zcd.jpg", "https://i.imgur.com/3aOuDZ9.jpg", "https://i.imgur.com/OHfqttV.jpg", "https://i.imgur.com/aiNRtVF.jpg", 
      "https://i.imgur.com/rgPnYTJ.jpg", "https://i.imgur.com/YOVZBYH.jpg", "https://i.imgur.com/aiFNcBf.jpg", "https://i.imgur.com/FbI0kGj.jpg", "https://i.imgur.com/QOMUwDy.jpg", "https://i.imgur.com/UP8wysc.jpg", "https://i.imgur.com/seb2NbZ.jpg", "https://i.imgur.com/YdcVmTe.jpg", "https://i.imgur.com/WjkPmwu.jpg", "https://i.imgur.com/z7ZeFky.jpg", "https://i.imgur.com/H8YGlIn.jpg", "https://i.imgur.com/gjCymKq.jpg", "https://i.imgur.com/4XiF5dQ.jpg", "https://i.imgur.com/Nd5nrJW.jpg", "https://i.imgur.com/C4f0pdf.jpg", "https://i.imgur.com/EO0YsOT.jpg", "https://i.imgur.com/dKEAsb9.jpg", "https://i.imgur.com/7zfnhkO.jpg", "https://i.imgur.com/LrOjwMX.jpg", "https://i.imgur.com/7wAImE3.jpg", "https://i.imgur.com/D8Kzo1X.jpg", "https://i.imgur.com/VTXRcYo.jpg", "https://i.imgur.com/BcjRdU8.jpg", "https://i.imgur.com/hNb9WCk.jpg", "https://i.imgur.com/8GM1pn9.jpg",
      "https://i.postimg.cc/m2RqmFJ0/received-988705540188205.jpg",
      "https://i.postimg.cc/W3kKHmsn/received-2032387540822027.jpg",
      "https://i.postimg.cc/xjHDxQCQ/received-1228619902538925.jpg",
      "https://i.postimg.cc/zXZ58BML/FB-IMG-1780515532989.jpg",
      "https://i.postimg.cc/MGPqSY2H/FB-IMG-1780579839034.jpg",
      "https://i.postimg.cc/HxD3jqgd/FB-IMG-1780327233991.jpg",
      "https://i.postimg.cc/fb0Bzw1K/FB-IMG-1780459789419.jpg",
      "https://i.postimg.cc/8zYZgFXc/FB-IMG-1780463496475.jpg",
      "https://i.postimg.cc/L6NyvQz1/received-1526853475599627.jpg",
      "https://i.postimg.cc/qBcD6vqn/Messenger-creation-2110929899824947.jpg",
      "https://i.postimg.cc/JnxJmv7h/FB-IMG-1778511983854.jpg",
      "https://i.postimg.cc/YScQxQyr/FB-IMG-1764079048928.jpg",
      "https://i.postimg.cc/TwJj1h0q/FB-IMG-1778428096386.jpg",
      "https://i.postimg.cc/Vk2WHx5z/FB-IMG-1779073533124.jpg",
      "https://i.postimg.cc/Dyjg1JTd/FB-IMG-1778818872132.jpg"
      
    ];

    // ✅ ভিডিও লিংক (আপনার দেওয়া সব ভিডিও)
    const localVideoLinks = [ 
"https://github.com/user-attachments/assets/42a209cd-319e-4c3d-a544-a45c887317c9",
  "https://github.com/user-attachments/assets/17ae0a26-6f97-483a-9628-295c2bdede3b",
    "https://github.com/user-attachments/assets/7ebb80ab-69bf-40cf-aaca-ed4371dcc908",
      "https://github.com/user-attachments/assets/2c0822d4-c7ec-412c-8f31-ddf03c26bbcb",
      "https://github.com/user-attachments/assets/51b69096-f407-4155-a3fb-82fbe02eb98d",
      "https://github.com/user-attachments/assets/bfd06a2d-0f36-4e8c-8ab5-f0457fb5bdaf",
      "https://github.com/user-attachments/assets/10131710-b2a3-4dfe-bb5a-2920641d57f3",
      "https://github.com/user-attachments/assets/885a3d0b-87a0-4fc3-a12a-c6a4b08f0889",
      "https://github.com/user-attachments/assets/2770cf2d-60e4-412a-b672-9c11c8f66595",
      "https://github.com/user-attachments/assets/56ff509f-5248-4d38-82fa-cd8bc7df43d6",
      "https://github.com/user-attachments/assets/44d51f08-44fb-4429-bf51-8af75b21a410",
      "https://github.com/user-attachments/assets/92f63239-1783-4ed4-8464-25481fbc800e",
      "https://github.com/user-attachments/assets/0bee0f4f-ada7-4b8b-b12e-780e56c431ba",
      "https://github.com/user-attachments/assets/65129d72-c807-41b2-b15a-74e554d5f247",
      "https://github.com/user-attachments/assets/8a8bd3be-d6c7-420b-9e0a-d0830a94c0f5",
      "https://github.com/user-attachments/assets/a21a527d-727f-42da-8814-d4b809945eb2",
      "https://github.com/user-attachments/assets/e1c52418-d5f5-4fd5-ab63-f35ee5ee4090",
      "https://github.com/user-attachments/assets/9fb1f7be-1313-4642-bf5b-51a190128bd9",
      "https://github.com/user-attachments/assets/0619aa8d-ca55-441a-bf8c-aad10da7f320",
      "https://github.com/user-attachments/assets/6e0d4c00-5e87-422c-995e-d0619f7c8da6",
      "https://github.com/user-attachments/assets/8e92a351-8edd-4c50-92ff-a33b19c4a52e",
      "https://github.com/user-attachments/assets/856be002-5b8f-4825-ac99-282090b62eb5",
      "https://github.com/user-attachments/assets/67d56817-cdd1-4bde-88c9-64eb13343906",
      "https://github.com/user-attachments/assets/8a2feb83-7430-40b5-b2d9-73e2d473367c",
      "https://github.com/user-attachments/assets/97f6faa3-a7c9-4deb-beb9-aef01f19e5a1",
      "https://github.com/user-attachments/assets/86378c39-eed9-499f-81da-197820c96795",
      "https://github.com/user-attachments/assets/e57d483d-0973-4e60-873c-82b5a73aafcf",
    "https://github.com/user-attachments/assets/5f75f255-d259-4aab-ab88-02523ecd2400",
  "https://github.com/user-attachments/assets/c30d96a1-e024-4be7-a3e3-24c1395bc1bc",
"https://github.com/user-attachments/assets/a859e9c4-0820-403c-bd47-f962cdee6ec3",
"https://github.com/user-attachments/assets/602c9f34-d4f7-4234-af0c-a9062c2bac93",
"https://github.com/user-attachments/assets/46a5d545-4db9-47d9-aef8-5385b97c2df7",
"https://github.com/user-attachments/assets/a8cd7ead-2f13-4d5b-b1e0-456593bde764",
"https://github.com/user-attachments/assets/a8e206be-4180-4b79-bf64-977d364029b1",
"https://github.com/user-attachments/assets/7ee2a7a9-d846-44e0-ac39-bd5890f96b11",
"https://github.com/user-attachments/assets/281a1409-78cb-4db3-b194-a1449f648c7d",
"https://github.com/user-attachments/assets/7bf8ad0a-1aea-43a4-8e66-cfa7ccb5ff9d",
"https://github.com/user-attachments/assets/13f0fb0e-771b-47ee-9da9-b2c8e3a178a2",
"https://github.com/user-attachments/assets/b7a19c6d-9ad2-4bff-916e-0fe3a4fce589",
"https://github.com/user-attachments/assets/1150f586-e9ce-4c73-a520-cca7a6c7ef26",
"https://github.com/user-attachments/assets/65655530-8f0a-4e7e-afd8-9155b24d91bf",
"https://github.com/user-attachments/assets/5137ae4f-5a97-4e2c-b5f7-4ee03bd429b3",
"https://github.com/user-attachments/assets/3ec3188a-8137-4fa1-96c8-d51d16845194",
"https://github.com/user-attachments/assets/368afb40-46c5-4e99-b0e5-23984e0047d8",
"https://github.com/user-attachments/assets/bbb60718-6867-416d-addb-9957e6ea1215",
"https://github.com/user-attachments/assets/b990e704-30dd-4772-9ca4-b199b3766f39",
    ];

    // ✅ র‍্যান্ডমলি সোর্স সিলেক্ট (33% API, 33% লোকাল ইমেজ, 34% লোকাল ভিডিও)
    const randomChoice = Math.random();
    const useApi = randomChoice < 0.33;
    const useVideo = !useApi && randomChoice < 0.66;
    
    try {
      let mediaUrl;
      let source = "";
      let isVideo = false;
      
      if (useApi && localImageLinks.length > 0) {
        // লোকাল ইমেজ থেকে নিবে
        mediaUrl = localImageLinks[Math.floor(Math.random() * localImageLinks.length)];
        source = "📚 Local Meme Collection";
        isVideo = false;
      } else if (useVideo && localVideoLinks.length > 0) {
        // লোকাল ভিডিও থেকে নিবে
        mediaUrl = localVideoLinks[Math.floor(Math.random() * localVideoLinks.length)];
        source = "🎬 Local Video Collection";
        isVideo = true;
      } else {
        // API থেকে নেওয়ার চেষ্টা
        try {
          const apiUrl = await mahmud();
          const res = await axios.get(`${apiUrl}/api/meme`);
          mediaUrl = res.data?.imageUrl;
          source = "🌐 API";
          isVideo = false;
          
          if (!mediaUrl) {
            // API fail হলে লোকাল ইমেজ ব্যাকআপ
            mediaUrl = localImageLinks[Math.floor(Math.random() * localImageLinks.length)];
            source = "📚 Local Backup";
            isVideo = false;
          }
        } catch (apiError) {
          // API error হলে লোকাল ভিডিও বা ইমেজ ব্যবহার
          if (localVideoLinks.length > 0 && Math.random() < 0.5) {
            mediaUrl = localVideoLinks[Math.floor(Math.random() * localVideoLinks.length)];
            source = "🎬 Local Video (API failed)";
            isVideo = true;
          } else {
            mediaUrl = localImageLinks[Math.floor(Math.random() * localImageLinks.length)];
            source = "📚 Local Image (API failed)";
            isVideo = false;
          }
        }
      }
      
      if (!mediaUrl) {
        return message.reply("❌ No memes available. Please try again later.");
      }
      
      const stream = await axios({
        method: "GET",
        url: mediaUrl,
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      
      const mediaType = isVideo ? "video" : "meme";
      const emoji = isVideo ? "🎬" : "😂";
      const totalCount = (isVideo ? localVideoLinks.length : localImageLinks.length);
      
      await message.reply({
        body: `${emoji} | Here's your random ${mediaType}!\n📌 Source: ${source}\n📦 Total ${isVideo ? 'videos' : 'memes'}: ${totalCount}`,
        attachment: stream.data
      });
      
    } catch (error) {
      console.error("Meme error:", error);
      // লাস্ট চান্স: লোকাল থেকে সরাসরি
      try {
        let fallbackUrl;
        let isVideoFallback = false;
        
        if (localVideoLinks.length > 0 && Math.random() < 0.5) {
          fallbackUrl = localVideoLinks[Math.floor(Math.random() * localVideoLinks.length)];
          isVideoFallback = true;
        } else {
          fallbackUrl = localImageLinks[Math.floor(Math.random() * localImageLinks.length)];
        }
        
        const fallbackStream = await axios({
          method: "GET",
          url: fallbackUrl,
          responseType: "stream"
        });
        
        const fallbackType = isVideoFallback ? "video" : "meme";
        await message.reply({
          body: `${isVideoFallback ? "🎬" : "😂"} | Here's your random ${fallbackType}! (Backup)`,
          attachment: fallbackStream.data
        });
      } catch (finalError) {
        message.reply("❌ An error occurred while fetching meme.");
      }
    }
  }
};
