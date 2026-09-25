const webpush = require('web-push');
const fs = require('fs');

const vapidKeys = webpush.generateVAPIDKeys();

const envVars = `\nNEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}\nVAPID_PRIVATE_KEY=${vapidKeys.privateKey}\n`;

fs.appendFileSync('.env', envVars);
console.log('Generated VAPID keys and appended to .env');
