module.exports = {
	config: {
		name: "noprefix",
		version: "1.0",
		author: "Omor TE",
		countDown: 0,
		role: 0,
		shortDescription: "noprefix custom question and answer",
		longDescription: "noprefix custom question and answe",
		category: "custom reply",
	},

	onStart: async function () {},

	onChat: async function ({ event, message }) {

		if (!event.body) return;
		const msg = event.body.toLowerCase();

		const qaList = [
			{
				keyullash: ["assalamualaikum", "আসসালামু আলাইকুম", "assalamu alaikum"],
				reply: "𝐖𝐚𝐥𝐢𝐤𝐮𝐦𝐚𝐬𝐬𝐚𝐥𝐚𝐦"
			},
			{
				keyullash: ["kemon aso", "কেমন আছো", "how are you"],
				reply: "আমি ভালো আছি, আলহামদুলিল্লাহ! 😊"
			},
			{
				keyullash: ["name ki", "তোমার নাম কি", "what is your name"],
				reply: "আমি একটি বট, আমার নাম সেট করা হয়নি। 😊"
			},
			{
				keyullash: ["tumi ki korso", "কি করছো", "what are you doing"],
				reply: "আমি আপনার জন্য অপেক্ষা করছিলাম! 😄"
			},
			{
				keyullash: ["kar fork", "fork"],
				reply: "⚡ MW Legends; Latest"
			}
		];

		for (const item of qaList) {
			if (item.keyullash.some(kw => msg.includes(kw))) {
				return message.reply(item.reply);
			}
		}
	}
};
