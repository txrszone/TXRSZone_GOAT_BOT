module.exports = {
	config: {
		name: "fork",
		version: "1.0",
		author: "Omor",
		countDown: 0,
		role: 0,
		shortDescription: "Send bot's repository info",
		longDescription: "Send bot's repository info",
		category: "without prefix"
	},

	onChat: async function ({ api, event }) {
		try {
			const msg = event.body?.toLowerCase().trim();

			if (msg === "fork") {
				return api.sendMessage(
					"⚡ MW Legends; Latest",
					event.threadID,
					event.messageID
				);
			}
		} catch (err) {
			console.log(err);
		}
	}
};
