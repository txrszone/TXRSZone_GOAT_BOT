module.exports = {
  config: {
    name: "mathematics",
    version: "2.0.0",
    author: "OMOR TE",
    countDown: 5,
    role: 0,
    shortDescription: "Math Formulas",
    longDescription: "Show important algebraic formulas",
    guide: "{p}mathematics",
    category: "study"
  },

  onStart: async function ({ message }) {
    const formulas = `
📐 **বীজগণিতের সূত্রাবলি** 📐
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔹 ১. বর্গের সূত্র

📌 (a + b)² = a² + 2ab + b² = (a − b)² + 4ab

📌 (a − b)² = a² − 2ab + b² = (a + b)² − 4ab

📌 a² − b² = (a − b)(a + b)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔹 ২. ঘনের সূত্র

📌 (a + b)³ = a³ + 3a²b + 3ab² + b³

📌 (a − b)³ = a³ − 3a²b + 3ab² − b³

📌 a³ + b³ = (a + b)(a² − ab + b²)

📌 a³ − b³ = (a − b)(a² + ab + b²)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔹 ৩. তিনটি চলকের সূত্র

📌 (a + b + c)² = a² + b² + c² + 2ab + 2bc + 2ac

📌 (a + b + c)³ = a³ + b³ + c³ + 3(a + b)(b + c)(a + c)

📌 a³ + b³ + c³ − 3abc = (a + b + c)(a² + b² + c² − ab − bc − ac)

📌 (a + b − c)² = a² + b² + c² + 2ab − 2bc − 2ac

📌 (a − b − c)² = a² + b² + c² − 2ab + 2bc − 2ac

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ MW Legends Bot
    `;
    
    await message.reply(formulas);
  }
};
