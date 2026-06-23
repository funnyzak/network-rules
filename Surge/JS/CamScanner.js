/**************************
[Script]
CamScanner_VIP = type=http-response, pattern=^https://ap\w+\.intsig\.net/purchase/cs/query_property\?, requires-body=1, max-size=0, script-path=https://raw.githubusercontent.com/funnyzak/network-rules/main/Surge/JS/CamScanner.js, script-update-interval=0

[MITM]
hostname = ap*.intsig.net
**************************/

let body = $response.body;
let obj = JSON.parse(body);

obj.data = {
    ...obj.data,
    
    "psnl_vip_property": {
        "expiry": "2013017600"
    },
    
    "vip_property": {
        "expiry": "2013017600"
    },
    
    "enterprise_vip": {
        "expiry": "2013017600",
        "level": 1
    },
    
    "used_points": "0",
    "bookmode_balance": 999999,
    "points": "999999",
    "ocr_balance": 999999,
    "login_ocr_balance": 999999,
    "no_login_ocr_balance": 999999,
    "fax_balance": "999999",
    "immt_expy_points": "0",
    "pdfword_balance": "999999",
    
    "CamScanner_RoadMap_Excel": 1,
    "CamScanner_RoadMap": 1,
    
    "server_time": Math.floor(Date.now() / 1000).toString()
};

obj.ret = "0";

$done({body: JSON.stringify(obj)});