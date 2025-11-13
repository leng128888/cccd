(function () {
  try {
    const TOKEN_KEY = 'yy_token'; // 与主脚本存储key一致
    // 读取插件传递的通知开关
    const args = $argument ? $argument.split(",") : [];
    const notifySwitch = args.includes("notify=true");

    // 通知函数（按开关控制）
    function notify(title, subtitle, message) {
      if (notifySwitch) {
        try { $notification.post(title, subtitle || '', message || ''); } catch (e) {}
      }
    }

    // 安全写入Token
    function safeWrite(token) {
      if (!token) return false;
      const cleanToken = String(token).trim();
      if (!cleanToken) return false;
      
      const isSuccess = $persistentStore.write(cleanToken, TOKEN_KEY);
      if (isSuccess) {
        const preview = cleanToken.length > 20 ? `${cleanToken.slice(0,12)}...${cleanToken.slice(-6)}` : cleanToken;
        notify('✅ 声荐Token已保存', '自动抓取成功', preview);
      } else {
        notify('❌ Token保存失败', '', '未获取到有效登录态');
      }
      return isSuccess;
    }

    // 深度搜索Token（适配各种存储位置）
    function deepSearchToken(obj) {
      if (!obj || typeof obj !== 'object') return null;
      const tokenKeys = ['authorization','auth','token','access_token','bearer','accessToken'];
      const seen = new Set();
      const stack = [obj];

      while (stack.length) {
        const current = stack.pop();
        if (!current || typeof current !== 'object' || seen.has(current)) continue;
        seen.add(current);

        for (const key of Object.keys(current)) {
          try {
            const value = current[key];
            const keyLower = String(key).toLowerCase();

            if (tokenKeys.includes(keyLower) && typeof value === 'string') return value;
            if (typeof value === 'string') {
              const match = value.match(/Bearer\s+([A-Za-z0-9\-\._~\+\/=]+)/i);
              if (match && match[1]) return `Bearer ${match[1]}`;
            } else if (typeof value === 'object') {
              stack.push(value);
            }
          } catch (e) { continue; }
        }
      }
      return null;
    }

    // 1. 从请求头提取Token
    let headers = null;
    try {
      if (typeof $request !== 'undefined' && $request?.headers) headers = $request.headers;
      if (!headers && typeof $response !== 'undefined') {
        headers = $response.request?.headers || $response.headers;
      }
    } catch (e) {}

    if (headers) {
      const authHeader = headers['authorization'] || headers['Authorization'] || headers['AUTHORIZATION'];
      if (authHeader && safeWrite(authHeader)) return $done({});
      for (const key of Object.keys(headers)) {
        if (/auth|token|authorization/i.test(key) && typeof headers[key] === 'string') {
          if (safeWrite(headers[key])) return $done({});
        }
      }
    }

    // 2. 从响应体/请求对象提取Token
    try {
      let bodyText = $response?.body || $responseBody || '';
      if (bodyText) {
        const json = JSON.parse(bodyText);
        const token = deepSearchToken(json);
        if (token && safeWrite(token)) return $done({});
        const bearerMatch = bodyText.match(/Bearer\s+([A-Za-z0-9\-\._~\+\/=]+)/i);
        if (bearerMatch && bearerMatch[1]) safeWrite(`Bearer ${bearerMatch[1]}`);
      }
    } catch (e) {}

    // 未找到Token
    notify('❌ 未找到Token', '请重新打开声荐小程序', '');
    return $done({});
  } catch (err) {
    const args = $argument ? $argument.split(",") : [];
    const notifySwitch = args.includes("notify=true");
    if (notifySwitch) {
      $notification.post('Token脚本异常', String(err.message || err), '');
    }
    return $done({});
  }
})();