/**************************
[Script]
CamScanner_VIP = type=http-response, pattern=^https://ap\w+\.intsig\.net/purchase/cs/query_property\?, requires-body=1, max-size=0, script-path=https://raw.githubusercontent.com/funnyzak/network-rules/main/Surge/JS/CamScanner.js, script-update-interval=0

[MITM]
hostname = ap*.intsig.net
**************************/

const CONFIG = {
    MAX_BALANCE: 999999,
    VALIDITY_YEARS: 10,
    FORCE_IN_TRIAL: true,
    FORCE_AUTO_RENEWAL: true,
    BALANCE_KEYS: [
        "ocr_balance",
        "excel_balance",
        "login_ocr_balance",
        "no_login_ocr_balance",
        "vip_imagerestore_balance",
        "vip_balance_recolor",
        "upload_pdf_balance",
        "add_watermarks_balance",
        "watermarks_balance",
        "imagerestore_balance",
        "balance_demoire",
        "balance_recolor",
        "bookmode_balance",
        "patting_balance",
        "profile_card_balance",
        "cert_mode_balance",
        "pdfword_balance",
        "trans_balance",
        "ai_imagefilter_balance",
        "CamScanner_Erase",
        "CamScanner_Intellect_Erase",
        "CamScanner_RoadMap",
        "CamScanner_Toolbox_Watermark",
        "CamScanner_Bills_Verify",
        "CamScanner_AI_Doc_Image_Multi_Edit",
        "watchad_vip_chance_total",
        "watchad_vip_chance"
    ]
};

const SECONDS_PER_YEAR = 31536000;
const originalBody = $response.body || "";

try {
    const obj = JSON.parse(originalBody);
    const data = (obj && obj.data) ? obj.data : {};

    const serverTime = parseInt(data.server_time, 10) || Math.floor(Date.now() / 1000);
    const futureExpiry = serverTime + CONFIG.VALIDITY_YEARS * SECONDS_PER_YEAR;

    const psnl = data.psnl_vip_property || {};
    if (CONFIG.FORCE_IN_TRIAL) psnl.in_trial = 1;
    if (CONFIG.FORCE_AUTO_RENEWAL) psnl.auto_renewal = true;
    psnl.expiry = futureExpiry;
    psnl.nxt_renew_tm = futureExpiry;
    data.psnl_vip_property = psnl;

    CONFIG.BALANCE_KEYS.forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            data[key] = (typeof data[key] === "string") ? String(CONFIG.MAX_BALANCE) : CONFIG.MAX_BALANCE;
        }
    });

    obj.data = data;

    console.log(JSON.stringify({
        ret: obj.ret,
        server_time: serverTime,
        in_trial: psnl.in_trial,
        expiry: psnl.expiry,
        vip_type: psnl.vip_type,
        auto_renewal: psnl.auto_renewal,
        maxed: CONFIG.MAX_BALANCE
    }));

    $done({ body: JSON.stringify(obj) });
} catch (error) {
    console.log("CamScanner rewrite failed: " + error.message);
    $done({ body: originalBody });
}
