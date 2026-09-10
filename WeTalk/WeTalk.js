// 2026/09/10
/*
@Name: WeTalk 自动化签到 + 视频奖励（Loon 多账号版）
@Author: TG@ZenMoFiShi
@Source: https://github.com/ZenmoFeiShi/Qx/blob/main/WeTalk.js
@Loon: https://github.com/zkjjs/loonjs

请通过同目录的 WeTalk.plugin 安装。
*/

const scriptName = 'WeTalk';
const storeKey = 'wetalk_accounts_v1';
const SECRET = '0fOiukQq7jXZV2GRi9LGlO';
const API_HOST = 'api.wetalkapp.com';
const MAX_VIDEO = 5;
const VIDEO_DELAY = 8000;
const ACCOUNT_GAP = 3500;

const IOS_VERSIONS = ['17.5.1','17.6.1','17.4.1','17.2.1','16.7.8','17.6','17.3.1','18.0.1','17.1.2','16.6.1'];
const IOS_SCALES = ['2.00','3.00','3.00','2.00','3.00'];
const IPHONE_MODELS = ['iPhone14,3','iPhone13,3','iPhone15,3','iPhone16,1','iPhone14,7','iPhone13,2','iPhone15,2','iPhone12,1'];
const CFN_VERS = ['1410.0.3','1494.0.7','1568.100.1','1209.1','1474.0.4','1568.200.2'];
const DARWIN_VERS = ['22.6.0','23.5.0','23.6.0','24.0.0','22.4.0'];

function add32(a, b) { return (a + b) & 0xffffffff; }
function cmn(q, a, b, x, s, t) {
  a = add32(add32(a, q), add32(x, t));
  return add32((a << s) | (a >>> (32 - s)), b);
}
function ff(a,b,c,d,x,s,t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
function gg(a,b,c,d,x,s,t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
function hh(a,b,c,d,x,s,t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
function ii(a,b,c,d,x,s,t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }

function md5cycle(state, block) {
  let a=state[0], b=state[1], c=state[2], d=state[3];
  a=ff(a,b,c,d,block[0],7,-680876936); d=ff(d,a,b,c,block[1],12,-389564586); c=ff(c,d,a,b,block[2],17,606105819); b=ff(b,c,d,a,block[3],22,-1044525330);
  a=ff(a,b,c,d,block[4],7,-176418897); d=ff(d,a,b,c,block[5],12,1200080426); c=ff(c,d,a,b,block[6],17,-1473231341); b=ff(b,c,d,a,block[7],22,-45705983);
  a=ff(a,b,c,d,block[8],7,1770035416); d=ff(d,a,b,c,block[9],12,-1958414417); c=ff(c,d,a,b,block[10],17,-42063); b=ff(b,c,d,a,block[11],22,-1990404162);
  a=ff(a,b,c,d,block[12],7,1804603682); d=ff(d,a,b,c,block[13],12,-40341101); c=ff(c,d,a,b,block[14],17,-1502002290); b=ff(b,c,d,a,block[15],22,1236535329);
  a=gg(a,b,c,d,block[1],5,-165796510); d=gg(d,a,b,c,block[6],9,-1069501632); c=gg(c,d,a,b,block[11],14,643717713); b=gg(b,c,d,a,block[0],20,-373897302);
  a=gg(a,b,c,d,block[5],5,-701558691); d=gg(d,a,b,c,block[10],9,38016083); c=gg(c,d,a,b,block[15],14,-660478335); b=gg(b,c,d,a,block[4],20,-405537848);
  a=gg(a,b,c,d,block[9],5,568446438); d=gg(d,a,b,c,block[14],9,-1019803690); c=gg(c,d,a,b,block[3],14,-187363961); b=gg(b,c,d,a,block[8],20,1163531501);
  a=gg(a,b,c,d,block[13],5,-1444681467); d=gg(d,a,b,c,block[2],9,-51403784); c=gg(c,d,a,b,block[7],14,1735328473); b=gg(b,c,d,a,block[12],20,-1926607734);
  a=hh(a,b,c,d,block[5],4,-378558); d=hh(d,a,b,c,block[8],11,-2022574463); c=hh(c,d,a,b,block[11],16,1839030562); b=hh(b,c,d,a,block[14],23,-35309556);
  a=hh(a,b,c,d,block[1],4,-1530992060); d=hh(d,a,b,c,block[4],11,1272893353); c=hh(c,d,a,b,block[7],16,-155497632); b=hh(b,c,d,a,block[10],23,-1094730640);
  a=hh(a,b,c,d,block[13],4,681279174); d=hh(d,a,b,c,block[0],11,-358537222); c=hh(c,d,a,b,block[3],16,-722521979); b=hh(b,c,d,a,block[6],23,76029189);
  a=hh(a,b,c,d,block[9],4,-640364487); d=hh(d,a,b,c,block[12],11,-421815835); c=hh(c,d,a,b,block[15],16,530742520); b=hh(b,c,d,a,block[2],23,-995338651);
  a=ii(a,b,c,d,block[0],6,-198630844); d=ii(d,a,b,c,block[7],10,1126891415); c=ii(c,d,a,b,block[14],15,-1416354905); b=ii(b,c,d,a,block[5],21,-57434055);
  a=ii(a,b,c,d,block[12],6,1700485571); d=ii(d,a,b,c,block[3],10,-1894986606); c=ii(c,d,a,b,block[10],15,-1051523); b=ii(b,c,d,a,block[1],21,-2054922799);
  a=ii(a,b,c,d,block[8],6,1873313359); d=ii(d,a,b,c,block[15],10,-30611744); c=ii(c,d,a,b,block[6],15,-1560198380); b=ii(b,c,d,a,block[13],21,1309151649);
  a=ii(a,b,c,d,block[4],6,-145523070); d=ii(d,a,b,c,block[11],10,-1120210379); c=ii(c,d,a,b,block[2],15,718787259); b=ii(b,c,d,a,block[9],21,-343485551);
  state[0]=add32(a,state[0]); state[1]=add32(b,state[1]); state[2]=add32(c,state[2]); state[3]=add32(d,state[3]);
}

function md5block(value) {
  const output = [];
  for (let i = 0; i < 64; i += 4) output[i >> 2] = value.charCodeAt(i) + (value.charCodeAt(i+1) << 8) + (value.charCodeAt(i+2) << 16) + (value.charCodeAt(i+3) << 24);
  return output;
}

function md51(value) {
  let index;
  const length = value.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  for (index = 64; index <= length; index += 64) md5cycle(state, md5block(value.substring(index - 64, index)));
  value = value.substring(index - 64);
  const tail = Array(16).fill(0);
  for (index = 0; index < value.length; index += 1) tail[index >> 2] |= value.charCodeAt(index) << ((index % 4) << 3);
  tail[index >> 2] |= 0x80 << ((index % 4) << 3);
  if (index > 55) { md5cycle(state, tail); for (index = 0; index < 16; index += 1) tail[index] = 0; }
  tail[14] = length * 8;
  md5cycle(state, tail);
  return state;
}

const hexCharacters = '0123456789abcdef'.split('');
function rhex(number) {
  let output = '';
  for (let j = 0; j < 4; j += 1) output += hexCharacters[(number >> (j * 8 + 4)) & 15] + hexCharacters[(number >> (j * 8)) & 15];
  return output;
}
function MD5(value) { return md51(value).map(rhex).join(''); }

function getUTCSignDate() {
  const now = new Date();
  const pad = value => String(value).padStart(2, '0');
  return `${now.getUTCFullYear()}-${pad(now.getUTCMonth()+1)}-${pad(now.getUTCDate())} ${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}:${pad(now.getUTCSeconds())}`;
}

function cloneObject(value) {
  const output = {};
  Object.keys(value || {}).forEach(key => { output[key] = value[key]; });
  return output;
}

function parseRawQuery(url) {
  const query = (url.split('?')[1] || '').split('#')[0];
  const output = {};
  query.split('&').forEach(pair => {
    const index = pair.indexOf('=');
    if (pair && index >= 0) output[pair.slice(0, index)] = pair.slice(index + 1);
  });
  return output;
}

function safeDecode(value) {
  if (value === undefined || value === null) return '';
  try { return decodeURIComponent(String(value)); } catch (error) { return String(value); }
}

function emailKeyOf(paramsRaw) {
  return safeDecode(paramsRaw && paramsRaw.email).trim().toLowerCase();
}

function findHeader(headers, name) {
  const key = Object.keys(headers || {}).find(item => item.toLowerCase() === name.toLowerCase());
  return key ? headers[key] : '';
}

function saveStore(store) {
  store.version = 2;
  return $persistentStore.write(JSON.stringify(store), storeKey);
}

function migrateStore(store) {
  const accounts = {};
  const order = [];
  let changed = false;
  (store.order || Object.keys(store.accounts || {})).forEach(oldId => {
    const account = store.accounts[oldId];
    if (!account) return;
    const email = emailKeyOf(account.capture && account.capture.paramsRaw) || safeDecode(account.email).trim().toLowerCase();
    const newId = email || oldId;
    if (newId !== oldId || account.id !== newId || account.email !== email) changed = true;
    const normalized = Object.assign({}, account, { id: newId, email: email || account.email || '' });
    const previous = accounts[newId];
    if (!previous || (normalized.updatedAt || 0) >= (previous.updatedAt || 0)) accounts[newId] = normalized;
    if (!order.includes(newId)) order.push(newId);
  });
  store.accounts = accounts;
  store.order = order;
  store.version = 2;
  return { store, changed };
}

function loadStore() {
  const raw = $persistentStore.read(storeKey);
  if (!raw) return { version: 2, accounts: {}, order: [] };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.accounts) parsed.accounts = {};
    if (!Array.isArray(parsed.order)) parsed.order = Object.keys(parsed.accounts);
    const result = migrateStore(parsed);
    if (result.changed) saveStore(result.store);
    return result.store;
  } catch (error) {
    return { version: 2, accounts: {}, order: [] };
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
  return `WeTalk/30.6.0 (com.innovationworks.wetalk; build:28; iOS ${ios}) Alamofire/5.4.3`;
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
  return `https://${API_HOST}/app/${path}?${query}`;
}

function randHex(length) {
  let output = '';
  for (let i = 0; i < length; i += 1) output += Math.floor(Math.random() * 16).toString(16);
  return output.toUpperCase();
}

function genFakeDeviceId() {
  return `${randHex(8)}-${randHex(4)}-${randHex(4)}-${randHex(4)}-${randHex(12)}WeTalkIOS`;
}

function buildHeaders(capture, userAgent) {
  const headers = cloneObject(capture.headers);
  Object.keys(headers).forEach(key => {
    const lower = key.toLowerCase();
    if (['content-length', ':authority', ':method', ':path', ':scheme', 'user-agent', 'connection', 'proxy-connection', 'keep-alive'].includes(lower)) delete headers[key];
  });
  headers.Host = API_HOST;
  if (!findHeader(headers, 'accept')) headers.Accept = 'application/json';
  headers['User-Agent'] = userAgent;
  headers.Connection = 'close';
  return headers;
}

function httpGet(options) {
  return new Promise((resolve, reject) => {
    $httpClient.get(options, (error, response, body) => {
      if (error) reject({ error });
      else resolve({ status: response && (response.status || response.statusCode), headers: response && response.headers || {}, body });
    });
  });
}

function notify(title, body) {
  console.log(`【${scriptName} 通知】${title}\n${body}`);
  $notification.post(scriptName, title, body);
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function errorText(error) { return error && (error.error || error.message) || String(error); }

function runAccount(account, index, total) {
  const email = account.email || emailKeyOf(account.capture && account.capture.paramsRaw);
  const tag = `[账号${index + 1}/${total} ${account.alias || email || account.id}]`;
  const headers = buildHeaders(account.capture, buildUA(account.baseUA, account.uaSeed));
  const fakeDeviceId = genFakeDeviceId();
  const messages = [`${tag}${email ? `\n📧 ${email}` : ''}`];

  function fetchApi(path, useFakeId, retries) {
    const remaining = retries === undefined ? 3 : retries;
    const options = { url: buildUrl(path, account.capture, useFakeId ? fakeDeviceId : null), method: 'GET', headers };
    return httpGet(options).catch(error => {
      const message = errorText(error);
      if (remaining > 0 && /SSL|timeout|timed out|reset|connection|network|stream closed|closed|EOF/i.test(message)) {
        return sleep(1200).then(() => fetchApi(path, useFakeId, remaining - 1));
      }
      throw error;
    });
  }

  function videoLoop() {
    let video = 0;
    function next() {
      if (video >= MAX_VIDEO) return Promise.resolve();
      return sleep(video === 0 ? 1500 : VIDEO_DELAY).then(() => {
        video += 1;
        return fetchApi('videoBonus', true).then(response => {
          try {
            const data = JSON.parse(response.body);
            if (data.retcode === 0) {
              messages.push(`🎬 视频${video}：+${data.result && data.result.bonus || '?'} Coins`);
              return next();
            }
            messages.push(`⏸ 视频${video}：${data.retmsg}`);
          } catch (error) { messages.push(`❌ 视频${video}：解析失败`); }
          return null;
        }).catch(error => { messages.push(`❌ 视频${video}：${errorText(error)}`); });
      });
    }
    return next();
  }

  return fetchApi('queryBalanceAndBonus').then(response => {
    try {
      const data = JSON.parse(response.body);
      if (data.retcode === 0) messages.push(`💰 余额：${data.result.balance} Coins`);
      else messages.push(`⚠️ 查询：${data.retmsg}`);
    } catch (error) { messages.push('❌ 查询：解析失败'); }
    return fetchApi('checkIn');
  }).then(response => {
    try {
      const data = JSON.parse(response.body);
      if (data.retcode === 0) messages.push(`✅ 签到：${(data.result && data.result.bonusHint || data.retmsg || '').replace(/\n/g, ' ')}`);
      else messages.push(`⚠️ 签到：${data.retmsg}`);
    } catch (error) { messages.push('❌ 签到：解析失败'); }
    return videoLoop();
  }).then(() => fetchApi('queryBalanceAndBonus')).then(response => {
    try {
      const data = JSON.parse(response.body);
      if (data.retcode === 0) messages.push(`💰 最新余额：${data.result.balance} Coins`);
    } catch (error) {}
    return messages.join('\n');
  }).catch(error => {
    messages.push(`❌ 异常：${errorText(error)}`);
    return messages.join('\n');
  });
}

function captureRequest() {
  const paramsRaw = parseRawQuery($request.url);
  const email = emailKeyOf(paramsRaw);
  if (!email) {
    notify('⚠️ 抓取失败', '请求里未取到 email 参数，无法识别账号。请确认已登录后再触发抓包。');
    $done({});
    return;
  }
  const headers = cloneObject($request.headers);
  const store = loadStore();
  const previous = store.accounts[email] || {};
  const existed = !!store.accounts[email];
  const now = Date.now();
  store.accounts[email] = {
    id: email,
    email,
    alias: previous.alias || email,
    uaSeed: existed ? previous.uaSeed : store.order.length,
    baseUA: findHeader(headers, 'user-agent'),
    capture: { url: $request.url, paramsRaw, headers },
    createdAt: previous.createdAt || now,
    updatedAt: now,
  };
  if (!existed) store.order.push(email);
  saveStore(store);
  notify(existed ? '🔄 账号参数已更新' : '✅ 新账号已入库', `${email}\n当前账号总数：${store.order.length}`);
  $done({});
}

function runScheduledTask() {
  const store = loadStore();
  const ids = store.order.filter(id => store.accounts[id]);
  if (!ids.length) {
    notify('⚠️ 未抓到任何账号', '请先打开 WeTalk 触发抓包');
    $done();
    return;
  }
  const results = [];
  let chain = Promise.resolve();
  ids.forEach((id, index) => {
    chain = chain.then(() => runAccount(store.accounts[id], index, ids.length))
      .then(text => { results.push(text); })
      .then(() => index < ids.length - 1 ? sleep(ACCOUNT_GAP) : null);
  });
  chain.then(() => {
    notify(`🎉 全部完成 (${ids.length}个账号)`, results.join('\n———\n'));
    $done();
  }).catch(error => {
    notify('❌ 任务异常', `${results.join('\n———\n')}\n${errorText(error)}`);
    $done();
  });
}

if (typeof $request !== 'undefined' && $request) captureRequest();
else runScheduledTask();
