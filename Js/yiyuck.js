// 自动获取声荐token（开关控制优化版）
/******************************************
适配插件开关控制，手动打开声荐小程序触发
LOON插件配置参考：
[Argument]
arg1 = switch,true,tag=抓CK开关,desc=抓成功后建议关闭
arg3 = switch,true,tag=通知提醒开关,desc=关闭后不推送

[MITM]
hostname = xcx.myinyun.com

[Script]
http-response ^https?:\/\/xcx\.myinyun\.com:4438\/napi\/wx\/.* script-path=https://raw.githubusercontent.com/leng128888/Ikuuu/main/yy_tk_switch.js, tag=声荐获取Token, enable={arg1}, argument="notify={arg3}", requires-body=true
******************************************/

(function () {
  try {
    const PERSIST_KEY = 'yy_token'; // 与签到脚本存储key一致

    // 👉 核心：读取插件传递的开关参数（notify={arg3}）
    const args = $argument ? $argument.split(",") : [];
    const notifySwitch = args.includes("notify=true"); // 匹配通知开关

    // 日志打印函数（便于排查）
    function log(msg) {
      console.log(`[声荐抓Token日志] ${msg}`);
    }

    // 通知工具函数：按开关控制是否发送
    function notify(title, subtitle, message) {
      if (notifySwitch) {
        try { 
          $notification.post(title, subtitle || '', message || ''); 
          log(`${title} | ${subtitle || ''} | ${message || ''}`);
        } catch (e) {
          log(`通知发送失败：${e.message}`);
        }
      } else {
        log(`[未通知] ${title} | ${subtitle || ''} | ${message || ''}`);
      }
    }

    // 安全写入token：保留完整Bearer格式，开关控制通知
    function safeWrite(token) {
      if (!token) return false;
      const clean = String(token).trim();
      if (!clean) return false;
      
      const ok = $persistentStore.write(clean, PERSIST_KEY);
      if (ok) {
        const preview = clean.length > 20 ? `${clean.slice(0,12)}...${clean.slice(-6)}` : clean;
        notify('✅ 声荐TOKEN 已保存', `key: ${PERSIST_KEY}`, preview);
        log(`Token保存成功，预览：${preview}`);
      } else {
        notify('❌ Myinyun 授权保存失败', `key: ${PERSIST_KEY}`, '请检查存储权限');
        log('Token保存失败，可能是存储权限问题');
      }
      return ok;
    }

    // 深度搜索token：优化关键词，覆盖更多场景
    function deepSearchForToken(obj) {
      if (!obj || typeof obj !== 'object') return null;
      const keys = ['authorization','auth','token','access_token','bearer','accessToken',
                   'userToken','loginToken','sessionToken','tokenStr','authToken'];
      const seen = new Set();
      const stack = [obj];

      while (stack.length) {
        const cur = stack.pop();
        if (!cur || typeof cur !== 'object' || seen.has(cur)) continue;
        seen.add(cur);

        for (const k of Object.keys(cur)) {
          try {
            const v = cur[k];
            const kl = String(k).toLowerCase();

            if (keys.includes(kl) && typeof v === 'string') {
              log(`深度搜索找到Token，字段：${k}，值：${v.slice(0,10)}...`);
              return v;
            }
            if (typeof v === 'string') {
              const m = v.match(/Bearer\s+([A-Za-z0-9\-\._~\+\/=]+)/i);
              if (m && m[1]) {
                log(`匹配到Bearer Token：${m[1].slice(0,10)}...`);
                return `Bearer ${m[1]}`;
              }
            } else if (typeof v === 'object') {
              stack.push(v);
            }
          } catch (e) {
            log(`字段${k}处理失败：${e.message}`);
            continue;
          }
        }
      }
      return null;
    }

    // 打印当前触发接口URL（确认匹配）
    const currentUrl = $request?.url || $response?.request?.url || '未知URL';
    log(`触发接口：${currentUrl}`);

    // 1) 优先从请求头提取token
    let headers = null;
    try { 
      if (typeof $request !== 'undefined' && $request?.headers) headers = $request.headers;
      log(`请求头：${JSON.stringify(headers || {})}`);
    } catch (e) {
      log(`获取请求头失败：${e.message}`);
    }

    try {
      if (!headers && typeof $response !== 'undefined' && $response) {
        headers = $response.request?.headers || $response.rawRequest?.headers || 
                  $response.request?._headers || $response.headers;
        // 处理数组格式rawHeaders
        if ($response.request?.rawHeaders && Array.isArray($response.request.rawHeaders)) {
          const arr = $response.request.rawHeaders;
          headers = {};
          for (let i = 0; i < arr.length; i += 2) {
            const kk = arr[i], vv = arr[i+1];
            if (kk) headers[kk] = vv;
          }
        }
        log(`响应头（补充）：${JSON.stringify(headers || {})}`);
      }
    } catch (e) {
      log(`获取响应头失败：${e.message}`);
    }

    // 解析请求头中的token
    if (headers && typeof headers === 'object') {
      const auth = headers['authorization'] || headers['Authorization'] || headers['AUTHORIZATION'];
      if (auth && safeWrite(auth)) return $done({});
      // 遍历所有请求头字段匹配关键词
      for (const k of Object.keys(headers)) {
        try {
          if (/auth|token|authorization|bearer/i.test(k) && typeof headers[k] === 'string') {
            if (safeWrite(headers[k])) return $done({});
          }
        } catch (e) {
          log(`请求头字段${k}解析失败：${e.message}`);
          continue;
        }
      }
    }

    // 2) 从响应的request对象深度搜索
    try {
      if (typeof $response !== 'undefined' && $response && $response.request) {
        const t = deepSearchForToken($response.request);
        if (t && safeWrite(t)) return $done({});
      }
    } catch (e) {
      log(`响应request搜索失败：${e.message}`);
    }

    // 3) 解析响应体（JSON+正则）
    try {
      let bodyText = '';
      if (typeof $response !== 'undefined' && $response && $response.body) bodyText = $response.body;
      else if (typeof $responseBody !== 'undefined' && $responseBody) bodyText = $responseBody;

      if (bodyText && typeof bodyText === 'string') {
        log(`响应体长度：${bodyText.length} 字符`);
        // 尝试JSON解析
        try {
          const j = JSON.parse(bodyText);
          const t = deepSearchForToken(j);
          if (t && safeWrite(t)) return $done({});
        } catch (e) {
          log(`响应体非JSON格式：${e.message}`);
        }
        // 正则匹配Bearer token
        const m = bodyText.match(/Bearer\s+([A-Za-z0-9\-\._~\+\/=]+)/i);
        if (m && m[1] && safeWrite(`Bearer ${m[1]}`)) return $done({});
        // 正则匹配其他token字段
        const m2 = bodyText.match(/(?:"access_token"|'access_token'|accessToken|token|auth)\s*[:=]\s*["']([\w\-._~+\/=]+)["']/i);
        if (m2 && m2[1] && safeWrite(`Bearer ${m2[1]}`)) return $done({});
      }
    } catch (e) {
      log(`响应体解析失败：${e.message}`);
    }

    // 4) 从raw原始数据抽取（兜底）
    try {
      const rawCandidates = [];
      if (typeof $response !== 'undefined' && $response) {
        if ($response.raw) rawCandidates.push($response.raw);
        if ($response.request && $response.request.raw) rawCandidates.push($response.request.raw);
        if ($response.request && $response.request.rawRequest) rawCandidates.push($response.request.rawRequest);
      }
      for (const raw of rawCandidates) {
        if (!raw || typeof raw !== 'string') continue;
        const m = raw.match(/Authorization:\s*(Bearer\s+[A-Za-z0-9\-\._~\+\/=]+)/i);
        if (m && m[1] && safeWrite(m[1])) return $done({});
      }
      log(`raw数据未找到Token，候选数：${rawCandidates.length}`);
    } catch (e) {
      log(`raw数据解析失败：${e.message}`);
    }

    // 所有方式未找到Token
    notify('❌ 未找到Token', '请重新打开声荐小程序', '建议进入「我的」页面刷新触发');
    log('所有搜索方式均未找到Token，已提示用户');
    return $done({});
  } catch (err) {
    // 脚本异常捕获（按通知开关控制）
    const args = $argument ? $argument.split(",") : [];
    const notifySwitch = args.includes("notify=true");
    const errMsg = String(err && err.message ? err.message : err);
    if (notifySwitch) {
      try { $notification.post('⚠️ 声荐抓Token脚本异常', errMsg, '请检查脚本或环境'); } catch (e) {}
    }
    log(`脚本异常：${errMsg}`);
    return $done({});
  }
})();