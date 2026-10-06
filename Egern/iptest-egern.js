// Original concept and parsing: Roddy-D. Native Egern adaptation, 2026-10-07.
// Configure POLICY with an exact existing Egern proxy or policy-group name.
export default async function(ctx) {
  const env = ctx.env || {};
  const policy = String(env.POLICY || '').trim();
  const mask = String(env.MaskIP || 'false').toLowerCase() === 'true';
  const timeout = 7000;
  const row = (text, color = '#E5E7EB', size = 'caption1') => ({type:'text',text:String(text),textColor:color,font:{size}});
  const panel = (children) => ({type:'widget',backgroundColor:'#111827',padding:12,gap:5,children});
  if (!policy) return panel([row('节点质量查询','#FFFFFF','headline'),row('请先设置 POLICY 为节点或策略组名称','#FFCC00')]);
  const get = async (url, headers = {}) => {
    const r = await ctx.http.get(url,{policy,timeout,headers,credentials:'omit'});
    if (r.status < 200 || r.status >= 300) throw new Error(`HTTP ${r.status}`);
    const text = await r.text();
    if (!text) throw new Error('empty response');
    return text;
  };
  const json = s => {try {return JSON.parse(s);} catch {return null;}};
  const integer = v => {if (v == null || typeof v === 'boolean' || String(v).trim() === '') return null; const n=Number(v);return Number.isFinite(n)?Math.round(n):null;};
  const validIP = v => {
    const s=String(v||'').trim();
    if (s.includes(':')) return /^[0-9a-f:.]+$/i.test(s) && (s.match(/:/g)||[]).length>=2;
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(s) && s.split('.').every(x=>Number(x)<=255);
  };
  const hideIP = ip => {
    if (!mask) return ip;
    if (!ip.includes(':')) return ip.split('.').slice(0,2).join('.')+'.*.*';
    // Expand compressed IPv6 before masking so short forms do not reveal host bits.
    let p=ip.split('::');let left=p[0]?p[0].split(':'):[];let right=p[1]?p[1].split(':'):[];
    if (p.length===2) left=[...left,...Array(Math.max(0,8-left.length-right.length)).fill('0'),...right];
    return left.slice(0,4).join(':')+':*';
  };
  const colors=['#34C759','#FFCC00','#FF9500','#FF3B30','#FF453A'];
  const missing = (name,reason='获取失败') => ({sev:null,text:`${name}：${reason}`});
  const scoreGrade = (name,value,thresholds) => {
    const n=integer(value);if(n===null||n<0||n>100)return missing(name);
    let sev=0;for(const [threshold,level] of thresholds)if(n>=threshold)sev=Math.max(sev,level);
    const labels=['低风险','中等风险','较高风险','高风险','极高风险'];return {sev,text:`${name}：${labels[sev]} (${n})`};
  };
  const boolGrade=(name,data,fields) => {
    if(!data)return missing(name);
    const entries=fields.filter(([k])=>typeof data[k]==='boolean');
    if(!entries.length)return missing(name,'未解析到风险字段');
    const hits=entries.filter(([k])=>data[k]===true).map(([,label])=>label);
    const sev=hits.some(x=>['Tor','Abuser','Attacker','Threat'].includes(x))?3:hits.length>=2?2:hits.length?1:0;
    const partial=entries.length<fields.length?'；部分字段缺失':'';
    return {sev,text:`${name}：${hits.length?hits.join('/'):'无标记'}${partial}`};
  };
  const match=(html,re)=>{const m=String(html||'').match(re);return m?m[1].trim():null;};
  let ip=null, cached=null;
  try {
    const j=json(await get('http://ip-api.com/json?lang=zh-CN'));
    if(j && j.status!=='fail' && validIP(j.query))ip=j.query;
  } catch {}
  if(!ip)try {cached=json(await get('https://api.ipapi.is/'));if(validIP(cached?.ip))ip=cached.ip;}catch{}
  if(!ip)return panel([row('节点质量查询','#FFFFFF','headline'),row('出口 IP 获取失败','#FF9500'),row(`策略：${policy}`)]);
  const q=encodeURIComponent(ip);
  const tasks={
    ippure:get('https://my.ippure.com/v1/info').then(json),
    ipapi:cached?Promise.resolve(cached):get(`https://api.ipapi.is/?q=${q}`).then(json),
    ip2:get(`https://www.ip2location.io/${q}`),
    ipinfo:get(`https://ipinfo.io/${q}`,{'User-Agent':'Mozilla/5.0','Accept':'text/html'}),
    dbip:get(`https://db-ip.com/${q}`),
    scam:get(`https://scamalytics.com/ip/${q}`),
    registry:get(`https://ipregistry.co/${q}`,{'User-Agent':'Mozilla/5.0'})
  };
  const keys=Object.keys(tasks),results=await Promise.allSettled(Object.values(tasks)),ok={};
  results.forEach((r,i)=>{if(r.status==='fulfilled')ok[keys[i]]=r.value;});
  // IPPure evaluates its request's own egress. Do not mix scores from different IPs.
  let pureGrade;
  if(!ok.ippure)pureGrade=missing('IPPure');
  else if(!validIP(ok.ippure.ip))pureGrade=missing('IPPure','未返回可核对的 IP，未计入');
  else if(String(ok.ippure.ip).toLowerCase()!==String(ip).toLowerCase())pureGrade=missing('IPPure','出口 IP 不一致，未计入');
  else pureGrade=scoreGrade('IPPure',ok.ippure.fraudScore,[[40,1],[70,3],[80,4]]);
  const h=ok.ip2||'';
  const usage=match(h,/Usage\s*Type<\/label>\s*<p[^>]*>\s*\(([A-Z]+(?:\/[A-Z]+)?)\)/i)||match(h,/Usage\s*Type<\/label>\s*<p[^>]*>\s*([A-Z]+(?:\/[A-Z]+)?)\s*</i);
  const fraud=match(h,/Fraud\s*Score<\/label>\s*<p[^>]*>\s*(\d+)/i);
  const countryMatch=h.match(/>Country<\/label>[\s\S]{0,300}?<a[^>]*>([^(<]+)\(([A-Z]{2})\)<\/a>/i);
  const city=match(h,/>City<\/label>\s*<p[^>]*>([^<]+)<\/p>/i);
  const asn=match(h,/>ASN<\/label>[\s\S]{0,300}?<a[^>]*>(\d+)<\/a>/i);
  const org=match(h,/>AS<\/label>[\s\S]{0,300}?<a[^>]*>([^<]+)<\/a>/i);
  const proxy=match(h,/>Proxy<\/label>\s*<p[^>]*>[^<]*<i[^>]*><\/i>\s*(Yes|No)/i);
  const proxyType=match(h,/Proxy\s*Type<\/label>\s*<p[^>]*>\s*([^<]+)/i);
  const threat=match(h,/>Threat<\/label>\s*<p[^>]*>\s*([^<]+)/i);
  const api=(ok.ipapi?.ip===ip)?ok.ipapi:null;
  const registry={};
  const registryFields=[['is_proxy','Proxy'],['is_tor','Tor'],['is_relay','Relay'],['is_vpn','VPN'],['is_anonymous','Anonymous'],['is_cloud_provider','Cloud Provider'],['is_abuser','Abuser'],['is_attacker','Attacker'],['is_bogon','Bogon'],['is_threat','Threat']];
  for(const [key,label]of registryFields){const v=match(ok.registry,new RegExp(`${label}</span>[\\s\\S]{0,300}?<div class="(?:positive|negative)">[\\s\\S]{0,800}?(Yes|No)</div>`,'i'));registry[key]=v===null?null:v.toLowerCase()==='yes';}
  const scamScore=match(ok.scam,/Fraud\s*Score[:\s]*(\d+)/i)||match(ok.scam,/class="score"[^>]*>(\d+)/i)||match(ok.scam,/"score"\s*:\s*(\d+)/i);
  const db=String(match(ok.dbip,/Estimated threat level for this IP address is\s*<span[^>]*>\s*([^<\s]+)\s*</i)||'').toLowerCase();
  const grades=[pureGrade,boolGrade('ipapi',api,[['is_proxy','Proxy'],['is_vpn','VPN'],['is_tor','Tor'],['is_abuser','Abuser'],['is_datacenter','Datacenter']]),scoreGrade('IP2Location.io',fraud,[[33,1],[66,3]]),scoreGrade('Scamalytics',scamScore,[[20,1],[60,3],[90,4]]),db?{sev:({high:3,medium:1,low:0})[db]??null,text:`DB-IP：${db}`} :missing('DB-IP'),boolGrade('ipregistry',registry,registryFields)];
  const types={DCH:'数据中心/服务器',WEB:'Web托管',SES:'搜索引擎',CDN:'CDN',MOB:'蜂窝移动网络',ISP:'互联网服务商（不等于住宅）',COM:'商业网络',EDU:'教育网络',GOV:'政府网络',MIL:'军用网络',ORG:'组织机构',RES:'住宅网络'};
  const hosting=usage?usage.toUpperCase().split('/').map(x=>types[x]||x).join(' / '):'未知（获取失败）';
  const country=api?.location?.country||countryMatch?.[1]?.trim()||'';
  const cc=api?.location?.country_code||countryMatch?.[2]||'';
  const town=api?.location?.city||city||'';
  const asnText=api?.asn?.asn?`AS${api.asn.asn} ${api.asn.org||''}`:asn?`AS${asn} ${org||''}`:'未知';
  const flags=/^[a-z]{2}$/i.test(cc)?String.fromCodePoint(...cc.toUpperCase().split('').map(c=>127397+c.charCodeAt(0))):'';
  const factors=[];
  if(proxy?.toLowerCase()==='yes')factors.push('IP2Location：Proxy');
  if(proxyType&&proxyType!=='-')factors.push(`IP2Location：${proxyType}`);
  if(threat&&threat!=='-')factors.push(`IP2Location 威胁：${threat}`);
  const infoTypes=['VPN','Proxy','Tor','Relay','Hosting','Residential Proxy'].filter(t=>new RegExp(`aria-label="${t}\\s+Detected"`,'i').test(ok.ipinfo||''));
  const infoASN=match(ok.ipinfo,/>ASN type<\/span>\s*<\/td>\s*<td>([^<]+)</i);
  factors.push(`ipinfo.io：${infoTypes.length?infoTypes.join('/'):infoASN?'ASN 类型 '+infoASN:'未解析到检测类型'}`);
  if(api?.is_crawler===true)factors.push('ipapi：Crawler');
  const assessed=grades.filter(g=>g.sev!==null);const max=assessed.length?Math.max(...assessed.map(g=>g.sev)):null;
  const compact=ctx.widgetFamily==='systemSmall'||String(ctx.widgetFamily||'').startsWith('accessory');
  const children=[row('节点 IP 风险汇总',max===null?'#FF9500':colors[max],'headline'),row(`IP：${hideIP(ip)}`,'#FFFFFF'),row(`策略：${policy}`),row(`位置：${flags} ${country} ${town}`.trim()),row(`ASN：${asnText}`),row(`类型：${hosting} (${usage||'-'})`),row(`评分可用：${assessed.length}/${grades.length}；缺失项不计为风险`,'#9CA3AF')];
  for(const grade of grades)children.push(row(grade.text,grade.sev===null?'#9CA3AF':colors[grade.sev]));
  if(!compact){children.push(row('—— 检测类型 ——','#FFFFFF'));for(const f of factors)children.push(row(f));children.push(row('评分为沿用原脚本的经验阈值；网页来源可能解析失败。','#9CA3AF'));}
  const result=panel(compact?[children[0],children[1],children[2],row(`可用评分 ${assessed.length}/${grades.length}`),...grades.filter(g=>g.sev!==null).slice(0,2).map(g=>row(g.text,colors[g.sev]))]:children);
  console.log(children.map(x=>x.text).join('\n'));
  return result;
}
