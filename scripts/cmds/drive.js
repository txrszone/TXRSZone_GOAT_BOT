const axios = require('axios');

module.exports = {
  config: {
    name: "drive",
    version: "1.0",
    author: "•OMOR TE•",
    countDown: 5,
    role: 2,
    shortDescription: "Google Drive Upload",
    longDescription: "Upload video or media to Google Drive and return shareable URL",
    guide: "{p}drive <URL> or reply to a media message",
    category: "utility"
  },

  onStart: async function ({ message, event, args }) {
    let inputUrl = null;

    // চেক করা: রিপ্লাই করা মিডিয়া থেকে নেওয়া
    if (event.messageReply?.attachments?.length > 0) {
      inputUrl = event.messageReply.attachments[0].url;
    } 
    // নাহলে আর্গুমেন্ট থেকে নেওয়া
    else if (args.length > 0) {
      inputUrl = args[0];
    }

    if (!inputUrl) {
      return message.reply("❌ Please reply to a media message or provide a valid media URL.");
    }

    try {
      const apikey = "ArYAN";
      const apiURL = `https://aryan-xyz-google-drive.vercel.app/drive?url=${encodeURIComponent(inputUrl)}&apikey=${apikey}`;
      const res = await axios.get(apiURL);

      const data = res.data || {};
      const driveLink = data.driveLink || data.driveLIink;

      if (driveLink) {
        const successMsg = `✅ File successfully uploaded to Google Drive!\n\n🔗 Drive URL: ${driveLink}`;
        return message.reply(successMsg);
      }

      return message.reply(`❌ Failed to upload the file.\n${data.error || "No additional information available."}`);

    } catch (error) {
      console.error("Google Drive Upload Error:", error.message);
      return message.reply("❌ An unexpected error occurred during upload. Please try again later.");
    }
  }
};
