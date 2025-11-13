/*
 * 声荐自动任务脚本（开关控制版）
 * 功能：自动签到 + 自动领取小红花
 * 适配环境：Loon / Surge / Quantumult X
 * 更新时间：2025-11-14
 */

// ----------------------------------------------------------
// 环境封装（兼容 Loon / Surge / QX）
// ----------------------------------------------------------
const Env = (() => {
  const isQX = typeof $task !== "undefined";
  const isLoon = typeof $loon !== "undefined";
  const isSurge = typeof $httpClient !== "undefined" && typeof $loon === "undefined";

  // 读取插件传递的通知开关参数
  const args = $argument ? $argument.split(",") : [];
  const notifySwitch = args.includes("notify=true");

  // 通知函数（按开关控制）
  const notify = (title, sub, msg) => {
    if (notifySwitch) {
      if (isQX) $notify(title, sub, msg);
      else if (typeof $notification !== "undefined") $notification.post(title, sub, msg);
    }
    console.log(`${title}\n${sub}\n${msg}`);
  };

  const request = (opt, cb) => {
    if (isQX) {
      opt.method = opt.method || "GET";
      $task.fetch(opt).then(
        (res) => cb(null, res, res.body),
        (err) => cb(err)
      );
    } else if (typeof $httpClient !== "undefined") {
      const method = opt.method?.toLowerCase() || "get";
      $httpClient[method](opt, cb);
    } else {
      cb("❌ 当前环境不支持 HTTP 请求");
    }
  };

  const done = () => {
    if (typeof $done !== "undefined") $done();
  };

  const readToken = (key) => {
    return $persistentStore.read(key);
  };

  const writeToken = (key, value) => {
    $persistentStore.write(value, key);
  };

  return { notify, request, done, readToken, writeToken };
})();

// ----------------------------------------------------------
// 获取 Token（从持久化存储读取）
// ----------------------------------------------------------
const TOKEN_KEY = "yy_token";
let token = Env.readToken(TOKEN_KEY);

if (!token) {
  Env.notify(
    "🛑 声荐 Token 未配置",
    "请打开声荐小程序获取Token",
    "已开启Token获取开关，重新进入小程序即可自动抓取"
  );
  Env.done();
}

// ----------------------------------------------------------
// 公共请求头（复用原脚本配置）
// ----------------------------------------------------------
const commonHeaders = {
  "Authorization": token,
  "Content-Type": "application/json",
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.64(0x18004034) NetType/4G Language/zh_CN",
  "Referer": "https://servicewechat.com/wxa25139b08fe6e2b6/23/page-frame.html"
};

// ----------------------------------------------------------
// Step 1️⃣ 签到（复用原脚本逻辑）
// ----------------------------------------------------------
function signIn() {
  const req = {
    url: "https://xcx.myinyun.com:4438/napi/gift",
    method: "PUT",
    headers: commonHeaders,
    body: "{}"
  };

  Env.request(req, (err, res, data) => {
    if (err) {
      Env.notify("声荐签到失败", "网络错误", String(err));
      Env.done();
      return;
    }

    console.log("✅ 签到响应：" + data);
    const code = res.status || res.statusCode;

    if (code === 200) {
      Env.notify("✅ 声荐签到成功", "签到结果", "🎉已成功完成签到任务");
      claimFlower(); // 签到成功后自动领红花
    } else {
      Env.notify("⚠️ 声荐签到结果", `状态码: ${code}`, data);
      Env.done();
    }
  });
}

// ----------------------------------------------------------
// Step 2️⃣ 领取小红花（复用原脚本逻辑）
// ----------------------------------------------------------
function claimFlower() {
  const req = {
    url: "https://xcx.myinyun.com:4438/napi/flower/get",
    method: "POST",
    headers: commonHeaders,
    body: "{}"
  };

  Env.request(req, (err, res, data) => {
    if (err) {
      console.log("声荐日志: 请求失败或超时 -> " + err);
      Env.done();
      return;
    }

    if (data === "true") {
      console.log("声荐领取成功: " + data);
      const now = new Date();
      const timeString = now.toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit"
      });
      Env.notify(
        "🌸 声荐领取成功",
        "已自动领取小红花",
        `领取时间: ${timeString}`
      );
    } else {
      try {
        const json = JSON.parse(data);
        if (json.statusCode === 401) {
          Env.notify(
            "🛑 声荐认证失败",
            "Token 已过期",
            "请重新打开声荐小程序自动更新Token"
          );
        } else if (
          json.statusCode === 400 &&
          json.message.includes("未到领取时间")
        ) {
          console.log("声荐红花日志: 未到领取时间");
        } else {
          console.log("声荐日志: 未知错误 -> " + data);
        }
      } catch (e) {
        if (data === "false") {
          console.log("声荐日志: 今日已领取");
        } else {
          console.log("声荐日志: 非 JSON 响应 -> " + data);
        }
      }
    }

    Env.done();
  });
}

// ----------------------------------------------------------
// 🚀 主入口
// ----------------------------------------------------------
signIn();