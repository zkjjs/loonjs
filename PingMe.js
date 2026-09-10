// 2026/09/10
/*
@Name: PingMe 自动化签到 + 视频奖励（Loon 多账号版）
@Author: 怎么肥事
@Source: https://github.com/ZenmoFeiShi/Qx/blob/main/PingMe.js
@Loon: https://github.com/zkjjs/loonjs

请通过同仓库的 PingMe.plugin 安装。此版本使用 Loon 的
$persistentStore、$httpClient、$notification 和 $done 接口。
*/

const scriptName = 'PingMe';
const storeKey = 'pingme_accounts_v1';
const legacyStoreKey = 'pingme_capture_v3';
const SECRET = '0fOiukQq7jXZV2GRi9LGlO';
const MAX_VIDEO = 5;
const VIDEO_DELAY = 8000;
const ACCOUNT_GAP = 3500;

const IOS_VERSIONS = ['17.5.1','17.6.1','17.4.1','17.2.1','16.7.8','17.6','17.3.1','18.0.1','17.1.2','16.6.1'];
const IOS_SCALES = ['2.00','3.00','3.00','2.00','3.00'];
const IPHONE_MODELS = ['iPhone14,3','iPhone13,3','iPhone15,3','iPhone16,1','iPhone14,7','iPhone13,2','iPhone15,2','iPhone12,1'];
const CFN_VERS = ['1410.0.3','1494.0.7','1568.100.1','1209.1','1474.0.4','1568.200.2'];
const DARWIN_VERS = ['22.6.0','23.5.0','23.6.0','24.0.0','22.4.0'];

function MD5(string) {
  function rotateLeft(value, bits) { return (value << bits) | (value >>> (32 - bits)); }
  function addUnsigned(x, y) {
    const x4 = x & 0x40000000, y4 = y & 0x40000000;
    const x8 = x & 0x80000000, y8 = y & 0x80000000;
    const result = (x & 0x3fffffff) + (y & 0x3fffffff);
    if (x4 & y4) return result ^ 0x80000000 ^ x8 ^ y8;
    if (x4 | y4) return (result & 0x40000000)
      ? result ^ 0xc0000000 ^ x8 ^ y8
      : result ^ 0x40000000 ^ x8 ^ y8;
    return result ^ x8 ^ y8;
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return x ^ y ^ z; }
  function I(x, y, z) { return y ^ (x | (~z)); }
  function FF(a,b,c,d,x,s,ac) { return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(F(b,c,d), x), ac)), s), b); }
  function GG(a,b,c,d,x,s,ac) { return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(G(b,c,d), x), ac)), s), b); }
  function HH(a,b,c,d,x,s,ac) { return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(H(b,c,d), x), ac)), s), b); }
  function II(a,b,c,d,x,s,ac) { return addUnsigned(rotateLeft(addUnsigned(a, addUnsigned(addUnsigned(I(b,c,d), x), ac)), s), b); }
  function words(str) {
    const length = str.length;
    const count = ((((length + 8) - ((length + 8) % 64)) / 64) + 1) * 16;
    const output = Array(count - 1).fill(0);
    let i = 0;
    for (; i < length; i += 1) output[(i - (i % 4)) / 4] |= str.charCodeAt(i) << ((i % 4) * 8);
    output[(i - (i % 4)) / 4] |= 0x80 << ((i % 4) * 8);
    output[count - 2] = length << 3;
    output[count - 1] = length >>> 29;
    return output;
  }
  function hex(value) {
    let output = '';
    for (let i = 0; i <= 3; i += 1) {
      const part = `0${((value >>> (i * 8)) & 255).toString(16)}`;
      output += part.slice(-2);
    }
    return output;
  }
  const x = words(string);
  let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
  const S11=7,S12=12,S13=17,S14=22,S21=5,S22=9,S23=14,S24=20;
  const S31=4,S32=11,S33=16,S34=23,S41=6,S42=10,S43=15,S44=21;
  for (let k = 0; k < x.length; k += 16) {
    const aa=a, bb=b, cc=c, dd=d;
    a=FF(a,b,c,d,x[k],S11,0xd76aa478); d=FF(d,a,b,c,x[k+1],S12,0xe8c7b756); c=FF(c,d,a,b,x[k+2],S13,0x242070db); b=FF(b,c,d,a,x[k+3],S14,0xc1bdceee);
    a=FF(a,b,c,d,x[k+4],S11,0xf57c0faf); d=FF(d,a,b,c,x[k+5],S12,0x4787c62a); c=FF(c,d,a,b,x[k+6],S13,0xa8304613); b=FF(b,c,d,a,x[k+7],S14,0xfd469501);
    a=FF(a,b,c,d,x[k+8],S11,0x698098d8); d=FF(d,a,b,c,x[k+9],S12,0x8b44f7af); c=FF(c,d,a,b,x[k+10],S13,0xffff5bb1); b=FF(b,c,d,a,x[k+11],S14,0x895cd7be);
    a=FF(a,b,c,d,x[k+12],S11,0x6b901122); d=FF(d,a,b,c,x[k+13],S12,0xfd987193); c=FF(c,d,a,b,x[k+14],S13,0xa679438e); b=FF(b,c,d,a,x[k+15],S14,0x49b40821);
    a=GG(a,b,c,d,x[k+1],S21,0xf61e2562); d=GG(d,a,b,c,x[k+6],S22,0xc040b340); c=GG(c,d,a,b,x[k+11],S23,0x265e5a51); b=GG(b,c,d,a,x[k],S24,0xe9b6c7aa);
    a=GG(a,b,c,d,x[k+5],S21,0xd62f105d); d=GG(d,a,b,c,x[k+10],S22,0x02441453); c=GG(c,d,a,b,x[k+15],S23,0xd8a1e681); b=GG(b,c,d,a,x[k+4],S24,0xe7d3fbc8);
    a=GG(a,b,c,d,x[k+9],S21,0x21e1cde6); d=GG(d,a,b,c,x[k+14],S22,0xc33707d6); c=GG(c,d,a,b,x[k+3],S23,0xf4d50d87); b=GG(b,c,d,a,x[k+8],S24,0x455a14ed);
    a=GG(a,b,c,d,x[k+13],S21,0xa9e3e905); d=GG(d,a,b,c,x[k+2],S22,0xfcefa3f8); c=GG(c,d,a,b,x[k+7],S23,0x676f02d9); b=GG(b,c,d,a,x[k+12],S24,0x8d2a4c8a);
    a=HH(a,b,c,d,x[k+5],S31,0xfffa3942); d=HH(d,a,b,c,x[k+8],S32,0x8771f681); c=HH(c,d,a,b,x[k+11],S33,0x6d9d6122); b=HH(b,c,d,a,x[k+14],S34,0xfde5380c);
    a=HH(a,b,c,d,x[k+1],S31,0xa4beea44); d=HH(d,a,b,c,x[k+4],S32,0x4bdecfa9); c=HH(c,d,a,b,x[k+7],S33,0xf6bb4b60); b=HH(b,c,d,a,x[k+10],S34,0xbebfbc70);
    a=HH(a,b,c,d,x[k+13],S31,0x289b7ec6); d=HH(d,a,b,c,x[k],S32,0xeaa127fa); c=HH(c,d,a,b,x[k+3],S33,0xd4ef3085); b=HH(b,c,d,a,x[k+6],S34,0x04881d05);
    a=HH(a,b,c,d,x[k+9],S31,0xd9d4d039); d=HH(d,a,b,c,x[k+12],S32,0xe6db99e5); c=HH(c,d,a,b,x[k+15],S33,0x1fa27cf8); b=HH(b,c,d,a,x[k+2],S34,0xc4ac5665);
    a=II(a,b,c,d,x[k],S41,0xf4292244); d=II(d,a,b,c,x[k+7],S42,0x432aff97); c=II(c,d,a,b,x[k+14],S43,0xab9423a7); b=II(b,c,d,a,x[k+5],S44,0xfc93a039);
    a=II(a,b,c,d,x[k+12],S41,0x655b59c3); d=II(d,a,b,c,x[k+3],S42,0x8f0ccc92); c=II(c,d,a,b,x[k+10],S43,0xffeff47d); b=II(b,c,d,a,x[k+1],S44,0x85845dd1);
    a=II(a,b,c,d,x[k+8],S41,0x6fa87e4f); d=II(d,a,b,c,x[k+15],S42,0xfe2ce6e0); c=II(c,d,a,b,x[k+6],S43,0xa3014314); b=II(b,c,d,a,x[k+13],S44,0x4e0811a1);
    a=II(a,b,c,d,x[k+4],S41,0xf7537e82); d=II(d,a,b,c,x[k+11],S42,0xbd3af235); c=II(c,d,a,b,x[k+2],S43,0x2ad7d2bb); b=II(b,c,d,a,x[k+9],S44,0xeb86d391);
    a=addUnsigned(a,aa); b=addUnsigned(b,bb); c=addUnsigned(c,cc); d=addUnsigned(d,dd);
  }
  return (hex(a) + hex(b) + hex(c) + hex(d)).toLowerCase();
}

function getUTCSignDate() {
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth()+1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
}

function parseRawQuery(url) {
  const query = (url.split('?')[1] || '').split('#')[0];
  const raw = {};
  query.split('&').forEach(pair => {
    if (!pair) return;
    const index = pair.indexOf('=');
    if (index >= 0) raw[pair.slice(0, index)] = pair.slice(index + 1);
  });
  return raw;
}

function cloneObject(value) {
  const output = {};
  Object.keys(value || {}).forEach(key => { output[key] = value[key]; });
  return output;
}

function fingerprintOf(paramsRaw) {
  const drop = { sign:1, signDate:1, timestamp:1, ts:1, nonce:1, random:1, reqTime:1, reqId:1, requestId:1 };
  const base = Object.keys(paramsRaw || {}).filter(key => !drop[key]).sort().map(key => `${key}=${paramsRaw[key]}`).join('&');
  return MD5(base).slice(0, 12);
}

function decode(value) {
  try { return decodeURIComponent(value || ''); } catch (error) { return value || ''; }
}

function findHeader(headers, name) {
  const key = Object.keys(headers || {}).find(item => item.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : '';
}

function saveStore(store) {
  return $persistentStore.write(JSON.stringify(store), storeKey);
}

function migrateLegacyStore() {
  const raw = $persistentStore.read(legacyStoreKey);
  if (!raw) return null;
  try {
    const capture = JSON.parse(raw);
    const paramsRaw = capture.paramsRaw || parseRawQuery(capture.url || '');
    const id = fingerprintOf(paramsRaw);
    const now = Date.now();
    const store = { version: 1, accounts: {}, order: [id] };
    store.accounts[id] = {
      id,
      alias: '账号1',
      email: decode(paramsRaw.email),
      uaSeed: 0,
      baseUA: findHeader(capture.headers, 'user-agent'),
      capture: { url: capture.url || '', paramsRaw, headers: cloneObject(capture.headers) },
      createdAt: now,
      updatedAt: now,
    };
    saveStore(store);
    console.log(`【${scriptName}】已迁移旧版单账号数据`);
    return store;
  } catch (error) {
    console.log(`【${scriptName}】旧版数据迁移失败：${error}`);
    return null;
  }
}

function loadStore() {
  const raw = $persistentStore.read(storeKey);
  if (!raw) return migrateLegacyStore() || { version: 1, accounts: {}, order: [] };
  try {
    const store = JSON.parse(raw);
    if (!store.accounts) store.accounts = {};
    if (!Array.isArray(store.order)) store.order = Object.keys(store.accounts);
    return store;
  } catch (error) {
    return migrateLegacyStore() || { version: 1, accounts: {}, order: [] };
  }
}

function pickItem(items, seed) { return items[seed % items.length]; }

function buildUA(baseUA, seed) {
  const ios = pickItem(IOS_VERSIONS, seed);
  const scale = pickItem(IOS_SCALES, seed + 1);
  const model = pickItem(IPHONE_MODELS, seed + 2);
  const cfn = pickItem(CFN_VERS, seed + 3);
  const darwin = pickItem(DARWIN_VERS, seed + 4);
  if (baseUA && typeof baseUA === 'string') {
    let ua = baseUA;
    let changed = false;
    if (/iOS \d+(\.\d+){0,2}/.test(ua)) { ua = ua.replace(/iOS \d+(\.\d+){0,2}/, `iOS ${ios}`); changed = true; }
    if (/Scale\/\d+(\.\d+)?/.test(ua)) { ua = ua.replace(/Scale\/\d+(\.\d+)?/, `Scale/${scale}`); changed = true; }
    if (/iPhone\d+,\d+/.test(ua)) { ua = ua.replace(/iPhone\d+,\d+/, model); changed = true; }
    if (/CFNetwork\/[\d.]+/.test(ua)) { ua = ua.replace(/CFNetwork\/[\d.]+/, `CFNetwork/${cfn}`); changed = true; }
    if (/Darwin\/[\d.]+/.test(ua)) { ua = ua.replace(/Darwin\/[\d.]+/, `Darwin/${darwin}`); changed = true; }
    if (changed) return ua;
  }
  return `PingMe/1.0.0 (${model}; iOS ${ios}; Scale/${scale}) CFNetwork/${cfn} Darwin/${darwin}`;
}

function buildSignedParamsRaw(capture, overrideDeviceId) {
  const params = {};
  Object.keys(capture.paramsRaw || {}).forEach(key => {
    if (key !== 'sign' && key !== 'signDate') params[key] = capture.paramsRaw[key];
  });
  if (overrideDeviceId && params.uniquedeviceid) params.uniquedeviceid = overrideDeviceId;
  params.signDate = getUTCSignDate();
  const signBase = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
  params.sign = MD5(signBase + SECRET);
  return params;
}

function buildUrl(path, capture, overrideDeviceId) {
  const params = buildSignedParamsRaw(capture, overrideDeviceId);
  const query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
  return `https://api.pingmeapp.net/app/${path}?${query}`;
}

function randHex(length) {
  let value = '';
  for (let i = 0; i < length; i += 1) value += Math.floor(Math.random() * 16).toString(16);
  return value.toUpperCase();
}

function genFakeDeviceId() {
  return `${randHex(8)}-${randHex(4)}-${randHex(4)}-${randHex(4)}-${randHex(12)}PingMeIOS`;
}

function buildHeaders(capture, userAgent) {
  const headers = cloneObject(capture.headers);
  Object.keys(headers).forEach(key => {
    const lower = key.toLowerCase();
    if (['content-length', ':authority', ':method', ':path', ':scheme', 'user-agent', 'connection', 'proxy-connection', 'keep-alive'].includes(lower)) delete headers[key];
  });
  headers.Host = 'api.pingmeapp.net';
  if (!findHeader(headers, 'accept')) headers.Accept = 'application/json';
  headers['User-Agent'] = userAgent;
  headers.Connection = 'close';
  return headers;
}

function httpGet(options) {
  return new Promise((resolve, reject) => {
    $httpClient.get(options, (error, response, body) => {
      if (error) reject({ error });
      else resolve({ status: response && (response.status || response.statusCode), headers: (response && response.headers) || {}, body });
    });
  });
}

function notify(title, body) {
  console.log(`【${scriptName} 通知】${title}\n${body}`);
  $notification.post(scriptName, title, body);
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function errorText(error) { return error && (error.error || error.message) || String(error); }
function isDeregistered(message) { return typeof message === 'string' && message.includes('已被注销'); }
function getEmail(account) { return account.email || decode(account.capture && account.capture.paramsRaw && account.capture.paramsRaw.email); }

function removeAccounts(store, ids) {
  const removed = [];
  ids.forEach(id => {
    if (store.accounts[id]) {
      const account = store.accounts[id];
      removed.push(`${account.alias || id}${getEmail(account) ? `(${getEmail(account)})` : ''}`);
      delete store.accounts[id];
    }
    const index = store.order.indexOf(id);
    if (index >= 0) store.order.splice(index, 1);
  });
  return removed;
}

function runAccount(account, index, total) {
  const email = getEmail(account);
  const tag = `[账号${index + 1}/${total} ${account.alias || account.id}]`;
  const headers = buildHeaders(account.capture, buildUA(account.baseUA, account.uaSeed));
  const fakeDeviceId = genFakeDeviceId();
  const messages = [`${tag}${email ? `\n📧 ${email}` : ''}`];
  const state = { deregistered: false };

  function fetchApi(path, useFakeId) {
    function attempt(number) {
      const options = { url: buildUrl(path, account.capture, useFakeId ? fakeDeviceId : null), method: 'GET', headers };
      return httpGet(options).catch(error => {
        const message = errorText(error);
        if (number < 3 && /SSL|timeout|timed out|reset|connection|network|stream closed|closed|EOF/i.test(message)) {
          return sleep(1500).then(() => attempt(number + 1));
        }
        throw error;
      });
    }
    return attempt(1);
  }

  function doVideoLoop(count) {
    let index = 0;
    function next() {
      if (index >= count) return Promise.resolve();
      return sleep(index === 0 ? 1500 : VIDEO_DELAY).then(() => {
        index += 1;
        return fetchApi('videoBonus', true).then(response => {
          try {
            const data = JSON.parse(response.body);
            if (data.retcode === 0) {
              messages.push(`🎬 视频${index}：+${(data.result && data.result.bonus) || '?'} Coins`);
              return next();
            }
            messages.push(`⏸ 视频${index}：${data.retmsg}`);
          } catch (error) {
            messages.push(`❌ 视频${index}：解析失败`);
          }
          return null;
        }).catch(error => { messages.push(`❌ 视频${index}：${errorText(error)}`); });
      });
    }
    return next();
  }

  return fetchApi('queryBalanceAndBonus').then(response => {
    try {
      const data = JSON.parse(response.body);
      if (data.retcode === 0) messages.push(`💰 余额：${data.result.balance} Coins`);
      else {
        messages.push(`⚠️ 查询：${data.retmsg}`);
        state.deregistered = isDeregistered(data.retmsg);
      }
    } catch (error) { messages.push('❌ 查询：解析失败'); }
    return state.deregistered ? null : fetchApi('checkIn');
  }).then(response => {
    if (state.deregistered || !response) return null;
    try {
      const data = JSON.parse(response.body);
      if (data.retcode === 0) messages.push(`✅ 签到：${((data.result && data.result.bonusHint) || data.retmsg || '').replace(/\n/g, ' ')}`);
      else {
        messages.push(`⚠️ 签到：${data.retmsg}`);
        state.deregistered = isDeregistered(data.retmsg);
      }
    } catch (error) { messages.push('❌ 签到：解析失败'); }
    return state.deregistered ? null : doVideoLoop(MAX_VIDEO);
  }).then(() => {
    if (state.deregistered) {
      messages.push('🗑 该账号已注销，将从存储中移除');
      return null;
    }
    return fetchApi('queryBalanceAndBonus');
  }).then(response => {
    if (response) {
      try {
        const data = JSON.parse(response.body);
        if (data.retcode === 0) messages.push(`💰 最新余额：${data.result.balance} Coins`);
      } catch (error) {}
    }
    return { text: messages.join('\n'), deregistered: state.deregistered };
  }).catch(error => {
    messages.push(`❌ 异常：${errorText(error)}`);
    return { text: messages.join('\n'), deregistered: false };
  });
}

function captureRequest() {
  const paramsRaw = parseRawQuery($request.url);
  const headers = cloneObject($request.headers);
  const store = loadStore();
  const id = fingerprintOf(paramsRaw);
  const existed = !!store.accounts[id];
  const previous = store.accounts[id] || {};
  const now = Date.now();
  store.accounts[id] = {
    id,
    alias: previous.alias || `账号${store.order.length + 1}`,
    email: decode(paramsRaw.email),
    uaSeed: existed ? previous.uaSeed : store.order.length,
    baseUA: findHeader(headers, 'user-agent'),
    capture: { url: $request.url, paramsRaw, headers },
    createdAt: previous.createdAt || now,
    updatedAt: now,
  };
  if (!existed) store.order.push(id);
  saveStore(store);
  const account = store.accounts[id];
  notify(existed ? '🔄 账号参数已更新' : '✅ 新账号已入库', `${account.alias}（id:${id}）${account.email ? `\n📧 ${account.email}` : ''}\n当前账号总数：${store.order.length}`);
  $done({});
}

function runScheduledTask() {
  const store = loadStore();
  const ids = store.order.filter(id => store.accounts[id]);
  if (!ids.length) {
    notify('⚠️ 未抓到任何账号', '请先打开 PingMe 触发抓包');
    $done();
    return;
  }
  const results = [];
  const deadIds = [];
  let chain = Promise.resolve();
  ids.forEach((id, index) => {
    chain = chain.then(() => runAccount(store.accounts[id], index, ids.length)).then(result => {
      results.push(result.text);
      if (result.deregistered) deadIds.push(id);
    }).then(() => index < ids.length - 1 ? sleep(ACCOUNT_GAP) : null);
  });
  chain.then(() => {
    let extra = '';
    if (deadIds.length) {
      const freshStore = loadStore();
      const removed = removeAccounts(freshStore, deadIds);
      saveStore(freshStore);
      if (removed.length) extra = `\n———\n🗑 已移除注销账号：${removed.join('、')}（剩余${freshStore.order.length}个）`;
    }
    notify(`🎉 全部完成 (${ids.length}个账号)`, results.join('\n———\n') + extra);
    $done();
  }).catch(error => {
    notify('❌ 任务异常', `${results.join('\n———\n')}\n${errorText(error)}`);
    $done();
  });
}

if (typeof $request !== 'undefined' && $request) captureRequest();
else runScheduledTask();
