// WeTalk Loon adapter
// Source: https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/WeTalk.js
// Purpose: make the original Quantumult X script runnable in Loon.

const WE_TALK_SOURCE = 'https://raw.githubusercontent.com/ZenmoFeiShi/Qx/refs/heads/main/WeTalk.js';

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
  console.log([title, subtitle, message].filter(Boolean).join(' '));
};

var $task = typeof $task !== 'undefined' ? $task : {
  fetch: function (options) {
    if (typeof $httpClient === 'undefined' || !$httpClient) {
      return Promise.reject({ error: 'Loon $httpClient is not available' });
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

function fetchSource(url) {
  if (typeof $task !== 'undefined' && $task && typeof $task.fetch === 'function') {
    return $task.fetch({ url: url, method: 'GET' }).then(function (resp) { return resp.body || ''; });
  }
  return Promise.reject({ error: 'No HTTP client available' });
}

fetchSource(WE_TALK_SOURCE).then(function (code) {
  if (!code || code.indexOf('const scriptName') === -1) {
    throw new Error('Remote WeTalk script content invalid');
  }
  eval(code);
}).catch(function (err) {
  const msg = err && (err.error || err.message || String(err));
  $notify('WeTalk', 'Loon 适配器加载失败', msg);
  if (typeof $done === 'function') {
    if (typeof $request !== 'undefined' && $request) $done({});
    else $done();
  }
});
