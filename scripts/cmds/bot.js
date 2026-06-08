const fs = require("fs-extra");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "obot",
    version: "2.0.1",
    author: "OMOR TE",
    role: 0,
    shortDescription: "Interactive assistant bot",
    longDescription: "Noprefix interactive bot that responds to messages",
    category: "noprefix",
    guide: "{p}{n} - Trigger with 'bot' or specific keywords"
  },

  onEvent: async function ({ api, event, Users }) {
    const { threadID, messageID, body, senderID } = event;
    
    if (!body) return;
    if (senderID === api.getCurrentUserID()) return;
    
    const msgLower = body.toLowerCase().trim();
    const name = await Users.getNameUser(senderID);
    
    // র‍্যান্ডম রেসপন্স
    const responses = [
      "আপনাকে কিভাবে সাহায্য করতে পারি? 😊",
      "হ্যালো! কেমন আছেন আপনি? 🌼",
      "আপনার জন্য কি করতে পারি? 🤗",
      "আপনার কথা শুনছি, বলুন... 👂",
      "আজকে আপনার দিন কেমন যাচ্ছে? ☀️",
      "আমি এখানে আছি আপনাকে সাহায্য করার জন্য! 💖",
      "কিছু বলতে চাচ্ছেন? 😊",
      "আপনার জন্য অপেক্ষা করছি... ⏳",
      "সুন্দর একটা দিন হোক আপনার! 🩷",
      "আমার সাথে চ্যাট করতে ভালো লাগছে! 😊",
      "আপনার স্মার্ট অ্যাসিস্টেন্ট রেডি! 💡",
      "কি নতুন কিছু শিখতে চান আজ? 📚",
      "আপনার কথা শুনে আমি আনন্দিত! 😊"
    ];
    
    const randResponse = responses[Math.floor(Math.random() * responses.length)];
    
    // নির্দিষ্ট কীওয়ার্ডের রেসপন্স
    if (msgLower === "miss you") {
      return api.sendMessage("আপনাকে দেখে ভালো লাগছে! 😊", threadID);
    }
    
    if (msgLower === "assalamualaikum" || msgLower === "salam") {
      return api.sendMessage("ওয়ালাইকুম আসসালাম! 🤲", threadID);
    }
    
    if (msgLower === "thank you" || msgLower === "thanks") {
      return api.sendMessage("আপনাকে স্বাগতম! 😊", threadID);
    }
    
    if (msgLower === "how are you" || msgLower === "kemon acho") {
      return api.sendMessage("আমি ভালো আছি, ধন্যবাদ! আপনার দিনটি ভালো যাক 🌸", threadID);
    }
    
    if (msgLower === "owner" || msgLower === "creator") {
      return api.sendMessage("এই বটটি Omor TE দ্বারা তৈরি হয়েছে", threadID);
    }
    
    if (msgLower === "help" || msgLower === "sahajjo") {
      return api.sendMessage("আমি আপনাকে সাহায্য করতে পারি: 1. তথ্য খুঁজে দিতে 2. সময় জানাতে 3. গান/ছবি সাজেস্ট করতে। কী চান?", threadID);
    }
    
    if (msgLower === "time" || msgLower === "somoy") {
      const currentTime = moment().tz("Asia/Dhaka").format("hh:mm:ss A DD/MM/YYYY");
      return api.sendMessage(`এখন বাংলাদেশ সময়: ${currentTime} ⏰`, threadID);
    }
    
    if (msgLower === "i love you" || msgLower === "valobashi") {
      return api.sendMessage("ধন্যবাদ! 😊 মানুষ ও প্রযুক্তির মধ্যে সুন্দর সম্পর্ক গড়ে উঠুক ❤️", threadID);
    }
    
    // বট ট্রিগার (শুধু "bot" বা "obot" দিয়ে শুরু হলে)
    if (msgLower.startsWith("bot") || msgLower.startsWith("obot")) {
      return api.sendMessage(`${name}, ${randResponse}`, threadID);
    }
  },

  onStart: async function ({ message }) {
    // This is for prefix command (optional)
    // User can also use !obot to get help
    message.reply("🤖 হ্যালো! আমি ওবোট, আপনার সহকারী। আমাকে 'bot' বা 'obot' লিখে ডাকতে পারেন।");
  }
};
