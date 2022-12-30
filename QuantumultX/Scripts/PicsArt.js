// 𝐅𝐫𝐨𝐦： https://raw.githubusercontent.com/NobyDa/Script/master/Surge/JS/PicsArt.js
let obj = JSON.parse($response.body);
obj.subscription.granted = 'true';
$done({
  body: JSON.stringify(obj),
});