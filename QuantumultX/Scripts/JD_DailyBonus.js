/*************************

京东多合一签到脚本

更新时间: 2020.9.17 19:30 v1.57
有效接口: 29+
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
电报频道: @NobyDa 
问题反馈: @NobyDa_bot 
如果转载: 请注明出处

*************************
【 JSbox, Node.js 说明 】 :
*************************

开启抓包app后, Safari浏览器登录 https://bean.m.jd.com 点击签到并且出现签到日历后, 返回抓包app搜索关键字 functionId=signBean 复制请求头Cookie填入以下Key处的单引号内即可 */

var Key = ""; //单引号内自行填写您抓取的Cookie

var DualKey = ""; //如需双账号签到,此处单引号内填写抓取的"账号2"Cookie, 否则请勿填写

/* 注1: 以上选项仅针对于JsBox或Node.js, 如果使用QX,Surge,Loon, 请使用脚本获取Cookie.
   注2: 双账号用户抓取"账号1"Cookie后, 请勿点击退出账号(可能会导致Cookie失效), 需清除浏览器资料或更换浏览器登录"账号2"抓取.
   注3: 如果复制的Cookie开头为"Cookie: "请把它删除后填入.
   注4: 如果使用QX,Surge,Loon并获取Cookie后, 再重复填写以上选项, 则签到优先读取以上Cookie.
   注5: 如果使用Node.js, 需自行安装'request'模块. 例: npm install request -g
   注6: Node.js或JSbox环境下已配置数据持久化, 填写Cookie运行一次后, 后续更新脚本无需再次填写, 待Cookie失效后重新抓取填写即可.

*************************
【 QX, Surge, Loon 说明 】 :
*************************

初次使用时, app配置文件添加脚本配置,并启用Mitm后, Safari浏览器打开登录 https://bean.m.jd.com ,点击签到并且出现签到日历后, 如果通知获得cookie成功, 则可以使用此签到脚本。 注: 请勿在京东APP内获取!!!

由于cookie的有效性(经测试网页Cookie有效周期最长31天)，如果脚本后续弹出cookie无效的通知，则需要重复上述步骤。 
签到脚本将在每天的凌晨0:05执行, 您可以修改执行时间。 因部分接口京豆限量领取, 建议调整为凌晨签到。

BoxJs订阅地址: https://raw.githubusercontent.com/NobyDa/Script/master/NobyDa_BoxJs.json

*************************
【 配置双京东账号签到说明 】 : 
*************************

正确配置QX、Surge、Loon后, 并使用此脚本获取"账号1"Cookie成功后, 请勿点击退出账号(可能会导致Cookie失效), 需清除浏览器资料或更换浏览器登录"账号2"获取即可.

注: 获取"账号1"或"账号2"的Cookie后, 后续仅可更新该"账号1"或"账号2"的Cookie.
如需写入其他账号,您可开启脚本内"DeleteCookie"选项以清除Cookie
*************************
【Surge 4.2+ 脚本配置】:
*************************

[Script]
京东多合一签到 = type=cron,cronexp=5 0 * * *,wake-system=1,timeout=20,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

获取京东Cookie = type=http-request,pattern=https:\/\/api\.m\.jd\.com\/client\.action.*functionId=signBean,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

[MITM]
hostname = api.m.jd.com

*************************
【Loon 2.1+ 脚本配置】:
*************************

[Script]
cron "5 0 * * *" tag=京东多合一签到, script-path=https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

http-request https:\/\/api\.m\.jd\.com\/client\.action.*functionId=signBean tag=获取京东Cookie, script-path=https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

[MITM]
hostname = api.m.jd.com

*************************
【 QX 1.0.5+ 脚本配置 】 :
*************************

[task_local]
# 京东多合一签到
# 注意此为本地路径, 请根据实际情况自行调整
5 0 * * * JD_DailyBonus.js

[rewrite_local]
# 获取京东Cookie. 
# 注意此为本地路径, 请根据实际情况自行调整.
https:\/\/api\.m\.jd\.com\/client\.action.*functionId=signBean url script-request-header JD_DailyBonus.js

[mitm]
hostname = api.m.jd.com

*************************/

var LogDetails = false; //是否开启响应日志, true则开启

var stop = 0; //自定义延迟签到,单位毫秒. 默认分批并发无延迟. 延迟作用于每个签到接口, 如填入延迟则切换顺序签到(耗时较长), VPN重启或越狱用户建议填写1, Surge用户请注意在SurgeUI界面调整脚本超时

var DeleteCookie = false; //是否清除Cookie, true则开启.

var boxdis = true; //是否开启自动禁用, false则关闭. 脚本运行崩溃时(如VPN断连), 下次运行时将自动禁用相关崩溃接口(仅部分接口启用), 崩溃时可能会误禁用正常接口. (该选项仅适用于QX,Surge,Loon)

var ReDis = false; //是否移除所有禁用列表, true则开启. 适用于触发自动禁用后, 需要再次启用接口的情况. (该选项仅适用于QX,Surge,Loon)

var out = 0; //接口超时退出, 用于可能发生的网络不稳定, 0则关闭. 如QX日志出现大量"JS Context timeout"后脚本中断时, 建议填写6000

var $nobyda = nobyda();

async function all() {
  if (stop == 0) {
    await Promise.all([
      JingDongBean(stop), //京东京豆
      JingRongBean(stop), //金融京豆
      JingRongDoll(stop), //金融抓娃娃
      JingRongSteel(stop), //金融钢镚
      JingDongTurn(stop), //京东转盘
      JDFlashSale(stop), //京东闪购
      JDOverseas(stop), //京东国际
      JingDongCash(stop), //京东现金红包
      JDMagicCube(stop), //京东小魔方
      JingDongPrize(stop), //京东抽大奖
      JingDongSubsidy(stop), //京东金贴
      JingDongGetCash(stop), //京东领现金
      JingDongShake(stop), //京东摇一摇
    ]);
    await Promise.all([
      JDUserSignPre(stop, "JDChild", "京东商城-童装"), //京东童装馆
      JDUserSignPre(stop, "JDBaby", "京东商城-母婴"), //京东母婴馆
      JDUserSignPre(stop, "JD3C", "京东商城-数码"), //京东数码电器馆
      JDUserSignPre(stop, "JDSubsidy", "京东晚市-补贴"), //京东晚市补贴金
      JDUserSignPre(stop, "JDDrug", "京东商城-医药"), //京东医药馆
      JDUserSignPre(stop, "JDWomen", "京东商城-女装"), //京东女装馆
      JDUserSignPre(stop, "JDGStore", "京东商城-超市"), //京东超市
      JDUserSignPre(stop, "JDBook", "京东商城-图书"), //京东图书
    ]);
    await Promise.all([
      JDUserSignPre(stop, "JDPet", "京东商城-宠物"), //京东宠物馆
      JDUserSignPre(stop, "JDShand", "京东拍拍-二手"), //京东拍拍二手
      JDUserSignPre(stop, "JDClean", "京东商城-清洁"), //京东清洁馆
      JDUserSignPre(stop, "JDCare", "京东商城-个护"), //京东个人护理馆
      JDUserSignPre(stop, "JDJewels", "京东商城-珠宝"), //京东珠宝馆
      JDUserSignPre(stop, "JDClocks", "京东商城-钟表"), //京东钟表馆
      JDUserSignPre(stop, "JDMakeup", "京东商城-美妆"), //京东美妆馆
      JDUserSignPre(stop, "JDVege", "京东商城-菜场"), //京东菜场
      JDUserSignPre(stop, "JDFood", "京东商城-美食"), //京东美食馆
    ]);
  } else {
    await JingDongBean(stop); //京东京豆
    await JingRongBean(stop); //金融京豆
    await JingRongDoll(stop); //金融抓娃娃
    await JingRongSteel(stop); //金融钢镚
    await JingDongTurn(stop); //京东转盘
    await JDFlashSale(stop); //京东闪购
    await JDOverseas(stop); //京东国际
    await JingDongCash(stop); //京东现金红包
    await JDMagicCube(stop); //京东小魔方
    await JingDongGetCash(stop); //京东领现金
    await JingDongPrize(stop); //京东抽大奖
    await JingDongSubsidy(stop); //京东金贴
    await JingDongShake(stop); //京东摇一摇
    await JDUserSignPre(stop, "JDChild", "京东商城-童装"); //京东童装馆
    await JDUserSignPre(stop, "JDBaby", "京东商城-母婴"); //京东母婴馆
    await JDUserSignPre(stop, "JD3C", "京东商城-数码"); //京东数码电器馆
    await JDUserSignPre(stop, "JDSubsidy", "京东晚市-补贴"); //京东晚市补贴金
    await JDUserSignPre(stop, "JDClocks", "京东商城-钟表"); //京东钟表馆
    await JDUserSignPre(stop, "JDDrug", "京东商城-医药"); //京东医药馆
    await JDUserSignPre(stop, "JDGStore", "京东商城-超市"); //京东超市
    await JDUserSignPre(stop, "JDPet", "京东商城-宠物"); //京东宠物馆
    await JDUserSignPre(stop, "JDBook", "京东商城-图书"); //京东图书
    await JDUserSignPre(stop, "JDShand", "京东拍拍-二手"); //京东拍拍二手
    await JDUserSignPre(stop, "JDMakeup", "京东商城-美妆"); //京东美妆馆
    await JDUserSignPre(stop, "JDWomen", "京东商城-女装"); //京东女装馆
    await JDUserSignPre(stop, "JDVege", "京东商城-菜场"); //京东菜场
    await JDUserSignPre(stop, "JDFood", "京东商城-美食"); //京东美食馆
    await JDUserSignPre(stop, "JDClean", "京东商城-清洁"); //京东清洁馆
    await JDUserSignPre(stop, "JDCare", "京东商城-个护"); //京东个人护理馆
    await JDUserSignPre(stop, "JDJewels", "京东商城-珠宝"); //京东珠宝馆
  }
  await Promise.all([
    JingDongSpeedUp(stop), //京东天天加速
    JRDoubleSign(stop), //金融双签
  ]);
  await Promise.all([
    TotalSteel(), //总钢镚查询
    TotalCash(), //总红包查询
    TotalBean(), //总京豆查询
  ]);
  await notify(); //通知模块
}

function notify() {
  return new Promise((resolve) => {
    try {
      var bean = 0;
      var steel = 0;
      var success = 0;
      var fail = 0;
      var err = 0;
      var notify = "";
      for (var i in merge) {
        bean += Number(merge[i].bean);
        steel += Number(merge[i].steel);
        success += Number(merge[i].success);
        fail += Number(merge[i].fail);
        err += Number(merge[i].error);
        notify += merge[i].notify ? "\n" + merge[i].notify : "";
      }
      var Cash = merge.JDCash.TCash ? merge.JDCash.TCash + "红包" : "";
      var Steel = merge.JRSteel.TSteel
        ? merge.JRSteel.TSteel + "钢镚" + (Cash ? ", " : "")
        : "";
      var beans = merge.JDShake.Qbear
        ? merge.JDShake.Qbear + "京豆" + (Steel || Cash ? ", " : "")
        : "";
      var bsc = beans ? "\n" : Steel ? "\n" : Cash ? "\n" : "获取失败\n";
      var Tbean = bean
        ? bean + "京豆" + (steel || merge.JDCash.Cash ? ", " : "")
        : "";
      var TSteel = steel
        ? steel + "钢镚" + (merge.JDCash.Cash ? ", " : "")
        : "";
      var TCash = merge.JDCash.Cash ? merge.JDCash.Cash + "红包" : "";
      var Tbsc = Tbean ? "\n" : TSteel ? "\n" : TCash ? "\n" : "获取失败\n";
      var Ts = success
        ? "成功" + success + "个" + (fail || err ? ", " : "")
        : "";
      var Tf = fail ? "失败" + fail + "个" + (err ? ", " : "") : "";
      var Te = err
        ? "错误" + err + "个\n"
        : success
        ? "\n"
        : fail
        ? "\n"
        : "获取失败\n";
      var one = "【签到概览】:  " + Ts + Tf + Te;
      var two = "【签到总计】:  " + Tbean + TSteel + TCash + Tbsc;
      var three = "【账号总计】:  " + beans + Steel + Cash + bsc;
      var four = "【左滑 '查看' 以显示签到详情】\n";
      var disa = $nobyda.disable
        ? "\n检测到上次执行意外崩溃, 已为您自动禁用相关接口. 如需开启请前往BoxJs ‼️‼️\n"
        : "";
      var DName = merge.JDShake.nickname ? merge.JDShake.nickname : "获取失败";
      var Name = add
        ? DualAccount
          ? "【签到号一】:  " + DName + "\n"
          : "【签到号二】:  " + DName + "\n"
        : "";
      console.log("\n" + Name + one + two + three + four + disa + notify);
      if ($nobyda.isJSBox) {
        if (add && DualAccount) {
          Shortcut = Name + one + two + three + "\n";
        } else if (!add && DualAccount) {
          $intents.finish(Name + one + two + three + four + notify);
        } else if (typeof Shortcut != "undefined") {
          $intents.finish(Shortcut + Name + one + two + three);
        }
      }
      if (!$nobyda.isNode)
        $nobyda.notify("", "", Name + one + two + three + four + disa + notify);
      if (DualAccount) {
        double();
      } else {
        $nobyda.time();
        $nobyda.done();
      }
    } catch (eor) {
      $nobyda.notify(
        "通知模块 " + eor.name + "‼️",
        JSON.stringify(eor),
        eor.message
      );
    } finally {
      resolve();
    }
  });
}

function ReadCookie() {
  initial();
  DualAccount = true;
  const EnvInfo = $nobyda.isJSBox ? "JD_Cookie" : "CookieJD";
  const EnvInfo2 = $nobyda.isJSBox ? "JD_Cookie2" : "CookieJD2";
  if (DeleteCookie) {
    if ($nobyda.read(EnvInfo) || $nobyda.read(EnvInfo2)) {
      $nobyda.write("", EnvInfo);
      $nobyda.write("", EnvInfo2);
      $nobyda.notify(
        "京东Cookie清除成功 !",
        "",
        '请手动关闭脚本内"DeleteCookie"选项'
      );
      $nobyda.done();
      return;
    }
    $nobyda.notify("脚本终止", "", '未关闭脚本内"DeleteCookie"选项 ‼️');
    $nobyda.done();
    return;
  } else if ($nobyda.isRequest) {
    GetCookie();
    return;
  }
  if (Key || $nobyda.read(EnvInfo)) {
    if ($nobyda.isJSBox || $nobyda.isNode) {
      if (Key) $nobyda.write(Key, EnvInfo);
      if (DualKey) $nobyda.write(DualKey, EnvInfo2);
    }
    add = DualKey || $nobyda.read(EnvInfo2) ? true : false;
    KEY = Key ? Key : $nobyda.read(EnvInfo);
    out = parseInt($nobyda.read("JD_DailyBonusTimeOut")) || out;
    stop = parseInt($nobyda.read("JD_DailyBonusDelay")) || stop;
    boxdis =
      $nobyda.read("JD_Crash_disable") === "false" ||
      $nobyda.isNode ||
      $nobyda.isJSBox
        ? false
        : boxdis;
    LogDetails = $nobyda.read("JD_DailyBonusLog") === "true" || LogDetails;
    ReDis = ReDis ? $nobyda.write("", "JD_DailyBonusDisables") : "";
    all();
  } else {
    $nobyda.notify("京东签到", "", "脚本终止, 未获取Cookie ‼️");
    $nobyda.done();
  }
}

function double() {
  initial();
  add = true;
  DualAccount = false;
  if (DualKey || $nobyda.read($nobyda.isJSBox ? "JD_Cookie2" : "CookieJD2")) {
    KEY = DualKey
      ? DualKey
      : $nobyda.read($nobyda.isJSBox ? "JD_Cookie2" : "CookieJD2");
    all();
  } else {
    $nobyda.time();
    $nobyda.done();
  }
}

function JingDongBean(s) {
  return new Promise((resolve) => {
    if (disable("JDBean")) return resolve();
    setTimeout(() => {
      const JDBUrl = {
        url: "https://api.m.jd.com/client.action",
        headers: {
          Cookie: KEY,
        },
        body: "functionId=signBeanIndex&appid=ld",
      };
      $nobyda.post(JDBUrl, function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const cc = JSON.parse(data);
            const Details = LogDetails ? "response:\n" + data : "";
            if (cc.code == 3) {
              console.log("\n" + "京东商城-京豆Cookie失效 " + Details);
              merge.JDBean.notify = "京东商城-京豆: 失败, 原因: Cookie失效‼️";
              merge.JDBean.fail = 1;
            } else if (data.match(/跳转至拼图/)) {
              merge.JDBean.notify =
                "京东商城-京豆: 失败, 原因: 需要拼图验证 ⚠️";
              merge.JDBean.fail = 1;
            } else if (data.match(/\"status\":\"?1\"?/)) {
              console.log("\n" + "京东商城-京豆签到成功 " + Details);
              if (data.match(/dailyAward/)) {
                merge.JDBean.notify =
                  "京东商城-京豆: 成功, 明细: " +
                  cc.data.dailyAward.beanAward.beanCount +
                  "京豆 🐶";
                merge.JDBean.bean = cc.data.dailyAward.beanAward.beanCount;
              } else if (data.match(/continuityAward/)) {
                merge.JDBean.notify =
                  "京东商城-京豆: 成功, 明细: " +
                  cc.data.continuityAward.beanAward.beanCount +
                  "京豆 🐶";
                merge.JDBean.bean = cc.data.continuityAward.beanAward.beanCount;
              } else if (data.match(/新人签到/)) {
                const quantity = data.match(/beanCount\":\"(\d+)\".+今天/);
                merge.JDBean.bean = quantity ? quantity[1] : 0;
                merge.JDBean.notify =
                  "京东商城-京豆: 成功, 明细: " +
                  (quantity ? quantity[1] : "无") +
                  "京豆 🐶";
              } else {
                merge.JDBean.notify = "京东商城-京豆: 成功, 明细: 无京豆 🐶";
              }
              merge.JDBean.success = 1;
            } else {
              merge.JDBean.fail = 1;
              console.log("\n" + "京东商城-京豆签到失败 " + Details);
              if (data.match(/(已签到|新人签到)/)) {
                merge.JDBean.notify = "京东商城-京豆: 失败, 原因: 已签过 ⚠️";
              } else if (data.match(/人数较多|S101/)) {
                merge.JDBean.notify = "京东商城-京豆: 失败, 签到人数较多 ⚠️";
              } else {
                merge.JDBean.notify = "京东商城-京豆: 失败, 原因: 未知 ⚠️";
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-京豆", "JDBean", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JingDongTurn(s) {
  return new Promise((resolve, reject) => {
    if (disable("JDTurn")) return reject();
    const JDTUrl = {
      url: "https://api.m.jd.com/client.action?functionId=wheelSurfIndex&body=%7B%22actId%22%3A%22jgpqtzjhvaoym%22%2C%22appSource%22%3A%22jdhome%22%7D&appid=ld",
      headers: {
        Cookie: KEY,
      },
    };
    $nobyda.get(JDTUrl, async function (error, response, data) {
      try {
        if (error) {
          throw new Error(error);
        } else {
          const cc = JSON.parse(data).data.lotteryCode;
          const Details = LogDetails ? "response:\n" + data : "";
          if (cc) {
            console.log("\n" + "京东商城-转盘查询成功 " + Details);
            return resolve(cc);
          } else {
            merge.JDTurn.notify = "京东商城-转盘: 失败, 原因: 查询错误 ⚠️";
            merge.JDTurn.fail = 1;
            console.log("\n" + "京东商城-转盘查询失败 " + Details);
          }
        }
      } catch (eor) {
        $nobyda.AnError("京东转盘-查询", "JDTurn", eor);
      } finally {
        reject();
      }
    });
    if (out) setTimeout(reject, out + s);
  }).then(
    (data) => {
      return JingDongTurnSign(s, data);
    },
    () => {}
  );
}

function JingDongTurnSign(s, code) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const JDTUrl = {
        url: `https://api.m.jd.com/client.action?functionId=lotteryDraw&body=%7B%22actId%22%3A%22jgpqtzjhvaoym%22%2C%22appSource%22%3A%22jdhome%22%2C%22lotteryCode%22%3A%22${code}%22%7D&appid=ld`,
        headers: {
          Cookie: KEY,
        },
      };
      $nobyda.get(JDTUrl, async function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const cc = JSON.parse(data);
            const Details = LogDetails ? "response:\n" + data : "";
            const also = merge.JDTurn.notify ? true : false;
            if (cc.code == 3) {
              console.log("\n" + "京东转盘Cookie失效 " + Details);
              merge.JDTurn.notify = "京东商城-转盘: 失败, 原因: Cookie失效‼️";
              merge.JDTurn.fail = 1;
            } else if (data.match(/(\"T216\"|活动结束)/)) {
              merge.JDTurn.notify = "京东商城-转盘: 失败, 原因: 活动结束 ⚠️";
              merge.JDTurn.fail = 1;
            } else if (data.match(/(京豆|\"910582\")/)) {
              console.log("\n" + "京东商城-转盘签到成功 " + Details);
              merge.JDTurn.bean += Number(cc.data.prizeSendNumber) || 0;
              merge.JDTurn.notify += `${also ? `\n` : ``}京东商城-转盘: ${
                also ? `多次` : `成功`
              }, 明细: ${cc.data.prizeSendNumber || `无`}京豆 🐶`;
              merge.JDTurn.success += 1;
              if (cc.data.chances != "0") {
                await JingDongTurnSign(2000, code);
              }
            } else if (data.match(/未中奖/)) {
              merge.JDTurn.notify += `${also ? `\n` : ``}京东商城-转盘: ${
                also ? `多次` : `成功`
              }, 状态: 未中奖 🐶`;
              merge.JDTurn.success += 1;
              if (cc.data.chances != "0") {
                await JingDongTurnSign(2000, code);
              }
            } else {
              console.log("\n" + "京东商城-转盘签到失败 " + Details);
              merge.JDTurn.fail = 1;
              if (data.match(/(T215|次数为0)/)) {
                merge.JDTurn.notify = "京东商城-转盘: 失败, 原因: 已转过 ⚠️";
              } else if (data.match(/(T210|密码)/)) {
                merge.JDTurn.notify =
                  "京东商城-转盘: 失败, 原因: 无支付密码 ⚠️";
              } else {
                merge.JDTurn.notify += `${also ? `\n` : ``}京东商城-转盘: ${
                  also ? `多次` : `成功`
                }, 原因: 未知 ⚠️`;
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-转盘", "JDTurn", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JingRongBean(s) {
  return new Promise((resolve) => {
    if (disable("JRBean")) return resolve();
    setTimeout(() => {
      const login = {
        url: "https://ms.jr.jd.com/gw/generic/zc/h5/m/signRecords",
        headers: {
          Cookie: KEY,
          Referer: "https://jddx.jd.com/m/money/index.html?from=sign",
        },
        body: "reqData=%7B%22bizLine%22%3A2%7D",
      };
      $nobyda.post(login, async function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const Details = LogDetails ? "response:\n" + data : "";
            if (data.match(/\"login\":true/)) {
              console.log("\n" + "京东金融-金贴登录成功 " + Details);
              await JRBeanCheckin(200);
            } else {
              console.log("\n" + "京东金融-金贴登录失败 " + Details);
              const lt = data.match(/\"login\":false/);
              merge.JRBean.fail = 1;
              merge.JRBean.notify = `京东金融-金贴: 失败, 原因: ${
                lt ? `Cookie失效‼️` : `需修正 ‼️`
              }`;
            }
          }
        } catch (eor) {
          $nobyda.AnError("金融金贴-登录", "JRBean", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JRBeanCheckin(s) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const JRBUrl = {
        url: "https://ms.jr.jd.com/gw/generic/zc/h5/m/signRewardGift",
        headers: {
          Cookie: KEY,
          Referer: "https://jddx.jd.com/m/jddnew/money/index.html",
        },
        body: "reqData=%7B%22bizLine%22%3A2%2C%22signDate%22%3A%221%22%2C%22deviceInfo%22%3A%7B%22os%22%3A%22iOS%22%7D%2C%22clientType%22%3A%22sms%22%2C%22clientVersion%22%3A%2211.0%22%7D",
      };
      $nobyda.post(JRBUrl, function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const c = JSON.parse(data);
            const Details = LogDetails ? "response:\n" + data : "";
            if (data.match(/\"resultCode\":\"00000\"/)) {
              console.log("\n" + "京东金融-金贴签到成功 " + Details);
              merge.JRBean.notify = `京东金融-金贴: 成功, 明细: ${
                c.resultData.data.rewardAmount || `无`
              }金贴 💰`;
              merge.JRBean.success = 1;
            } else {
              console.log("\n" + "京东金融-金贴签到失败 " + Details);
              if (data.match(/发放失败|70111|10000/)) {
                merge.JRBean.notify = "京东金融-金贴: 失败, 原因: 已签过 ⚠️";
                merge.JRBean.fail = 1;
              } else {
                const UnType = data.match(/\"resultCode\":3|请先登录/);
                merge.JRBean.notify = `京东金融-金贴: 失败, 原因: ${
                  UnType ? `Cookie失效‼️` : `未知 ⚠️`
                }`;
                merge.JRBean.fail = 1;
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东金融-金贴", "JRBean", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JingRongSteel(s) {
  return new Promise((resolve) => {
    if (disable("JRSteel")) return resolve();
    setTimeout(() => {
      const JRSUrl = {
        url: "https://ms.jr.jd.com/gw/generic/gry/h5/m/signIn",
        headers: {
          Cookie: KEY,
        },
        body: "reqData=%7B%22channelSource%22%3A%22JRAPP%22%2C%22riskDeviceParam%22%3A%22%7B%7D%22%7D",
      };
      $nobyda.post(JRSUrl, function (error, response, data) {
        try {
          if (error) throw new Error(error);
          const cc = JSON.parse(data);
          const Details = LogDetails ? "response:\n" + data : "";
          if (data.match(/\"resBusiCode\":0/)) {
            console.log("\n" + "京东金融-钢镚签到成功 " + Details);
            const leng = cc.resultData.resBusiData.actualTotalRewardsValue;
            merge.JRSteel.steel = leng
              ? leng > 9
                ? `0.${leng}`
                : `0.0${leng}`
              : 0;
            merge.JRSteel.notify = `京东金融-钢镚: 成功, 明细: ${
              merge.JRSteel.steel || `无`
            }钢镚 💰`;
            merge.JRSteel.success = 1;
          } else {
            console.log("\n" + "京东金融-钢镚签到失败 " + Details);
            merge.JRSteel.fail = 1;
            if (data.match(/已经领取|\"resBusiCode\":15/)) {
              merge.JRSteel.notify = "京东金融-钢镚: 失败, 原因: 已签过 ⚠️";
            } else if (data.match(/未实名/)) {
              merge.JRSteel.notify = "京东金融-钢镚: 失败, 原因: 账号未实名 ⚠️";
            } else if (data.match(/(\"resultCode\":3|请先登录)/)) {
              merge.JRSteel.notify = "京东金融-钢镚: 失败, 原因: Cookie失效‼️";
            } else {
              merge.JRSteel.notify = "京东金融-钢镚: 失败, 原因: 未知 ⚠️";
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东金融-钢镚", "JRSteel", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JRDoubleSign(s) {
  return new Promise((resolve) => {
    if (disable("JRDSign")) return resolve();
    setTimeout(() => {
      const JRDSUrl = {
        url: "https://nu.jr.jd.com/gw/generic/jrm/h5/m/process?",
        headers: {
          Cookie: KEY,
        },
        body: "reqData=%7B%22actCode%22%3A%22FBBFEC496C%22%2C%22type%22%3A3%2C%22riskDeviceParam%22%3A%22%22%7D",
      };
      $nobyda.post(JRDSUrl, function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const Details = LogDetails ? "response:\n" + data : "";
            if (data.match(/\"resultCode\":0/)) {
              if (data.match(/\"count\":\d+/)) {
                console.log("\n" + "京东金融-双签签到成功 " + Details);
                merge.JRDSign.bean = data.match(/\"count\":(\d+)/)[1];
                merge.JRDSign.notify =
                  "京东金融-双签: 成功, 明细: " +
                  merge.JRDSign.bean +
                  "京豆 🐶";
                merge.JRDSign.success = 1;
              } else {
                console.log("\n" + "京东金融-双签签到失败 " + Details);
                merge.JRDSign.fail = 1;
                if (data.match(/已领取/)) {
                  merge.JRDSign.notify = "京东金融-双签: 失败, 原因: 已签过 ⚠️";
                } else if (data.match(/未在/)) {
                  merge.JRDSign.notify =
                    "京东金融-双签: 失败, 原因: 未在京东签到 ⚠️";
                } else {
                  merge.JRDSign.notify = "京东金融-双签: 失败, 原因: 无奖励 🐶";
                }
              }
            } else {
              console.log("\n" + "京东金融-双签签到失败 " + Details);
              merge.JRDSign.fail = 1;
              if (data.match(/(\"resultCode\":3|请先登录)/)) {
                merge.JRDSign.notify =
                  "京东金融-双签: 失败, 原因: Cookie失效‼️";
              } else {
                merge.JRDSign.notify = "京东金融-双签: 失败, 原因: 未知 ⚠️";
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东金融-双签", "JRDSign", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JingDongShake(s) {
  return new Promise((resolve) => {
    if (disable("JDShake")) return resolve();
    setTimeout(() => {
      const JDSh = {
        url: "https://api.m.jd.com/client.action?appid=vip_h5&functionId=vvipclub_shaking",
        headers: {
          Cookie: KEY,
        },
      };
      $nobyda.get(JDSh, async function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const Details = LogDetails ? "response:\n" + data : "";
            const cc = JSON.parse(data);
            const also = merge.JDShake.notify ? true : false;
            if (data.match(/prize/)) {
              console.log("\n" + "京东商城-摇一摇签到成功 " + Details);
              merge.JDShake.success += 1;
              if (cc.data.prizeBean) {
                merge.JDShake.bean += cc.data.prizeBean.count || 0;
                merge.JDShake.notify += `${also ? `\n` : ``}京东商城-摇摇: ${
                  also ? `多次` : `成功`
                }, 明细: ${merge.JDShake.bean || `无`}京豆 🐶`;
              } else if (cc.data.prizeCoupon) {
                merge.JDShake.notify += `${also ? `\n` : ``}京东商城-摇摇: ${
                  also ? `多次, ` : ``
                }获得满${cc.data.prizeCoupon.quota}减${
                  cc.data.prizeCoupon.discount
                }优惠券→ ${cc.data.prizeCoupon.limitStr}`;
              } else {
                merge.JDShake.notify += `${
                  also ? `\n` : ``
                }京东商城-摇摇: 成功, 明细: 未知 ⚠️${also ? ` (多次)` : ``}`;
              }
              if (cc.data.luckyBox.freeTimes != 0) {
                await JingDongShake(s);
              }
            } else {
              console.log("\n" + "京东商城-摇一摇签到失败 " + Details);
              if (data.match(/true/)) {
                merge.JDShake.notify += `${
                  also ? `\n` : ``
                }京东商城-摇摇: 成功, 明细: 无奖励 🐶${also ? ` (多次)` : ``}`;
                merge.JDShake.success += 1;
                if (cc.data.luckyBox.freeTimes != 0) {
                  await JingDongShake(s);
                }
              } else {
                merge.JDShake.fail = 1;
                if (data.match(/(无免费|8000005|9000005)/)) {
                  merge.JDShake.notify = "京东商城-摇摇: 失败, 原因: 已摇过 ⚠️";
                } else if (data.match(/(未登录|101)/)) {
                  merge.JDShake.notify =
                    "京东商城-摇摇: 失败, 原因: Cookie失效‼️";
                } else {
                  merge.JDShake.notify += `${
                    also ? `\n` : ``
                  }京东商城-摇摇: 失败, 原因: 未知 ⚠️${also ? ` (多次)` : ``}`;
                }
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-摇摇", "JDShake", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JDUserSignPre(s, key, title) {
  if ($nobyda.isNode) {
    return JDUserSignPre1(s, key, title);
  } else if (key == "JDWomen" || key == "JDJewels" || $nobyda.isJSBox) {
    return JDUserSignPre2(s, key, title);
  } else {
    return JDUserSignPre1(s, key, title);
  }
}

function JDUserSignPre1(s, key, title, ask) {
  return new Promise((resolve, reject) => {
    if (disable(key, title, 1)) return reject();
    const JDUrl = {
      url: "https://api.m.jd.com/?client=wh5&functionId=qryH5BabelFloors",
      headers: {
        Cookie: KEY,
      },
      body: `body=${encodeURIComponent(
        `{"activityId":"${acData[key]}"${
          ask ? `,"paginationParam":"2",${ask}` : ``
        }}`
      )}`,
    };
    $nobyda.post(JDUrl, async function (error, response, data) {
      try {
        if (error) {
          throw new Error(error);
        } else {
          const turnTableId = data.match(/\"turnTableId\":\"(\d+)\"/);
          const page = data.match(/\"paginationFlrs\":\"\[\[.+?\]\]\"/);
          if (data.match(/enActK/)) {
            // 含有签到活动数据
            const od = JSON.parse(data);
            let params = (od.floatLayerList || [])
              .filter((o) => o.params && o.params.match(/enActK/))
              .map((o) => o.params)
              .pop();
            if (!params) {
              // 第一处找到签到所需数据
              // floatLayerList未找到签到所需数据，从floorList中查找
              let signInfo = (od.floorList || [])
                .filter(
                  (o) =>
                    o.template == "signIn" &&
                    o.signInfos &&
                    o.signInfos.params &&
                    o.signInfos.params.match(/enActK/)
                )
                .map((o) => o.signInfos)
                .pop();
              if (signInfo) {
                if (signInfo.signStat == "1") {
                  console.log(`\n${title}重复签到`);
                  merge[key].notify = `${title}: 失败, 原因: 已签过 ⚠️`;
                  merge[key].fail = 1;
                } else {
                  params = signInfo.params;
                }
              } else {
                merge[key].notify = `${title}: 失败, 活动查找异常 ⚠️`;
                merge[key].fail = 1;
              }
            }
            if (params) {
              return resolve({
                params: params,
              }); // 执行签到处理
            }
          } else if (turnTableId) {
            // 无签到数据, 但含有关注店铺签到
            const boxds =
              $nobyda.read("JD_Follow_disable") === "false" ? false : true;
            if (boxds) {
              console.log(`\n${title}关注店铺`);
              return resolve(parseInt(turnTableId[1]));
            } else {
              merge[key].notify = `${title}: 失败, 需要关注店铺 ⚠️`;
              merge[key].fail = 1;
            }
          } else if (page && !ask) {
            // 无签到数据, 尝试带参查询
            const boxds =
              $nobyda.read("JD_Retry_disable") === "false" ? false : true;
            if (boxds) {
              console.log(`\n${title}二次查询`);
              return resolve(page[0]);
            } else {
              merge[key].notify = `${title}: 失败, 请尝试开启增强 ⚠️`;
              merge[key].fail = 1;
            }
          } else {
            merge[key].notify = `${title}: 失败, ${
              !data ? `需要手动执行` : `不含活动数据`
            } ⚠️`;
            merge[key].fail = 1;
          }
        }
        reject();
      } catch (eor) {
        $nobyda.AnError(title, key, eor);
        reject();
      }
    });
    if (out) setTimeout(reject, out + s);
  }).then(
    (data) => {
      disable(key, title, 2);
      if (typeof data == "object")
        return JDUserSign1(
          s,
          key,
          title,
          encodeURIComponent(JSON.stringify(data))
        );
      if (typeof data == "number") return JDUserSign2(s, key, title, data);
      if (typeof data == "string") return JDUserSignPre1(s, key, title, data);
    },
    () => disable(key, title, 2)
  );
}

function JDUserSignPre2(s, key, title) {
  return new Promise((resolve, reject) => {
    if (disable(key, title, 1)) return reject();
    const JDUrl = {
      url: `https://pro.m.jd.com/mall/active/${acData[key]}/index.html`,
      headers: {
        Cookie: KEY,
      },
    };
    $nobyda.get(JDUrl, async function (error, response, data) {
      try {
        if (error) {
          throw new Error(error);
        } else {
          const act = data.match(/\"params\":\"\{\\\"enActK.+?\\\"\}\"/);
          const turnTable = data.match(/\"turnTableId\":\"(\d+)\"/);
          const page = data.match(/\"paginationFlrs\":\"\[\[.+?\]\]\"/);
          if (act) {
            // 含有签到活动数据
            return resolve(act);
          } else if (turnTable) {
            // 无签到数据, 但含有关注店铺签到
            const boxds =
              $nobyda.read("JD_Follow_disable") === "false" ? false : true;
            if (boxds) {
              console.log(`\n${title}关注店铺`);
              return resolve(parseInt(turnTable[1]));
            } else {
              merge[key].notify = `${title}: 失败, 需要关注店铺 ⚠️`;
              merge[key].fail = 1;
            }
          } else if (page) {
            // 无签到数据, 尝试带参查询
            const boxds =
              $nobyda.read("JD_Retry_disable") === "false" ? false : true;
            if (boxds) {
              console.log(`\n${title}二次查询`);
              return resolve(page[0]);
            } else {
              merge[key].notify = `${title}: 失败, 请尝试开启增强 ⚠️`;
              merge[key].fail = 1;
            }
          } else {
            merge[key].notify = `${title}: 失败, ${
              !data ? `需要手动执行` : `不含活动数据`
            } ⚠️`;
            merge[key].fail = 1;
          }
        }
        reject();
      } catch (eor) {
        $nobyda.AnError(title, key, eor);
        reject();
      }
    });
    if (out) setTimeout(reject, out + s);
  }).then(
    (data) => {
      disable(key, title, 2);
      if (typeof data == "object")
        return JDUserSign1(s, key, title, encodeURIComponent(`{${data}}`));
      if (typeof data == "number") return JDUserSign2(s, key, title, data);
      if (typeof data == "string") return JDUserSignPre1(s, key, title, data);
    },
    () => disable(key, title, 2)
  );
}

function JDUserSign1(s, key, title, body) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const JDUrl = {
        url: "https://api.m.jd.com/client.action?functionId=userSign",
        headers: {
          Cookie: KEY,
        },
        body: `body=${body}&client=wh5`,
      };
      $nobyda.post(JDUrl, function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const Details = LogDetails ? `response:\n${data}` : "";
            if (data.match(/签到成功/)) {
              console.log(`\n${title}签到成功(1)${Details}`);
              if (data.match(/\"text\":\"\d+京豆\"/)) {
                merge[key].bean = data.match(/\"text\":\"(\d+)京豆\"/)[1];
              }
              merge[key].notify = `${title}: 成功, 明细: ${
                merge[key].bean || "无"
              }京豆 🐶`;
              merge[key].success = 1;
            } else {
              console.log(`\n${title}签到失败(1)${Details}`);
              if (data.match(/(已签到|已领取)/)) {
                merge[key].notify = `${title}: 失败, 原因: 已签过 ⚠️`;
              } else if (data.match(/(不存在|已结束|未开始)/)) {
                merge[key].notify = `${title}: 失败, 原因: 活动已结束 ⚠️`;
              } else if (data.match(/\"code\":\"?3\"?/)) {
                merge[key].notify = `${title}: 失败, 原因: Cookie失效‼️`;
              } else {
                merge[key].notify = `${title}: 失败, 原因: 未知 ⚠️`;
              }
              merge[key].fail = 1;
            }
          }
        } catch (eor) {
          $nobyda.AnError(title, key, eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

async function JDUserSign2(s, key, title, tid) {
  await new Promise((resolve) => {
    $nobyda.get(
      {
        url: `https://jdjoy.jd.com/api/turncard/channel/detail?turnTableId=${tid}`,
        headers: {
          Cookie: KEY,
        },
      },
      function (error, response, data) {
        resolve();
      }
    );
    if (out) setTimeout(resolve, out + s);
  });
  return new Promise((resolve) => {
    setTimeout(() => {
      const JDUrl = {
        url: "https://jdjoy.jd.com/api/turncard/channel/sign",
        headers: {
          Cookie: KEY,
        },
        body: `turnTableId=${tid}`,
      };
      $nobyda.post(JDUrl, function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const Details = LogDetails ? `response:\n${data}` : "";
            if (data.match(/\"success\":true/)) {
              console.log(`\n${title}签到成功(2)${Details}`);
              if (data.match(/\"jdBeanQuantity\":\d+/)) {
                merge[key].bean = data.match(/\"jdBeanQuantity\":(\d+)/)[1];
              }
              merge[key].notify = `${title}: 成功, 明细: ${
                merge[key].bean || "无"
              }京豆 🐶`;
              merge[key].success = 1;
            } else {
              console.log(`\n${title}签到失败(2)${Details}`);
              if (data.match(/(已经签到|已经领取)/)) {
                merge[key].notify = `${title}: 失败, 原因: 已签过 ⚠️`;
              } else if (data.match(/(不存在|已结束|未开始)/)) {
                merge[key].notify = `${title}: 失败, 原因: 活动已结束 ⚠️`;
              } else if (data.match(/(没有登录|B0001)/)) {
                merge[key].notify = `${title}: 失败, 原因: Cookie失效‼️`;
              } else {
                merge[key].notify = `${title}: 失败, 原因: 未知 ⚠️`;
              }
              merge[key].fail = 1;
            }
          }
        } catch (eor) {
          $nobyda.AnError(title, key, eor);
        } finally {
          resolve();
        }
      });
    }, 200 + s);
    if (out) setTimeout(resolve, out + s + 200);
  });
}

function JDFlashSale(s) {
  return new Promise((resolve) => {
    if (disable("JDFSale")) return resolve();
    setTimeout(() => {
      const JDPETUrl = {
        url: "https://api.m.jd.com/client.action?functionId=partitionJdSgin",
        headers: {
          Cookie: KEY,
        },
        body: "body=%7B%22version%22%3A%22v2%22%7D&client=apple&clientVersion=9.0.8&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&sign=6768e2cf625427615dd89649dd367d41&st=1597248593305&sv=121",
      };
      $nobyda.post(JDPETUrl, async function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const Details = LogDetails ? "response:\n" + data : "";
            const cc = JSON.parse(data);
            if (cc.result.code == 0) {
              console.log("\n" + "京东商城-闪购签到成功 " + Details);
              merge.JDFSale.bean = cc.result.jdBeanNum || 0;
              merge.JDFSale.notify =
                "京东商城-闪购: 成功, 明细: " +
                (merge.JDFSale.bean || "无") +
                "京豆 🐶";
              merge.JDFSale.success = 1;
            } else {
              merge.JDFSale.fail = 1;
              console.log("\n" + "京东商城-闪购签到失败 " + Details);
              if (data.match(/(已签到|已领取|\"2005\")/)) {
                merge.JDFSale.notify = "京东商城-闪购: 失败, 原因: 已签过 ⚠️";
              } else if (data.match(/不存在|已结束|\"2008\"|\"3001\"/)) {
                //merge.JDFSale.notify = "京东商城-闪购: 失败, 原因: 需瓜分 ⚠️"
                await FlashSaleDivide(s);
              } else if (data.match(/(\"code\":\"3\"|\"1003\")/)) {
                merge.JDFSale.notify =
                  "京东商城-闪购: 失败, 原因: Cookie失效‼️";
              } else {
                const msg = data.match(/\"msg\":\"([\u4e00-\u9fa5].+?)\"/);
                merge.JDFSale.notify = `京东商城-闪购: 失败, ${
                  msg ? msg[1] : `原因: 未知`
                } ⚠️`;
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-闪购", "JDFSale", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function FlashSaleDivide(s) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const Url = {
        url: "https://api.m.jd.com/client.action?functionId=partitionJdShare",
        headers: {
          Cookie: KEY,
        },
        body: "body=%7B%22version%22%3A%22v2%22%7D&client=apple&clientVersion=9.0.8&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&sign=49baa3b3899b02bbf06cdf41fe191986&st=1597682588351&sv=111",
      };
      $nobyda.post(Url, function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const Details = LogDetails ? "response:\n" + data : "";
            const cc = JSON.parse(data);
            if (cc.result.code == 0) {
              merge.JDFSale.success = 1;
              merge.JDFSale.bean = cc.result.jdBeanNum || 0;
              merge.JDFSale.notify =
                "京东闪购-瓜分: 成功, 明细: " +
                (merge.JDFSale.bean || "无") +
                "京豆 🐶";
              console.log("\n" + "京东闪购-瓜分签到成功 " + Details);
            } else {
              merge.JDFSale.fail = 1;
              console.log("\n" + "京东闪购-瓜分签到失败 " + Details);
              if (data.match(/已参与|已领取|\"2006\"/)) {
                merge.JDFSale.notify = "京东闪购-瓜分: 失败, 原因: 已瓜分 ⚠️";
              } else if (data.match(/不存在|已结束|未开始|\"2008\"|\"2012\"/)) {
                merge.JDFSale.notify =
                  "京东闪购-瓜分: 失败, 原因: 活动已结束 ⚠️";
              } else if (data.match(/\"code\":\"1003\"|未获取/)) {
                merge.JDFSale.notify =
                  "京东闪购-瓜分: 失败, 原因: Cookie失效‼️";
              } else {
                const msg = data.match(/\"msg\":\"([\u4e00-\u9fa5].+?)\"/);
                merge.JDFSale.notify = `京东闪购-瓜分: 失败, ${
                  msg ? msg[1] : `原因: 未知`
                } ⚠️`;
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东闪购-瓜分", "JDFSale", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JingDongCash(s) {
  return new Promise((resolve) => {
    if (disable("JDCash")) return resolve();
    setTimeout(() => {
      const JDCAUrl = {
        url: "https://api.m.jd.com/client.action?functionId=ccSignInNew",
        headers: {
          Cookie: KEY,
        },
        body: "body=%7B%22pageClickKey%22%3A%22CouponCenter%22%2C%22eid%22%3A%22O5X6JYMZTXIEX4VBCBWEM5PTIZV6HXH7M3AI75EABM5GBZYVQKRGQJ5A2PPO5PSELSRMI72SYF4KTCB4NIU6AZQ3O6C3J7ZVEP3RVDFEBKVN2RER2GTQ%22%2C%22shshshfpb%22%3A%22v1%5C%2FzMYRjEWKgYe%2BUiNwEvaVlrHBQGVwqLx4CsS9PH1s0s0Vs9AWk%2B7vr9KSHh3BQd5NTukznDTZnd75xHzonHnw%3D%3D%22%2C%22childActivityUrl%22%3A%22openapp.jdmobile%253a%252f%252fvirtual%253fparams%253d%257b%255c%2522category%255c%2522%253a%255c%2522jump%255c%2522%252c%255c%2522des%255c%2522%253a%255c%2522couponCenter%255c%2522%257d%22%2C%22monitorSource%22%3A%22cc_sign_ios_index_config%22%7D&client=apple&clientVersion=8.5.0&d_brand=apple&d_model=iPhone8%2C2&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&scope=11&screen=1242%2A2208&sign=1cce8f76d53fc6093b45a466e93044da&st=1581084035269&sv=102",
      };
      $nobyda.post(JDCAUrl, function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const Details = LogDetails ? "response:\n" + data : "";
            const cc = JSON.parse(data);
            if (cc.busiCode == "0") {
              console.log("\n" + "京东现金-红包签到成功 " + Details);
              merge.JDCash.success = 1;
              merge.JDCash.Cash = cc.result.signResult.signData.amount || 0;
              merge.JDCash.notify = `京东现金-红包: 成功, 明细: ${
                merge.JDCash.Cash || `无`
              }红包 🧧`;
            } else {
              console.log("\n" + "京东现金-红包签到失败 " + Details);
              merge.JDCash.fail = 1;
              if (data.match(/(\"busiCode\":\"1002\"|完成签到)/)) {
                merge.JDCash.notify = "京东现金-红包: 失败, 原因: 已签过 ⚠️";
              } else if (data.match(/(不存在|已结束)/)) {
                merge.JDCash.notify =
                  "京东现金-红包: 失败, 原因: 活动已结束 ⚠️";
              } else if (data.match(/(\"busiCode\":\"3\"|未登录)/)) {
                merge.JDCash.notify = "京东现金-红包: 失败, 原因: Cookie失效‼️";
              } else {
                merge.JDCash.notify = "京东现金-红包: 失败, 原因: 未知 ⚠️";
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东现金-红包", "JDCash", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JDMagicCube(s) {
  return new Promise((resolve, reject) => {
    if (disable("JDCube")) return reject();
    const JDUrl = {
      url: "https://api.m.jd.com/client.action?functionId=getNewsInteractionInfo&appid=smfe",
      headers: {
        Cookie: KEY,
      },
    };
    $nobyda.get(JDUrl, function (error, response, data) {
      try {
        if (error) throw new Error(error);
        const Details = LogDetails ? "response:\n" + data : "";
        if (data.match(/\"interactionId\":\d+/)) {
          merge.JDCube.key = data.match(/\"interactionId\":(\d+)/)[1];
          console.log("\n京东魔方-查询活动成功 " + Details);
        } else {
          console.log("\n京东魔方-暂无有效活动 " + Details);
        }
      } catch (eor) {
        $nobyda.AnError("京东魔方-查询", "JDCube", eor);
      } finally {
        resolve(merge.JDCube.key);
      }
    });
    if (out) setTimeout(reject, out + s);
  }).then(
    (data) => {
      return JDMagicCubeSign(s, data);
    },
    () => {}
  );
}

function JDMagicCubeSign(s, id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const JDMCUrl = {
        url: `https://api.m.jd.com/client.action?functionId=getNewsInteractionLotteryInfo&appid=smfe${
          id ? `&body=%7B%22interactionId%22%3A${id}%7D` : ``
        }`,
        headers: {
          Cookie: KEY,
        },
      };
      $nobyda.get(JDMCUrl, function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const Details = LogDetails ? "response:\n" + data : "";
            const cc = JSON.parse(data);
            if (data.match(/(\"name\":)/)) {
              console.log("\n" + "京东商城-魔方签到成功 " + Details);
              merge.JDCube.success = 1;
              if (data.match(/(\"name\":\"京豆\")/)) {
                merge.JDCube.bean = cc.result.lotteryInfo.quantity || 0;
                merge.JDCube.notify = `京东商城-魔方: 成功, 明细: ${
                  merge.JDCube.bean || `无`
                }京豆 🐶`;
              } else {
                merge.JDCube.notify = `京东商城-魔方: 成功, 明细: ${
                  cc.result.lotteryInfo.name || `未知`
                } 🎉`;
              }
            } else {
              console.log("\n" + "京东商城-魔方签到失败 " + Details);
              merge.JDCube.fail = 1;
              if (data.match(/(一闪而过|已签到|已领取)/)) {
                merge.JDCube.notify = "京东商城-魔方: 失败, 原因: 无机会 ⚠️";
              } else if (data.match(/(不存在|已结束)/)) {
                merge.JDCube.notify =
                  "京东商城-魔方: 失败, 原因: 活动已结束 ⚠️";
              } else if (data.match(/(\"code\":3)/)) {
                merge.JDCube.notify = "京东商城-魔方: 失败, 原因: Cookie失效‼️";
              } else {
                merge.JDCube.notify = "京东商城-魔方: 失败, 原因: 未知 ⚠️";
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-魔方", "JDCube", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JingDongPrize(s) {
  return new Promise((resolve) => {
    if (disable("JDPrize")) return resolve();
    setTimeout(() => {
      const JDkey = {
        url: "https://api.m.jd.com/client.action?functionId=vvipscdp_raffleAct_index&client=apple&clientVersion=8.1.0&appid=member_benefit_m",
        headers: {
          Cookie: KEY,
          Referer: "https://jdmall.m.jd.com/beansForPrizes",
        },
      };
      $nobyda.get(JDkey, async function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const Details = LogDetails ? "response:\n" + data : "";
            if (data.match(/\"raffleActKey\":\"[a-zA-z0-9]{3,}\"/)) {
              const cc = JSON.parse(data);
              merge.JDPrize.key = cc.data.floorInfoList[0].detail.raffleActKey;
              console.log("\n" + "京东商城-大奖查询成功 " + Details);
              if (merge.JDPrize.key) {
                await JDPrizeCheckin(s);
              } else {
                merge.JDPrize.notify = "京东商城-大奖: 失败, 原因: 无奖池 ⚠️";
                merge.JDPrize.fail = 1;
              }
            } else {
              console.log("\n" + "京东商城-大奖查询KEY失败 " + Details);
              merge.JDPrize.fail = 1;
              if (data.match(/(未登录|\"101\")/)) {
                merge.JDPrize.notify =
                  "京东大奖-登录: 失败, 原因: Cookie失效‼️";
              } else {
                merge.JDPrize.notify = "京东大奖-登录: 失败, 原因: 未知 ⚠️";
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东大奖-查询", "JDPrize", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JDPrizeCheckin(s) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const JDPUrl = {
        url:
          "https://api.m.jd.com/client.action?functionId=vvipscdp_raffleAct_lotteryDraw&body=%7B%22raffleActKey%22%3A%22" +
          merge.JDPrize.key +
          "%22%2C%22drawType%22%3A0%2C%22riskInformation%22%3A%7B%7D%7D&client=apple&clientVersion=8.1.0&appid=member_benefit_m",
        headers: {
          Cookie: KEY,
          Referer: "https://jdmall.m.jd.com/beansForPrizes",
        },
      };
      $nobyda.get(JDPUrl, function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const Details = LogDetails ? "response:\n" + data : "";
            const c = JSON.parse(data);
            if (data.match(/\"success\":true/)) {
              console.log("\n" + "京东商城-大奖签到成功 " + Details);
              merge.JDPrize.success = 1;
              if (data.match(/\"beanNumber\":\d+/)) {
                merge.JDPrize.notify =
                  "京东商城-大奖: 成功, 明细: " + c.data.beanNumber + "京豆 🐶";
                merge.JDPrize.bean = c.data.beanNumber;
              } else if (data.match(/\"couponInfoVo\"/)) {
                if (data.match(/\"limitStr\"/)) {
                  merge.JDPrize.notify =
                    "京东商城-大奖: 获得满" +
                    c.data.couponInfoVo.quota +
                    "减" +
                    c.data.couponInfoVo.discount +
                    "优惠券→ " +
                    c.data.couponInfoVo.limitStr;
                } else {
                  merge.JDPrize.notify = "京东商城-大奖: 成功, 明细: 优惠券";
                }
              } else if (data.match(/\"pitType\":0/)) {
                merge.JDPrize.notify = "京东商城-大奖: 成功, 明细: 未中奖 🐶";
              } else {
                merge.JDPrize.notify = "京东商城-大奖: 成功, 明细: 未知 🐶";
              }
            } else {
              console.log("\n" + "京东商城-大奖签到失败 " + Details);
              merge.JDPrize.fail = 1;
              if (data.match(/(已用光|7000003)/)) {
                merge.JDPrize.notify = "京东商城-大奖: 失败, 原因: 已签过 ⚠️";
              } else if (data.match(/(未登录|\"101\")/)) {
                merge.JDPrize.notify =
                  "京东商城-大奖: 失败, 原因: Cookie失效‼️";
              } else if (data.match(/7000005/)) {
                merge.JDPrize.notify = "京东商城-大奖: 失败, 原因: 未中奖 ⚠️";
              } else {
                merge.JDPrize.notify = "京东商城-大奖: 失败, 原因: 未知 ⚠️";
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东大奖-签到", "JDPrize", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JingDongSpeedUp(s, id) {
  return new Promise((resolve) => {
    if (disable("SpeedUp")) return resolve();
    setTimeout(() => {
      const GameUrl = {
        url: `https://api.m.jd.com/?appid=memberTaskCenter&functionId=flyTask_${
          id
            ? `start&body=%7B%22source%22%3A%22game%22%2C%22source_id%22%3A${id}%7D`
            : `state&body=%7B%22source%22%3A%22game%22%7D`
        }`,
        headers: {
          Referer:
            "https://h5.m.jd.com/babelDiy/Zeus/6yCQo2eDJPbyPXrC3eMCtMWZ9ey/index.html",
          Cookie: KEY,
        },
      };
      $nobyda.get(GameUrl, async function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const Details = LogDetails ? "response:\n" + data : "";
            var cc = JSON.parse(data);
            if (!id) {
              var status = $nobyda.ItemIsUsed
                ? "再次检查"
                : merge.SpeedUp.notify
                ? "查询本次"
                : "查询上次";
              console.log(`\n天天加速-${status}任务 ${Details}`);
            } else {
              console.log(
                `\n天天加速-开始${
                  $nobyda.ItemIsUsed ? `下轮` : `本次`
                }任务 ${Details}`
              );
            }
            if (cc.message == "not login") {
              merge.SpeedUp.fail = 1;
              merge.SpeedUp.notify = "京东天天-加速: 失败, 原因: Cookie失效‼️";
              console.log("\n天天加速-Cookie失效");
            } else if (cc.message == "success") {
              if (cc.data.task_status == 0 && cc.data.source_id) {
                if ($nobyda.ItemIsUsed) {
                  //如果使用道具后再次开始任务, 则收到奖励
                  console.log("\n天天加速-领取本次奖励成功");
                  merge.SpeedUp.bean = cc.data.beans_num || 0;
                  merge.SpeedUp.success = 1;
                  merge.SpeedUp.notify = `京东天天-加速: 成功, 明细: ${
                    merge.SpeedUp.bean || `无`
                  }京豆 🐶`;
                }
                await JingDongSpeedUp(s, cc.data.source_id);
              } else if (cc.data.task_status == 1) {
                const percent = Math.round(
                  (cc.data.done_distance / cc.data.distance) * 100
                );
                console.log(
                  `\n天天加速-目前结束时间: \n${cc.data.end_time} [${percent}%]`
                );
                $nobyda.ItemIsUsed = false;
                if (!$nobyda.isAllEvents) await JDSpaceEvent(s); //处理太空事件
                if (!$nobyda.isAlltasks) await JDQueryTask(s); //处理太空任务
                var step3 = await JDQueryTaskID(s); //查询道具ID
                var step4 = await JDUseProps(s, step3); //使用道具
                if (step4 && $nobyda.ItemIsUsed) {
                  //如果使用了道具, 则再次检查任务
                  await JingDongSpeedUp(s);
                } else {
                  $nobyda.isAllEvents = false; //避免多账号问题
                  $nobyda.isAlltasks = false;
                  if (!merge.SpeedUp.notify) {
                    merge.SpeedUp.fail = 1;
                    merge.SpeedUp.notify = `京东天天-加速: 失败, 加速中${
                      percent < 10 ? `  ` : ``
                    }[${percent}%] ⚠️`;
                  }
                }
              } else if (cc.data.task_status == 2) {
                merge.SpeedUp.bean = cc.data.beans_num || 0;
                merge.SpeedUp.notify = `京东天天-加速: 成功, 明细: ${
                  merge.SpeedUp.bean || `无`
                }京豆 🐶`;
                merge.SpeedUp.success = 1;
                console.log("\n天天加速-领取上次奖励成功");
                await JingDongSpeedUp(s, null);
              } else {
                merge.SpeedUp.fail = 1;
                merge.SpeedUp.notify = "京东天天-加速: 失败, 原因: 未知 ⚠️";
                console.log("\n" + "天天加速-判断状态码失败");
              }
            } else {
              merge.SpeedUp.fail = 1;
              merge.SpeedUp.notify = "京东天天-加速: 失败, 原因: 未知 ⚠️";
              console.log("\n" + "天天加速-判断状态失败");
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东天天-加速", "SpeedUp", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JDSpaceEvent(s) {
  return new Promise((resolve) => {
    var spaceEvents = [];
    $nobyda.get(
      {
        url: `https://api.m.jd.com/?appid=memberTaskCenter&functionId=spaceEvent_list&body=%7B%22source%22%3A%22game%22%7D`,
        headers: {
          Referer:
            "https://h5.m.jd.com/babelDiy/Zeus/6yCQo2eDJPbyPXrC3eMCtMWZ9ey/index.html",
          Cookie: KEY,
        },
      },
      (error, response, data) => {
        try {
          if (error) throw new Error(error);
          const cc = JSON.parse(data);
          const Details = LogDetails ? "response:\n" + data : "";
          if (cc.message === "success" && cc.data.length > 0) {
            for (var item of cc.data) {
              if (item.status === 1) {
                for (var j of item.options) {
                  if (j.type === 1) {
                    spaceEvents.push({
                      id: item.id,
                      value: j.value,
                    });
                  }
                }
              }
            }
            if (spaceEvents && spaceEvents.length > 0) {
              console.log(
                `\n天天加速-查询到${spaceEvents.length}个有效事件 ${Details}`
              );
            } else {
              console.log(`\n天天加速-暂无太空事件 ${Details}`);
            }
          } else {
            console.log(`\n天天加速-太空事件为空 ${Details}`);
          }
        } catch (eor) {
          $nobyda.AnError("太空事件-查询", "SpeedUp", eor);
        } finally {
          resolve(spaceEvents);
        }
      }
    );
    if (out) setTimeout(resolve, out + s);
  }).then(async (list) => {
    await new Promise((resolve) => {
      if (list && list.length > 0) {
        var spaceEventCount = 0;
        var spaceNumTask = 0;
        for (var item of list) {
          $nobyda.get(
            {
              url: `https://api.m.jd.com/?appid=memberTaskCenter&functionId=spaceEvent_handleEvent&body=%7B%22source%22%3A%22game%22%2C%22eventId%22%3A${item.id}%2C%22option%22%3A%22${item.value}%22%7D`,
              headers: {
                Referer:
                  "https://h5.m.jd.com/babelDiy/Zeus/6yCQo2eDJPbyPXrC3eMCtMWZ9ey/index.html",
                Cookie: KEY,
              },
            },
            (error, response, data) => {
              try {
                spaceEventCount++;
                if (error) throw new Error(error);
                const cc = JSON.parse(data);
                const Details = LogDetails ? "response:\n" + data : "";
                console.log(
                  `\n天天加速-尝试领取第${spaceEventCount}个事件 ${Details}`
                );
                if (cc.message == "success" && cc.success) {
                  spaceNumTask += 1;
                }
              } catch (eor) {
                $nobyda.AnError("太空事件-领取", "SpeedUp", eor);
              } finally {
                if (list.length == spaceEventCount) {
                  if (list.length == spaceNumTask) $nobyda.isAllEvents = true; //避免重复查询
                  console.log(`\n天天加速-已成功领取${spaceNumTask}个事件`);
                  resolve();
                }
              }
            }
          );
        }
        if (out) setTimeout(resolve, out + s);
      } else {
        $nobyda.isAllEvents = true; //避免重复查询
        resolve();
      }
    });
  });
}

function JDQueryTask(s) {
  return new Promise((resolve) => {
    setTimeout(() => {
      var TaskID = "";
      const QueryUrl = {
        url: "https://api.m.jd.com/?appid=memberTaskCenter&functionId=energyProp_list&body=%7B%22source%22%3A%22game%22%7D",
        headers: {
          Referer:
            "https://h5.m.jd.com/babelDiy/Zeus/6yCQo2eDJPbyPXrC3eMCtMWZ9ey/index.html",
          Cookie: KEY,
        },
      };
      $nobyda.get(QueryUrl, async function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const cc = JSON.parse(data);
            const Details = LogDetails ? "response:\n" + data : "";
            if (cc.message == "success" && cc.data.length > 0) {
              for (var i = 0; i < cc.data.length; i++) {
                if (cc.data[i].thaw_time == 0) {
                  TaskID += cc.data[i].id + ",";
                }
              }
              if (TaskID.length > 0) {
                TaskID = TaskID.substr(0, TaskID.length - 1).split(",");
                console.log(
                  "\n天天加速-查询到" + TaskID.length + "个有效道具 " + Details
                );
              } else {
                console.log("\n天天加速-暂无有效道具 " + Details);
              }
            } else {
              console.log("\n天天加速-查询无道具 " + Details);
            }
          }
        } catch (eor) {
          $nobyda.AnError("查询道具-加速", "SpeedUp", eor);
        } finally {
          resolve(TaskID);
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  }).then(async (CID) => {
    await new Promise((resolve) => {
      var NumTask = 0;
      if (CID) {
        var count = 0;
        for (var i = 0; i < CID.length; i++) {
          const TUrl = {
            url:
              "https://api.m.jd.com/?appid=memberTaskCenter&functionId=energyProp_gain&body=%7B%22source%22%3A%22game%22%2C%22energy_id%22%3A" +
              CID[i] +
              "%7D",
            headers: {
              Referer:
                "https://h5.m.jd.com/babelDiy/Zeus/6yCQo2eDJPbyPXrC3eMCtMWZ9ey/index.html",
              Cookie: KEY,
            },
          };
          $nobyda.get(TUrl, function (error, response, data) {
            try {
              count++;
              if (error) {
                throw new Error(error);
              } else {
                const cc = JSON.parse(data);
                const Details = LogDetails ? "response:\n" + data : "";
                console.log(
                  "\n天天加速-尝试领取第" + count + "个道具 " + Details
                );
                if (cc.message == "success") {
                  NumTask += 1;
                }
              }
            } catch (eor) {
              $nobyda.AnError("领取道具-加速", "SpeedUp", eor);
            } finally {
              if (CID.length == count) {
                if (CID.length == NumTask) $nobyda.isAlltasks = true; //避免重复查询
                console.log("\n天天加速-已成功领取" + NumTask + "个道具");
                resolve(NumTask);
              }
            }
          });
        }
        if (out) setTimeout(resolve, out + s);
      } else {
        $nobyda.isAlltasks = true; //避免重复查询
        resolve(NumTask);
      }
    });
  });
}

function JDQueryTaskID(s) {
  return new Promise((resolve) => {
    var TaskCID = "";
    setTimeout(() => {
      const EUrl = {
        url: "https://api.m.jd.com/?appid=memberTaskCenter&functionId=energyProp_usalbeList&body=%7B%22source%22%3A%22game%22%7D",
        headers: {
          Referer:
            "https://h5.m.jd.com/babelDiy/Zeus/6yCQo2eDJPbyPXrC3eMCtMWZ9ey/index.html",
          Cookie: KEY,
        },
      };
      $nobyda.get(EUrl, function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const cc = JSON.parse(data);
            const Details = LogDetails ? "response:\n" + data : "";
            if (cc.data.length > 0) {
              for (var i = 0; i < cc.data.length; i++) {
                if (cc.data[i].id) {
                  TaskCID += cc.data[i].id + ",";
                }
              }
              if (TaskCID.length > 0) {
                TaskCID = TaskCID.substr(0, TaskCID.length - 1).split(",");
                console.log(
                  `\n天天加速-查询成功${TaskCID.length}个道具ID ${Details}`
                );
              } else {
                console.log(`\n天天加速-暂无有效道具ID ${Details}`);
              }
            } else {
              console.log(`\n天天加速-查询无道具ID ${Details}`);
            }
          }
        } catch (eor) {
          $nobyda.AnError("查询号码-加速", "SpeedUp", eor);
        } finally {
          resolve(TaskCID);
        }
      });
    }, s + 200);
    if (out) setTimeout(resolve, out + s);
  });
}

function JDUseProps(s, PropID) {
  return new Promise((resolve) => {
    if (PropID) {
      setTimeout(() => {
        var PropCount = 0;
        var PropNumTask = 0;
        for (var i = 0; i < PropID.length; i++) {
          const PropUrl = {
            url:
              "https://api.m.jd.com/?appid=memberTaskCenter&functionId=energyProp_use&body=%7B%22source%22%3A%22game%22%2C%22energy_id%22%3A%22" +
              PropID[i] +
              "%22%7D",
            headers: {
              Referer:
                "https://h5.m.jd.com/babelDiy/Zeus/6yCQo2eDJPbyPXrC3eMCtMWZ9ey/index.html",
              Cookie: KEY,
            },
          };
          $nobyda.get(PropUrl, function (error, response, data) {
            try {
              PropCount++;
              if (error) {
                throw new Error(error);
              } else {
                const cc = JSON.parse(data);
                const Details = LogDetails ? "response:\n" + data : "";
                console.log(
                  "\n天天加速-尝试使用第" + PropCount + "个道具 " + Details
                );
                if (cc.message == "success" && cc.success == true) {
                  PropNumTask += 1;
                }
              }
            } catch (eor) {
              $nobyda.AnError("使用道具-加速", "SpeedUp", eor);
            } finally {
              if (PropID.length == PropCount) {
                console.log("\n天天加速-已成功使用" + PropNumTask + "个道具");
                if (PropNumTask) $nobyda.ItemIsUsed = true;
                resolve(PropNumTask);
              }
            }
          });
        }
      }, s);
      if (out) setTimeout(resolve, out + s);
    } else {
      resolve();
    }
  });
}

function JingDongSubsidy(s) {
  return new Promise((resolve) => {
    if (disable("subsidy")) return resolve();
    setTimeout(() => {
      const subsidyUrl = {
        url: "https://ms.jr.jd.com/gw/generic/uc/h5/m/signIn7",
        headers: {
          Referer: "https://active.jd.com/forever/cashback/index",
          Cookie: KEY,
        },
      };
      $nobyda.get(subsidyUrl, function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const Details = LogDetails ? "response:\n" + data : "";
            if (data.match(/\"msg\":\"操作成功\"/)) {
              console.log("\n" + "京东商城-金贴签到成功 " + Details);
              merge.subsidy.success = 1;
              if (data.match(/\"thisAmountStr\":\".+?\"/)) {
                var Quantity = data.match(/\"thisAmountStr\":\"(.+?)\"/)[1];
                merge.subsidy.notify =
                  "京东商城-金贴: 成功, 明细: " + Quantity + "金贴 💰";
              } else {
                merge.subsidy.notify = "京东商城-金贴: 成功, 明细: 无金贴 💰";
              }
            } else {
              console.log("\n" + "京东商城-金贴签到失败 " + Details);
              merge.subsidy.fail = 1;
              if (data.match(/已存在/)) {
                merge.subsidy.notify = "京东商城-金贴: 失败, 原因: 已签过 ⚠️";
              } else if (data.match(/请先登录/)) {
                merge.subsidy.notify =
                  "京东商城-金贴: 失败, 原因: Cookie失效‼️";
              } else {
                merge.subsidy.notify = "京东商城-金贴: 失败, 原因: 未知 ⚠️";
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-金贴", "subsidy", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JingRongDoll(s, type, num) {
  return new Promise((resolve) => {
    if (disable("JRDoll")) return resolve();
    setTimeout(() => {
      const DollUrl = {
        url: "https://nu.jr.jd.com/gw/generic/jrm/h5/m/process",
        headers: {
          Cookie: KEY,
        },
        body:
          "reqData=%7B%22actCode%22%3A%22890418F764%22%2C%22type%22%3A" +
          (type ? type : "3") +
          "%7D",
      };
      $nobyda.post(DollUrl, async function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            var cc = JSON.parse(data);
            const Details = LogDetails ? "response:\n" + data : "";
            if (cc.resultCode == 0) {
              if (cc.resultData.data.businessData != null) {
                console.log("\n" + "京东金融-娃娃登录成功 " + Details);
                if (cc.resultData.data.businessData.pickStatus == 2) {
                  if (data.match(/\"rewardPrice\":\"?(\d+)/)) {
                    var JRDoll_bean = data.match(/\"rewardPrice\":\"?(\d+)/)[1];
                    await JingRongDoll(s, "4", JRDoll_bean);
                  } else {
                    merge.JRDoll.success = 1;
                    merge.JRDoll.notify =
                      "京东金融-娃娃: 成功, 明细: 无京豆 🐶";
                  }
                } else {
                  console.log("\n" + "京东金融-娃娃签到失败 " + Details);
                  merge.JRDoll.notify = "京东金融-娃娃: 失败, 原因: 已签过 ⚠️";
                  merge.JRDoll.fail = 1;
                }
              } else if (cc.resultData.data.businessCode == 200) {
                console.log("\n" + "京东金融-娃娃签到成功 " + Details);
                merge.JRDoll.bean = num ? num : 0;
                merge.JRDoll.success = num ? 1 : 0;
                merge.JRDoll.notify =
                  "京东金融-娃娃: 成功, 明细: " +
                  (num ? num + "京豆 🐶" : "无京豆 🐶");
              } else {
                console.log("\n" + "京东金融-娃娃签到异常 " + Details);
                merge.JRDoll.fail = 1;
                merge.JRDoll.notify = "京东金融-娃娃: 失败, 原因: 领取异常 ⚠️";
              }
            } else if (cc.resultCode == 3) {
              console.log("\n" + "京东金融-娃娃签到失败 " + Details);
              merge.JRDoll.notify = "京东金融-娃娃: 失败, 原因: Cookie失效‼️";
              merge.JRDoll.fail = 1;
            } else {
              console.log("\n" + "京东金融-娃娃判断失败 " + Details);
              merge.JRDoll.notify = "京东金融-娃娃: 失败, 原因: 未知 ⚠️";
              merge.JRDoll.fail = 1;
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东金融-娃娃", "JRDoll", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JDOverseas(s) {
  return new Promise((resolve) => {
    if (disable("Overseas")) return resolve();
    setTimeout(() => {
      const OverseasUrl = {
        url: "https://api.m.jd.com/client.action?functionId=checkin",
        headers: {
          Cookie: KEY,
        },
        body: "body=%7B%7D&build=167237&client=apple&clientVersion=9.0.0&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&partner=apple&scope=11&sign=e27f8b904040a0e3c99b87fc27e09c87&st=1591730990449&sv=101",
      };
      $nobyda.post(OverseasUrl, function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const Details = LogDetails ? "response:\n" + data : "";
            if (data.match(/\"type\":\d+?,/)) {
              console.log("\n" + "京东商城-国际签到成功 " + Details);
              merge.Overseas.success = 1;
              if (data.match(/\"jdBeanAmount\":[1-9]+/)) {
                merge.Overseas.bean = data.match(/\"jdBeanAmount\":(\d+)/)[1];
                merge.Overseas.notify =
                  "京东商城-国际: 成功, 明细: " +
                  merge.Overseas.bean +
                  "京豆 🐶";
              } else {
                merge.Overseas.notify = "京东商城-国际: 成功, 明细: 无京豆 🐶";
              }
            } else {
              console.log("\n" + "京东商城-国际签到失败 " + Details);
              merge.Overseas.fail = 1;
              if (data.match(/(\"code\":\"13\"|重复签到)/)) {
                merge.Overseas.notify = "京东商城-国际: 失败, 原因: 已签过 ⚠️";
              } else if (data.match(/\"code\":\"-1\"/)) {
                merge.Overseas.notify =
                  "京东商城-国际: 失败, 原因: Cookie失效‼️";
              } else {
                merge.Overseas.notify = "京东商城-国际: 失败, 原因: 未知 ⚠️";
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-国际", "Overseas", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function JingDongGetCash(s) {
  return new Promise((resolve) => {
    if (disable("JDGetCash")) return resolve();
    setTimeout(() => {
      const GetCashUrl = {
        url: "https://api.m.jd.com/client.action?functionId=cash_sign&body=%7B%22remind%22%3A0%2C%22inviteCode%22%3A%22%22%2C%22type%22%3A0%2C%22breakReward%22%3A0%7D&client=apple&clientVersion=9.0.8&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&sign=7e2f8bcec13978a691567257af4fdce9&st=1596954745073&sv=111",
        headers: {
          Cookie: KEY,
        },
      };
      $nobyda.get(GetCashUrl, function (error, response, data) {
        try {
          if (error) {
            throw new Error(error);
          } else {
            const cc = JSON.parse(data);
            const Details = LogDetails ? "response:\n" + data : "";
            if (cc.data.success) {
              console.log("\n" + "京东商城-现金签到成功 " + Details);
              merge.JDGetCash.success = 1;
              if (cc.data.result && cc.data.result.signCash) {
                merge.JDGetCash.Cash = cc.data.result.signCash;
                merge.JDGetCash.notify =
                  "京东商城-现金: 成功, 明细: " +
                  merge.JDGetCash.Cash +
                  "现金 💰";
              } else {
                merge.JDGetCash.notify = "京东商城-现金: 成功, 明细: 无现金 💰";
              }
            } else {
              console.log("\n" + "京东商城-现金签到失败 " + Details);
              merge.JDGetCash.fail = 1;
              if (data.match(/\"bizCode\":201|已经签过/)) {
                merge.JDGetCash.notify = "京东商城-现金: 失败, 原因: 已签过 ⚠️";
              } else if (data.match(/\"code\":300|退出登录/)) {
                merge.JDGetCash.notify =
                  "京东商城-现金: 失败, 原因: Cookie失效‼️";
              } else {
                merge.JDGetCash.notify = "京东商城-现金: 失败, 原因: 未知 ⚠️";
              }
            }
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-现金", "JDGetCash", eor);
        } finally {
          resolve();
        }
      });
    }, s);
    if (out) setTimeout(resolve, out + s);
  });
}

function TotalSteel() {
  return new Promise((resolve) => {
    if (disable("TSteel")) return resolve();
    const SteelUrl = {
      url: "https://coin.jd.com/m/gb/getBaseInfo.html",
      headers: {
        Cookie: KEY,
      },
    };
    $nobyda.get(SteelUrl, function (error, response, data) {
      try {
        if (!error) {
          const Details = LogDetails ? "response:\n" + data : "";
          if (data.match(/(\"gbBalance\":\d+)/)) {
            console.log("\n" + "京东-总钢镚查询成功 " + Details);
            const cc = JSON.parse(data);
            merge.JRSteel.TSteel = cc.gbBalance;
          } else {
            console.log("\n" + "京东-总钢镚查询失败 " + Details);
          }
        } else {
          throw new Error(error);
        }
      } catch (eor) {
        $nobyda.AnError("账户钢镚-查询", "JRSteel", eor);
      } finally {
        resolve();
      }
    });
    if (out) setTimeout(resolve, out);
  });
}

function TotalBean() {
  return new Promise((resolve) => {
    if (disable("Qbear")) return resolve();
    const BeanUrl = {
      url: "https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2",
      headers: {
        Cookie: KEY,
        Referer: "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
      },
    };
    $nobyda.post(BeanUrl, function (error, response, data) {
      try {
        if (!error) {
          const Details = LogDetails ? "response:\n" + data : "";
          const cc = JSON.parse(data);
          if (cc.base.jdNum != 0) {
            console.log("\n" + "京东-总京豆查询成功 " + Details);
            merge.JDShake.Qbear = cc.base.jdNum;
          } else {
            console.log("\n" + "京东-总京豆查询失败 " + Details);
          }
          if (data.match(/\"nickname\" ?: ?\"(.+?)\",/)) {
            merge.JDShake.nickname = cc.base.nickname;
          } else if (data.match(/\"no ?login\.?\"/)) {
            merge.JDShake.nickname = "Cookie失效 ‼️";
          } else {
            merge.JDShake.nickname = "";
          }
        } else {
          throw new Error(error);
        }
      } catch (eor) {
        $nobyda.AnError("账户京豆-查询", "JDShake", eor);
      } finally {
        resolve();
      }
    });
    if (out) setTimeout(resolve, out);
  });
}

function TotalCash() {
  return new Promise((resolve) => {
    if (disable("TCash")) return resolve();
    const CashUrl = {
      url: "https://api.m.jd.com/client.action?functionId=myhongbao_balance",
      headers: {
        Cookie: KEY,
      },
      body: "body=%7B%22fp%22%3A%22-1%22%2C%22appToken%22%3A%22apphongbao_token%22%2C%22childActivityUrl%22%3A%22-1%22%2C%22country%22%3A%22cn%22%2C%22openId%22%3A%22-1%22%2C%22childActivityId%22%3A%22-1%22%2C%22applicantErp%22%3A%22-1%22%2C%22platformId%22%3A%22appHongBao%22%2C%22isRvc%22%3A%22-1%22%2C%22orgType%22%3A%222%22%2C%22activityType%22%3A%221%22%2C%22shshshfpb%22%3A%22-1%22%2C%22platformToken%22%3A%22apphongbao_token%22%2C%22organization%22%3A%22JD%22%2C%22pageClickKey%22%3A%22-1%22%2C%22platform%22%3A%221%22%2C%22eid%22%3A%22-1%22%2C%22appId%22%3A%22appHongBao%22%2C%22childActiveName%22%3A%22-1%22%2C%22shshshfp%22%3A%22-1%22%2C%22jda%22%3A%22-1%22%2C%22extend%22%3A%22-1%22%2C%22shshshfpa%22%3A%22-1%22%2C%22activityArea%22%3A%22-1%22%2C%22childActivityTime%22%3A%22-1%22%7D&client=apple&clientVersion=8.5.0&d_brand=apple&networklibtype=JDNetworkBaseAF&openudid=1fce88cd05c42fe2b054e846f11bdf33f016d676&sign=fdc04c3ab0ee9148f947d24fb087b55d&st=1581245397648&sv=120",
    };
    $nobyda.post(CashUrl, function (error, response, data) {
      try {
        if (!error) {
          const Details = LogDetails ? "response:\n" + data : "";
          if (data.match(/(\"totalBalance\":\d+)/)) {
            console.log("\n" + "京东-总红包查询成功 " + Details);
            const cc = JSON.parse(data);
            merge.JDCash.TCash = cc.totalBalance;
          } else {
            console.log("\n" + "京东-总红包查询失败 " + Details);
          }
        } else {
          throw new Error(error);
        }
      } catch (eor) {
        $nobyda.AnError("账户红包-查询", "JDCash", eor);
      } finally {
        resolve();
      }
    });
    if (out) setTimeout(resolve, out);
  });
}

function disable(Val, name, way) {
  const read = $nobyda.read("JD_DailyBonusDisables");
  const annal = $nobyda.read("JD_Crash_" + Val);
  if (annal && way == 1 && boxdis) {
    var Crash = $nobyda.write("", "JD_Crash_" + Val);
    if (read) {
      if (read.indexOf(Val) == -1) {
        var Crash = $nobyda.write(`${read},${Val}`, "JD_DailyBonusDisables");
        console.log(`\n${name}-触发自动禁用 ‼️`);
        merge[Val].notify = `${name}: 崩溃, 触发自动禁用 ‼️`;
        merge[Val].error = 1;
        $nobyda.disable = 1;
      }
    } else {
      var Crash = $nobyda.write(Val, "JD_DailyBonusDisables");
      console.log(`\n${name}-触发自动禁用 ‼️`);
      merge[Val].notify = `${name}: 崩溃, 触发自动禁用 ‼️`;
      merge[Val].error = 1;
      $nobyda.disable = 1;
    }
    return true;
  } else if (way == 1 && boxdis) {
    var Crash = $nobyda.write(name, "JD_Crash_" + Val);
  } else if (way == 2 && annal) {
    var Crash = $nobyda.write("", "JD_Crash_" + Val);
  }
  if (read && read.indexOf(Val) != -1) {
    return true;
  } else {
    return false;
  }
}

function initial() {
  acData = {
    // 京东商城-童装
    JDChild: "493G2Fs896uTbbRxZKGae86K3aGm",
    // 京东商城-母婴
    JDBaby: "3BbAVGQPDd6vTyHYjmAutXrKAos6",
    // 京东商城-数码
    JD3C: "4SWjnZSCTHPYjE5T7j35rxxuMTb6",
    // 京东晚市-补贴
    JDSubsidy: "xK148m4kWj5hBcTPuJUNNXH3AkJ",
    // 京东商城-钟表
    JDClocks: "2BcJPCVVzMEtMUynXkPscCSsx68W",
    // 京东商城-医药
    JDDrug: "3tqTG5sF1xCUyC6vgEF5CLCxGn7w",
    // 京东商城-超市
    JDGStore: "aNCM6yrzD6qp1Vvh5YTzeJtk7cM",
    // 京东商城-宠物
    JDPet: "37ta5sh5ocrMZF3Fz5UMJbTsL42",
    // 京东商城-图书
    JDBook: "3SC6rw5iBg66qrXPGmZMqFDwcyXi",
    // 京东拍拍-二手
    JDShand: "3S28janPLYmtFxypu37AYAGgivfp",
    // 京东商城-美妆
    JDMakeup: "2smCxzLNuam5L14zNJHYu43ovbAP",
    // 京东商城-清洁
    JDClean: "2Tjm6ay1ZbZ3v7UbriTj6kHy9dn6",
    // 京东商城-女装
    JDWomen: "DpSh7ma8JV7QAxSE2gJNro8Q2h9",
    // 京东商城-个护
    JDCare: "NJ1kd1PJWhwvhtim73VPsD1HwY3",
    // 京东商城-美食
    JDFood: "4PzvVmLSBq5K63oq4oxKcDtFtzJo",
    // 京东商城-珠宝
    JDJewels: "zHUHpTHNTaztSRfNBFNVZscyFZU",
    // 京东商城-菜场
    JDVege: "Wcu2LVCFMkBP3HraRvb7pgSpt64",
  };

  merge = {
    SpeedUp: {},
    JDBean: {},
    JDTurn: {},
    JRDoll: {},
    JRDSign: {},
    Overseas: {},
    JDFSale: {},
    JDPet: {},
    JD3C: {},
    JDChild: {},
    JDBaby: {},
    JDSubsidy: {},
    JDDrug: {},
    JDClocks: {},
    JDBook: {},
    JDGStore: {},
    JDShand: {},
    JDMakeup: {},
    JDWomen: {},
    JDCare: {},
    JDFood: {},
    JDClean: {},
    JDVege: {},
    JDJewels: {},
    JDCube: {},
    JDPrize: {},
    JRSteel: {},
    JRBean: {},
    subsidy: {},
    JDCash: {},
    JDGetCash: {},
    JDShake: {},
  };
  for (var i in merge) {
    merge[i].success = 0;
    merge[i].fail = 0;
    merge[i].error = 0;
    merge[i].bean = 0;
    merge[i].steel = 0;
    merge[i].notify = "";
    merge[i].key = 0;
    merge[i].TSteel = 0;
    merge[i].Cash = 0;
    merge[i].TCash = 0;
    merge[i].Qbear = 0;
    merge[i].nickname = "";
  }
}

function GetCookie() {
  try {
    if ($request.headers && $request.url.match(/api\.m\.jd\.com.*=signBean/)) {
      var CV = $request.headers["Cookie"];
      if (CV.match(/(pt_key=.+?pt_pin=|pt_pin=.+?pt_key=)/)) {
        var CookieValue = CV.match(/pt_key=.+?;/) + CV.match(/pt_pin=.+?;/);
        var CK1 = $nobyda.read("CookieJD");
        var CK2 = $nobyda.read("CookieJD2");
        var AccountOne = CK1
          ? CK1.match(/pt_pin=.+?;/)
            ? CK1.match(/pt_pin=(.+?);/)[1]
            : null
          : null;
        var AccountTwo = CK2
          ? CK2.match(/pt_pin=.+?;/)
            ? CK2.match(/pt_pin=(.+?);/)[1]
            : null
          : null;
        var UserName = CookieValue.match(/pt_pin=(.+?);/)[1];
        var DecodeName = decodeURIComponent(UserName);
        if (!AccountOne || UserName == AccountOne) {
          var CookieName = " [账号一] ";
          var CookieKey = "CookieJD";
        } else if (!AccountTwo || UserName == AccountTwo) {
          var CookieName = " [账号二] ";
          var CookieKey = "CookieJD2";
        } else {
          $nobyda.notify(
            "更新京东Cookie失败",
            "非历史写入账号 ‼️",
            '请开启脚本内"DeleteCookie"以清空Cookie ‼️'
          );
          $nobyda.done();
          return;
        }
      } else {
        $nobyda.notify(
          "写入京东Cookie失败",
          "",
          "请查看脚本内说明, 登录网页获取 ‼️"
        );
        $nobyda.done();
        return;
      }
      if ($nobyda.read(CookieKey)) {
        if ($nobyda.read(CookieKey) != CookieValue) {
          var cookie = $nobyda.write(CookieValue, CookieKey);
          if (!cookie) {
            $nobyda.notify(
              "用户名: " + DecodeName,
              "",
              "更新京东" + CookieName + "Cookie失败 ‼️"
            );
          } else {
            $nobyda.notify(
              "用户名: " + DecodeName,
              "",
              "更新京东" + CookieName + "Cookie成功 🎉"
            );
          }
        } else {
          console.log("京东: \n与历史Cookie相同, 跳过写入");
        }
      } else {
        var cookie = $nobyda.write(CookieValue, CookieKey);
        if (!cookie) {
          $nobyda.notify(
            "用户名: " + DecodeName,
            "",
            "首次写入京东" + CookieName + "Cookie失败 ‼️"
          );
        } else {
          $nobyda.notify(
            "用户名: " + DecodeName,
            "",
            "首次写入京东" + CookieName + "Cookie成功 🎉"
          );
        }
      }
    } else {
      $nobyda.notify(
        "写入京东Cookie失败",
        "",
        "请检查匹配URL或配置内脚本类型 ‼️"
      );
    }
  } catch (eor) {
    $nobyda.write("", "CookieJD");
    $nobyda.write("", "CookieJD2");
    $nobyda.notify("写入京东Cookie失败", "", "已尝试清空历史Cookie, 请重试 ⚠️");
    console.log(
      `\n写入京东Cookie出现错误 ‼️\n${JSON.stringify(
        eor
      )}\n\n${eor}\n\n${JSON.stringify($request.headers)}\n`
    );
  }
  $nobyda.done();
}
// Modified from yichahucha
function nobyda() {
  const start = Date.now();
  const isRequest = typeof $request != "undefined";
  const isSurge = typeof $httpClient != "undefined";
  const isQuanX = typeof $task != "undefined";
  const isLoon = typeof $loon != "undefined";
  const isJSBox = typeof $app != "undefined" && typeof $http != "undefined";
  const isNode = typeof require == "function" && !isJSBox;
  const NodeSet = "CookieSet.json";
  const node = (() => {
    if (isNode) {
      const request = require("request");
      const fs = require("fs");
      return {
        request,
        fs,
      };
    } else {
      return null;
    }
  })();
  const notify = (title, subtitle, message) => {
    if (isQuanX) $notify(title, subtitle, message);
    if (isSurge) $notification.post(title, subtitle, message);
    if (isNode) console.log(`${title}\n${subtitle}\n${message}`);
    if (isJSBox)
      $push.schedule({
        title: title,
        body: subtitle ? subtitle + "\n" + message : message,
      });
  };
  const write = (value, key) => {
    if (isQuanX) return $prefs.setValueForKey(value, key);
    if (isSurge) return $persistentStore.write(value, key);
    if (isNode) {
      try {
        if (!node.fs.existsSync(NodeSet))
          node.fs.writeFileSync(NodeSet, JSON.stringify({}));
        const dataValue = JSON.parse(node.fs.readFileSync(NodeSet));
        if (value) dataValue[key] = value;
        if (!value) delete dataValue[key];
        return node.fs.writeFileSync(NodeSet, JSON.stringify(dataValue));
      } catch (er) {
        return AnError("Node.js持久化写入", null, er);
      }
    }
    if (isJSBox) {
      if (!value) return $file.delete(`shared://${key}.txt`);
      return $file.write({
        data: $data({
          string: value,
        }),
        path: `shared://${key}.txt`,
      });
    }
  };
  const read = (key) => {
    if (isQuanX) return $prefs.valueForKey(key);
    if (isSurge) return $persistentStore.read(key);
    if (isNode) {
      try {
        if (!node.fs.existsSync(NodeSet)) return null;
        const dataValue = JSON.parse(node.fs.readFileSync(NodeSet));
        return dataValue[key];
      } catch (er) {
        return AnError("Node.js持久化读取", null, er);
      }
    }
    if (isJSBox) {
      if (!$file.exists(`shared://${key}.txt`)) return null;
      return $file.read(`shared://${key}.txt`).string;
    }
  };
  const adapterStatus = (response) => {
    if (response) {
      if (response.status) {
        response["statusCode"] = response.status;
      } else if (response.statusCode) {
        response["status"] = response.statusCode;
      }
    }
    return response;
  };
  const get = (options, callback) => {
    options.headers["User-Agent"] =
      "JD4iPhone/167169 (iPhone; iOS 13.4.1; Scale/3.00)";
    if (isQuanX) {
      if (typeof options == "string")
        options = {
          url: options,
        };
      options["method"] = "GET";
      //options["opts"] = {
      //  "hints": false
      //}
      $task.fetch(options).then(
        (response) => {
          callback(null, adapterStatus(response), response.body);
        },
        (reason) => callback(reason.error, null, null)
      );
    }
    if (isSurge) {
      options.headers["X-Surge-Skip-Scripting"] = false;
      $httpClient.get(options, (error, response, body) => {
        callback(error, adapterStatus(response), body);
      });
    }
    if (isNode) {
      node.request(options, (error, response, body) => {
        callback(error, adapterStatus(response), body);
      });
    }
    if (isJSBox) {
      if (typeof options == "string")
        options = {
          url: options,
        };
      options["header"] = options["headers"];
      options["handler"] = function (resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error);
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data);
        callback(error, adapterStatus(resp.response), body);
      };
      $http.get(options);
    }
  };
  const post = (options, callback) => {
    options.headers["User-Agent"] =
      "JD4iPhone/167169 (iPhone; iOS 13.4.1; Scale/3.00)";
    if (options.body)
      options.headers["Content-Type"] = "application/x-www-form-urlencoded";
    if (isQuanX) {
      if (typeof options == "string")
        options = {
          url: options,
        };
      options["method"] = "POST";
      //options["opts"] = {
      //  "hints": false
      //}
      $task.fetch(options).then(
        (response) => {
          callback(null, adapterStatus(response), response.body);
        },
        (reason) => callback(reason.error, null, null)
      );
    }
    if (isSurge) {
      options.headers["X-Surge-Skip-Scripting"] = false;
      $httpClient.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body);
      });
    }
    if (isNode) {
      node.request.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body);
      });
    }
    if (isJSBox) {
      if (typeof options == "string")
        options = {
          url: options,
        };
      options["header"] = options["headers"];
      options["handler"] = function (resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error);
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data);
        callback(error, adapterStatus(resp.response), body);
      };
      $http.post(options);
    }
  };
  const AnError = (name, keyname, er) => {
    if (typeof merge != "undefined" && keyname) {
      if (!merge[keyname].notify) {
        merge[keyname].notify = `${name}: 异常, 已输出日志 ‼️`;
      } else {
        merge[keyname].notify += `\n${name}: 异常, 已输出日志 ‼️ (2)`;
      }
      merge[keyname].error = 1;
    }
    return console.log(
      `\n‼️${name}发生错误\n‼️名称: ${er.name}\n‼️描述: ${er.message}${
        JSON.stringify(er).match(/\"line\"/)
          ? `\n‼️行列: ${JSON.stringify(er)}`
          : ``
      }`
    );
  };
  const time = () => {
    const end = ((Date.now() - start) / 1000).toFixed(2);
    return console.log("\n签到用时: " + end + " 秒");
  };
  const done = (value = {}) => {
    if (isQuanX) return $done(value);
    if (isSurge) isRequest ? $done(value) : $done();
  };
  return {
    AnError,
    isRequest,
    isJSBox,
    isSurge,
    isQuanX,
    isLoon,
    isNode,
    notify,
    write,
    read,
    get,
    post,
    time,
    done,
  };
}
ReadCookie();
