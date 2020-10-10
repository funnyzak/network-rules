/*
感谢 @chavyleung @cyubuchen

####################
[免责声明]
1、此脚本仅用于学习研究，不保证其合法性、准确性、有效性，请根据情况自行判断，本人对此不承担任何保证责任。
2、由于此脚本仅用于学习研究，您必须在下载后 24 小时内将所有内容从您的计算机或手机或任何存储设备中完全删除，若违反规定引起任何事件本人对此均不负责。
3、请勿将此脚本用于任何商业或非法目的，若违反规定请自行对此负责。
4、此脚本涉及应用与本人无关，本人对因此引起的任何隐私泄漏或其他后果不承担任何责任。
5、本人对任何脚本引发的问题概不负责，包括但不限于由脚本错误引起的任何损失和损害。
6、如果任何单位或个人认为此脚本可能涉嫌侵犯其权利，应及时通知并提供身份证明，所有权证明，我们将在收到认证文件确认后删除此脚本。
7、所有直接或间接使用、查看此脚本的人均应该仔细阅读此声明。本人保留随时更改或补充此声明的权利。一旦您使用或复制了此脚本，即视为您已接受此免责声明。
####################

功能:
京东金融白条每日提额

如何获取京东金融Cookie
1. 打开京东金融App -> 我的 -> 白条额度
2. Cookie获取成功的通知将自动弹出
3. 注意: 进入[白条]页面以自动获取Cookie, 有小鸭子的白条页面

[MITM]
hostname=*.jr.jd.com

####################
# Loon
[Script]
http-request ^https:\/\/ms\.jr\.jd\.com\/gw\/generic\/bt\/h5\/m\/firstScreenNew script-path=https://raw.githubusercontent.com/funnyzak/network-rules/master/Scripts/jd/JD_BaiTiaoRaise.js, timeout=10, tag=京东白条Cookie
cron "20 15 * * *" script-path=https://raw.githubusercontent.com/funnyzak/network-rules/master/Scripts/jd/JD_BaiTiaoRaise.js,tag=京东白条提额
####################

####################
# Surge
[Script]
# 京东白条提额
京东白条Cookie = type=http-request,pattern=^https:\/\/ms\.jr\.jd\.com\/gw\/generic\/bt\/h5\/m\/firstScreenNew,script-path=https://raw.githubusercontent.com/funnyzak/network-rules/master/Scripts/jd/JD_BaiTiaoRaise.js
京东白条提额 = type=cron,cronexp="20 15 * * *",script-path=https://raw.githubusercontent.com/funnyzak/network-rules/master/Scripts/jd/JD_BaiTiaoRaise.js
####################

####################
# Quantumult X 商店版
# 复制一份本脚本至本地, 文件名设为jdBaiTiao
[rewrite_local]
;京东白条Cookie
^https:\/\/ms\.jr\.jd\.com\/gw\/generic\/bt\/h5\/m\/firstScreenNew url script-request-header jdBaiTiaoRaise.js
[task_local]
20 15 * * * jdBaiTiaoRaise.js, enabled=true
####################
*/

const $ = Env("💰京东白条");

$.opts = {
    'open-url': 'https://m.jr.jd.com/udownload/index.html',
    'media-url': 'https://is5-ssl.mzstatic.com/image/thumb/Purple124/v4/62/19/79/6219790f-e31e-c348-0e8e-a70d9f9748e3/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-85-220.png/460x0w.png'
};

if (typeof $request != "undefined") {
    get_cookie();
    $.done();
} else {
    var cookies = [];
    cookies.push($.getdata('cookie_jdjr'));
    cookies.push($.getdata('cookie_jdjr_'));
    !(async () = > {
        if (cookies[0] == null && cookies[1] == null) {
            $.msg($.name, '⚠️当前缺少Cookie', '👉请打开[京东金融App]的白条页面, 以自动获取Cookie.', $.opts);
        } else {
            for (let i = 0; i < cookies.length; i++) {
                cookie = cookies[i];
                if (cookie != null) {
                    console.log("👉当前账号 " + cookie.match(/pwdt_id=[^;]+/)[0].replace("pwdt_id=", ""));
                    var unq = await get_unq(cookie);
                    await riseBT(unq, cookie);
                } else {
                    continue;
                }
            }
        }
    })()
    .
    catch((e) = > $.logErr(e))
        .
    finally(() = > $.done());
}

function get_cookie() {
    try {
        var CookieKey = "cookie_jdjr";
        var CookieKey_ = "cookie_jdjr_";
        var CookieValue = $request.headers['Cookie'];
        var uaKey = "ua_jdjr";
        var uaValue = $request.headers['User-Agent'];
        if (uaValue.indexOf("jdPayClientName") != -1) {
            $.setdata(uaValue, uaKey);
        } else {
            console.log($.name + "❗️User-Agent获取失败, 已使用备用UA");
            $.setdata("Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/application=JDJR-App&deviceId=&clientType=ios&iosType=iphone&clientVersion=6.0.20&HiClVersion=6.0.20&isUpdate=0&osVersion=14.0&osName=iOS&platform=iPhone 7 (A1660/A1779/A1780)&screen=667*375&src=App Store&ip=192.168.1.6&mac=&netWork=1&netWorkType=1&CpayJS=UnionPay/1.0 JDJR&stockSDK=stocksdk-iphone_3.3.3&sPoint=&jdPay=(*#@jdPaySDK*#@jdPayChannel=jdfinance&jdPayChannelVersion=6.0.20&jdPaySdkVersion=3.00.15.00&jdPayClientName=iOS*#@jdPaySDK*#@)", uaKey)
        }
        var cookieM = CookieValue.match(/pwdt_id=[^;]+/)[0].replace("pwdt_id=", "");
        if (!cookieM) {
            console.log($.name + " 🍪Cookie获取失败 ❌ " + "CookieValue:\n" + CookieValue);
            $.msg($.name, "🍪Cookie获取失败 ❌", "", $.opts)
        } else {
            if ($.getdata(CookieKey) != null) {
                if ($.getdata(CookieKey).indexOf(cookieM) != -1) {
                    $.setdata(CookieValue, CookieKey);
                } else {
                    $.setdata(CookieValue, CookieKey_);
                }
            } else {
                $.setdata(CookieValue, CookieKey);
            }
            console.log($.name + " 🍪Cookie写入成功 🎉 " + cookieM);
            $.msg($.name, "🍪Cookie写入成功 🎉", "", $.opts);
        }
    } catch (error) {
        console.log($.name + " " + error);
        $.msg($.name, "❓写入Cookie失败", error, $.opts)
    }
}

function get_unq(cookie) {
    return new Promise((resolve, reject) = > {
        const bt_jdjr = {
            url: 'https://ms.jr.jd.com/gw/generic/bt/h5/m/getRiseLimitItems',
            method: "POST",
            headers: {
                "Host": "ms.jr.jd.com",
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                "Origin": "https://mbt.jd.com",
                "Accept-Encoding": "gzip, deflate, br",
                "Cookie": cookie,
                "Connection": "keep-alive",
                "Accept": "*/*",
                "User-Agent": $.getdata("ua_jdjr"),
                "Referer": "https://mbt.jd.com/process/quota/manage/pages/home.html?channelName=00004&jrcontainer=h5&jrcloseweb=false",
                "Accept-Language": "zh-cn",
            },
            "body": "reqData=%7B%22clientType%22:%22ios%22,%22clientVersion%22:%2214.0%22,%22eid%22:%22%22,%22fp%22:%22%22,%22riskDeviceInfo%22:%7B%22macAddress%22:%22%22,%22channelInfo%22:%22appstore%22,%22IPAddress1%22:%22%22,%22OpenUDID%22:%22%22,%22clientVersion%22:%226.0.20%22,%22terminalType%22:%2202%22,%22osVersion%22:%2214.0%22,%22appId%22:%22com.jd.jinrong%22,%22deviceType%22:%22iPhone9,1%22,%22networkType%22:%22WIFI%22,%22startNo%22:0,%22UUID%22:%22%22,%22IPAddress%22:%22%22,%22deviceId%22:%22%22,%22IDFA%22:%22%22,%22resolution%22:%22750*1334%22,%22osPlatform%22:%22iOS%22%7D%7D"
        };

        $.post(bt_jdjr, (error, resp, data) = > {
            try {
                if (resp.status == 200) {
                    var data = JSON.parse(data);
                    if (data.resultCode == 0) {
                        var uniqueCode = data.resultData.raiseItemList[1].uniqueCode;
                        var btDesc = data.resultData.raiseItemList[1].raiseDesc;
                        if (btDesc != "今日福利额度" && btDesc != "\u4eca\u65e5\u798f\u5229\u989d\u5ea6") {
                            console.log($.name + " 🌀今日已提额, 重复请求无意义");
                            $.msg($.name, "🌀今日已提额", "重复请求无意义", $.opts);
                        }
                    } else if (data.resultCode == 3) {
                        console.log($.name + " ❌出错啦 " + data.resultMsg);
                        $.msg($.name, "❌出错啦", "❗请进入[京东金融App]白条页面, 获取Cookie.", $.opts);
                    } else {
                        console.log($.name + " ❌未知错误 " + data.resultMsg);
                        $.msg($.name, "❌未知错误", data.resultMsg, $.opts);
                    }
                } else {
                    console.log($.name + " ❌访问失败, 请稍后再试. " + resp.status);
                    $.msg($.name, "❌访问失败, 请稍后再试", "", $.opts);
                }
            } catch (error) {
                console.log($.name + " ❌访问失败! " + data.resultData.error_msg + "\n" + error);
                $.msg($.name, "❌访问失败.", data.resultData.error_msg, $.opts);
            }
            resolve(uniqueCode);
        })
    })
}

function riseBT(uniqueCode, cookie) {
    return new Promise((resolve, reject) = > {
        const bt_jdjr = {
            url: 'https://ms.jr.jd.com/gw/generic/bt/h5/m/receiveDailyQuotaPackage',
            method: "POST",
            headers: {
                "Host": "ms.jr.jd.com",
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                "Origin": "https://mbt.jd.com",
                "Accept-Encoding": "gzip, deflate, br",
                "Cookie": cookie,
                "Connection": "keep-alive",
                "Accept": "*/*",
                "User-Agent": $.getdata("ua_jdjr"),
                "Referer": "https://mbt.jd.com/process/quota/manage/pages/home.html?channelName=00004&jrcontainer=h5&jrcloseweb=false",
                "Accept-Language": "zh-cn",
            },
            "body": `reqData = % 7B % 22clientType % 22 % 3A % 22ios % 22 % 2C % 22clientVersion % 22 % 3A % 2214.0 % 22 % 2C % 22packageId % 22 % 3A % 22$ {
                uniqueCode
            } % 22 % 7D`
        };

        $.post(bt_jdjr, (error, resp, data) = > {
            try {
                if (resp.status == 200) {
                    var data = JSON.parse(data);
                    if (data.resultCode == 0) {
                        console.log(data);
                        var changeBalanceAmount = data.resultData.changeBalanceAmount;
                        var totalBalanceAmount = data.resultData.totalBalanceAmount;
                        if (changeBalanceAmount == "") {
                            var mesg = "当前总额度: " + totalBalanceAmount;
                            if (!totalBalanceAmount) {
                                console.log($.name + " ⚠️抱歉，您还没有开通白条 " + mesg);
                                $.msg($.name, "⚠️抱歉，您还没有开通白条", "", $.opts);
                            } else {
                                console.log($.name + " 🎉提额成功 " + mesg);
                                $.msg($.name, "🎉提额成功", mesg, $.opts);
                            }
                        } else {
                            var SumBalanceAmount = parseInt(changeBalanceAmount) + totalBalanceAmount;
                            var mesg = "当前总额度: " + SumBalanceAmount + "\n今日提升额度: " + changeBalanceAmount;
                            console.log($.name + " 🎉提额成功 " + mesg);
                            $.msg($.name, "🎉提额成功", mesg, $.opts);
                        }
                    } else if (data.resultCode == 3) {
                        console.log($.name + " ❌出错啦 " + data.resultMsg);
                        $.msg($.name, "❌出错啦", "❗请进入[京东金融App]白条页面, 获取Cookie.", $.opts);
                    } else {
                        console.log($.name + " ❌出错啦 " + data.resultMsg);
                        $.msg($.name, "❌出错啦", data.resultMsg, $.opts);
                    }
                } else {
                    console.log($.name + " ❌访问失败, 请稍后再试 " + resp.status);
                    $.msg($.name, "❌访问失败, 请稍后再试", "", $.opts);
                }
            } catch (error) {
                console.log($.name + " ❌提额失败. " + error);
                $.msg($.name, "❗请进入[京东金融App]白条页面, 获取Cookie.", error, $.opts);
            }
            resolve();
        })
    })
}


function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}getScript(t){return new Promise(s=>{$.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};$.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o)),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
