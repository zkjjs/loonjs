// WeTalk Loon adapter
// Source: https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/WeTalk.js
// Purpose: make the original Quantumult X script runnable in Loon.

const WE_TALK_SOURCES = [
  'https://raw.githubusercontent.com/ZenmoFeiShi/Qx/main/WeTalk.js',
  'https://cdn.jsdelivr.net/gh/ZenmoFeiShi/Qx@main/WeTalk.js'
];
const SOURCE_TIMEOUT_MS = 12000;

function log(msg) {
  try { console.log('[WeTalk Loon] ' + msg); } catch (e) {}
}

function doneSafe() {
  if (typeof $done === 'function') {
    if (typeof $request !== 'undefined' && $request) $done({});
    else $done();
  }
}

var $prefs = typeof $prefs !== 'undefined' ? $prefs : {
  valueForKey: function (key) {
    if (typeof $persistentStore !== 'undefined' && $persistentStore && typeof $persistentStore.read === 'function') {
      return $persistentStore.read(key);
    }
    return null;
  },
  setValueForKey: function (value, key) {
    if (typeof $persistentStore !== 'undefined' && $persistentStore && typeof $persistentStore.write === 'function') {
      return $persistentStore.write(value, key);
    }
    return false;
  }
};

var $notify = typeof $notify !== 'undefined' ? $notify : function (title, subtitle, message) {
  if (typeof $notification !== 'undefined' && $notification && typeof $notification.post === 'function') {
    return $notification.post(title, subtitle, message);
  }
  log([title, subtitle, message].filter(Boolean).join(' '));
};

var $task = {
  fetch: function (options) {
    if (typeof $httpClient === 'undefined' || !$httpClient) {
      return Promise.reject({ error: 'Loon $httpClient 不可用' });
    }
    return new Promise(function (resolve, reject) {
      const method = String(options.method || 'GET').toLowerCase();
      const request = {
        url: options.url,
        headers: options.headers || {}
      };
      if (options.body !== undefined) request.body = options.body;

      const callback = function (error, response, body) {
        if (error) {
          reject({ error: typeof error === 'string' ? error : JSON.stringify(error) });
          return;
        }
        resolve({
          statusCode: response && (response.status || response.statusCode),
          headers: response && response.headers ? response.headers : {},
          body: body || ''
        });
      };

      if (method === 'post' && typeof $httpClient.post === 'function') return $httpClient.post(request, callback);
      if (method === 'put' && typeof $httpClient.put === 'function') return $httpClient.put(request, callback);
      if (method === 'delete' && typeof $httpClient.delete === 'function') return $httpClient.delete(request, callback);
      return $httpClient.get(request, callback);
    });
  }
};

function withTimeout(promise, ms, label) {
  return new Promise(function (resolve, reject) {
    let finished = false;
    const timer = setTimeout(function () {
      if (finished) return;
      finished = true;
      reject({ error: label + ' 超时 ' + Math.round(ms / 1000) + ' 秒' });
    }, ms);
    promise.then(function (value) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      resolve(value);
    }).catch(function (err) {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      reject(err);
    });
  });
}

function fetchSourceFrom(url) {
  log('开始加载远程脚本：' + url);
  return withTimeout($task.fetch({ url: url, method: 'GET' }), SOURCE_TIMEOUT_MS, '加载远程脚本')
    .then(function (resp) {
      const code = resp.body || '';
      if (!code || code.indexOf('const scriptName') === -1) {
        throw new Error('远程脚本内容无效');
      }
      log('远程脚本加载成功');
      return code;
    });
}

function fetchSourceSequentially(list, index, lastError) {
  index = index || 0;
  if (index >= list.length) {
    return Promise.reject(lastError || { error: '全部远程源加载失败' });
  }
  return fetchSourceFrom(list[index]).catch(function (err) {
    const msg = err && (err.error || err.message || String(err));
    log('源 ' + (index + 1) + ' 失败：' + msg);
    return fetchSourceSequentially(list, index + 1, err);
  });
}

log(typeof $request !== 'undefined' && $request ? '当前为抓包模式' : '当前为手动/定时任务模式');

fetchSourceSequentially(WE_TALK_SOURCES).then(function (code) {
  eval(code);
}).catch(function (err) {
  const msg = err && (err.error || err.message || String(err));
  log('加载失败：' + msg);
  $notify('WeTalk', 'Loon 适配器加载失败', msg + '\n如果一直卡空白，多半是 GitHub Raw/CDN 被当前网络拦截。');
  doneSafe();
});
