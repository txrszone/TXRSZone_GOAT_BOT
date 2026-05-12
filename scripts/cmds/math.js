const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "math",
    version: "1.0.2",
    author: "OMOR TE",
    countDown: 5,
    role: 0,
    shortDescription: "Solve math problems",
    longDescription: "Solve equations, calculus, plot graphs using Wolfram Alpha",
    guide: "{p}math 1 + 2\n{p}math -p xdx\n{p}math -g y = x^2\n{p}math -v (1,2,3)",
    category: "study"
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    
    // ✅ আপনার নতুন Wolfram Alpha API Key
    const WOLFRAM_KEY = "6P45GW8372";
    
    let content = args.join(" ");
    
    if (!content) {
      return message.reply(`📐 **MATH SOLVER**\n━━━━━━━━━━━━━━━━━━━━\n📌 ব্যবহার:\n• math 1 + 2\n• math -p xdx\n• math -g y = x^2\n• math -v (1,2,3)\n━━━━━━━━━━━━━━━━━━━━\n⚡ Wolfram Alpha দ্বারা চালিত`);
    }
    
    // কনফার্মেশন মেসেজ
    const confirmMsg = await message.reply(`📐 **গণিত সমাধান করা হচ্ছে...**\n━━━━━━━━━━━━━━━━━━━━\n📝 ${content}\n⏳ অনুগ্রহ করে অপেক্ষা করুন!`);
    
    try {
      let result = "";
      let imageStream = null;
      
      // Handle primitive/integral (-p)
      if (content.indexOf("-p") === 0) {
        content = "primitive " + content.slice(3);
        const response = await axios.get(`https://api.wolframalpha.com/v2/query?appid=${WOLFRAM_KEY}&input=${encodeURIComponent(content)}&output=json`);
        const data = response.data;
        
        if (data.queryresult?.pods) {
          const integral = data.queryresult.pods.find(e => e.id === "IndefiniteIntegral");
          if (integral?.subpods?.[0]?.plaintext) {
            result = integral.subpods[0].plaintext.split(" = ")[1]?.replace("+ constant", "") || "Result not found";
          } else {
            result = "Could not solve this integral";
          }
        } else {
          result = "No result found";
        }
      }
      // Handle graph plotting (-g)
      else if (content.indexOf("-g") === 0) {
        content = "plot " + content.slice(3);
        const response = await axios.get(`https://api.wolframalpha.com/v2/query?appid=${WOLFRAM_KEY}&input=${encodeURIComponent(content)}&output=json`);
        const data = response.data;
        
        if (data.queryresult?.pods) {
          const plot = data.queryresult.pods.find(e => e.id === "Plot") || data.queryresult.pods.find(e => e.id === "ImplicitPlot");
          if (plot?.subpods?.[0]?.img?.src) {
            const imgUrl = plot.subpods[0].img.src;
            const imgResponse = await axios.get(imgUrl, { responseType: 'stream' });
            imageStream = imgResponse.data;
            result = "📈 Graph generated successfully!";
          } else {
            result = "Could not generate graph for this equation";
          }
        } else {
          result = "No result found";
        }
      }
      // Handle vectors (-v)
      else if (content.indexOf("-v") === 0) {
        content = "vector " + content.slice(3).replace(/\(/g, "<").replace(/\)/g, ">");
        const response = await axios.get(`https://api.wolframalpha.com/v2/query?appid=${WOLFRAM_KEY}&input=${encodeURIComponent(content)}&output=json`);
        const data = response.data;
        
        if (data.queryresult?.pods) {
          const vectorLength = data.queryresult.pods.find(e => e.id === "VectorLength");
          const resultPod = data.queryresult.pods.find(e => e.id === "Result");
          
          if (resultPod?.subpods?.[0]?.plaintext) {
            result = resultPod.subpods[0].plaintext;
          }
          if (vectorLength?.subpods?.[0]?.plaintext) {
            result += `\n📏 Magnitude: ${vectorLength.subpods[0].plaintext}`;
          }
          
          const vectorPlot = data.queryresult.pods.find(e => e.id === "VectorPlot");
          if (vectorPlot?.subpods?.[0]?.img?.src) {
            const imgUrl = vectorPlot.subpods[0].img.src;
            const imgResponse = await axios.get(imgUrl, { responseType: 'stream' });
            imageStream = imgResponse.data;
          }
        } else {
          result = "No result found";
        }
      }
      // Handle general equations
      else {
        const response = await axios.get(`https://api.wolframalpha.com/v2/query?appid=${WOLFRAM_KEY}&input=${encodeURIComponent(content)}&output=json`);
        const data = response.data;
        
        if (data.queryresult?.pods) {
          const solution = data.queryresult.pods.find(e => e.id === "Solution") || 
                          data.queryresult.pods.find(e => e.id === "ComplexSolution") ||
                          data.queryresult.pods.find(e => e.id === "Result") ||
                          data.queryresult.pods.find(e => e.id === "DecimalApproximation");
          
          if (solution?.subpods) {
            for (const pod of solution.subpods) {
              if (pod.plaintext) result += pod.plaintext + "\n";
            }
          } else {
            // Try to get input interpretation
            const inputInterpret = data.queryresult.pods.find(e => e.id === "Input");
            if (inputInterpret?.subpods?.[0]?.plaintext) {
              result = inputInterpret.subpods[0].plaintext;
            } else {
              result = "No solution found for this equation";
            }
          }
        } else {
          result = "No solution found";
        }
      }
      
      // ক্লিন আপ রেজাল্ট (অতিরিক্ত টেক্সট বাদ দেওয়া)
      if (result.length > 1500) {
        result = result.substring(0, 1500) + "...";
      }
      
      // ডিলিট কনফার্মেশন মেসেজ
      try {
        await api.unsendMessage(confirmMsg.messageID);
      } catch(e) {}
      
      // সেন্ড রেজাল্ট
      if (imageStream) {
        await message.reply({
          body: `📐 **ম্যাথ সলিউশন**\n━━━━━━━━━━━━━━━━━━━━\n📝 ${args.join(" ")}\n━━━━━━━━━━━━━━━━━━━━\n📊 ${result}\n━━━━━━━━━━━━━━━━━━━━\n⚡ Wolfram Alpha`,
          attachment: imageStream
        });
      } else {
        await message.reply(`📐 **ম্যাথ সলিউশন**\n━━━━━━━━━━━━━━━━━━━━\n📝 ${args.join(" ")}\n━━━━━━━━━━━━━━━━━━━━\n📊 ${result}\n━━━━━━━━━━━━━━━━━━━━\n⚡ Wolfram Alpha`);
      }
      
    } catch (error) {
      console.error("Math error:", error);
      
      // ডিলিট কনফার্মেশন মেসেজ
      try {
        await api.unsendMessage(confirmMsg.messageID);
      } catch(e) {}
      
      let errorMsg = error.message;
      if (errorMsg.includes("403") || errorMsg.includes("401")) {
        errorMsg = "API Key invalid or expired. Please check your Wolfram Alpha API key.";
      } else if (errorMsg.includes("ECONNREFUSED")) {
        errorMsg = "Connection failed. Please check your internet connection.";
      }
      
      message.reply(`❌ **ম্যাথ এরর**\n━━━━━━━━━━━━━━━━━━━━\n📝 ${args.join(" ")}\n⚠️ ${errorMsg}\n━━━━━━━━━━━━━━━━━━━━\n💡 ব্যবহার: math 1 + 2`);
    }
  }
};
