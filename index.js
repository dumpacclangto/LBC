const express = require('express');
const axios = require('axios');
const readline = require('readline');
const path = require('path');

const app = express();
const port = 3000;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

app.use(express.static('public'));

function getToken() {
  const headers = {
    'User-Agent': "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    'Accept-Encoding': "gzip, deflate, br, zstd",
    'sec-ch-ua': "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
    'sec-ch-ua-mobile': "?1",
    'ocp-apim-subscription-key': "dbcd31c8bc4f471188f8b6d226bb9ff7",
    'sec-ch-ua-platform': "\"Android\"",
    'origin': "https://lbconline.lbcexpress.com",
    'sec-fetch-site': "cross-site",
    'sec-fetch-mode': "cors",
    'sec-fetch-dest': "empty",
    'referer': "https://lbconline.lbcexpress.com/",
    'accept-language': "en-US,en;q=0.9",
    'if-none-match': "W/\"323-r+EjGlcMet1kPrP/z1RJBv8yxFs\""
  };

  return axios.get("https://lbcapigateway.lbcapps.com/promotextertoken/generate_client_token", { headers })
    .then(response => response.data.client_token)
    .catch(error => {
      console.error("Failed to fetch token:", error.message);
      return null;
    });
}

function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function sendMessage(number, message, token) {
  const randomString = generateRandomString(2);
  const finalMessage = `${message}\n\n\n${randomString}`;

  const payload = {
    Recipient: number,
    Message: finalMessage,
    ShipperUuid: "LBCEXPRESS",
    DefaultDisbursement: 3,
    ApiSecret: "03da764a333680d6ebd2f6f4ef1e2928",
    apikey: "7777be96b2d1c6d0dee73d566a820c5f"
  };

  const headers = {
    'User-Agent': "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36",
    'Accept-Encoding': "gzip, deflate, br, zstd",
    'Content-Type': "application/json",
    'sec-ch-ua': "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Google Chrome\";v=\"122\"",
    'lbcoakey': "d1ca28c5933f41638f57cc81c0c24bca",
    'sec-ch-ua-mobile': "?1",
    'ptxtoken': token,
    'token': "O8VpRnC2bIwe74mKssl11c0a1kz27aDCvIci4HIA+GOZKffDQBDkj0Y4kPodJhyQaXBGCbFJcU1CQZFDSyXPIBni",
    'sec-ch-ua-platform': "\"Android\"",
    'origin': "https://lbconline.lbcexpress.com",
    'sec-fetch-site': "cross-site",
    'sec-fetch-mode': "cors",
    'sec-fetch-dest': "empty",
    'referer': "https://lbconline.lbcexpress.com/",
    'accept-language': "en-US,en;q=0.9"
  };

  return axios.post("https://lbcapigateway.lbcapps.com/lexaapi/lexav1/api/AddDefaultDisbursement", payload, { headers })
    .then(response => {
      if (response.data.status === "ok") {
        return true;
      } else {
        console.error("Failed to send message:", response.data.message);
        return false;
      }
    })
    .catch(error => {
      console.error("Failed to send message. Server error:", error.message);
      return false;
    });
}

async function sendMessages(number, message, token, count) {
  const delay = () => new Promise(resolve => setTimeout(resolve, 700));
  let messagesSent = 0;
  let successfulCount = 0;
  process.stdout.write(`Message ${successfulCount}/${count} sent successfully.`);
  while (messagesSent < count) {
    await delay();
    const success = await sendMessage(number, message, token);
    if (success) {
      successfulCount++;
      process.stdout.write(`\rMessage ${successfulCount}/${count} sent successfully.`);
    }
    messagesSent++;
  }
  console.log(""); 
}

app.get('/send', (req, res) => {
  const { number, message, count } = req.query;

  getToken()
    .then(token => {
      if (token) {
        sendMessages(number, message, token, count)
          .then(() => {
            res.send('Messages sent successfully.');
          })
          .catch(() => {
            res.status(500).send('Failed to send messages.');
          });
      } else {
        res.status(500).send('Failed to get token.');
      }
    });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});