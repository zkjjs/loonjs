// ==UserScript==
// @name Business Checkout Mobile
// @namespace local.business.checkout
// @version 1.0.1
// @description 手动检查优惠资格并生成结账链接
// @match https://chatgpt.com/*
// @run-at document-idle
// @grant none
// @noframes
// ==/UserScript==
(() => {
'use strict';
if(window.top!==window.self || document.getElementById('biz-mobile-panel'))return;
const panel=document.createElement('div');
panel.id='biz-mobile-panel';
panel.style.cssText='position:fixed;right:12px;bottom:100px;z-index:2147483647;width:min(310px,90vw);padding:12px;background:white;color:#111;border:1px solid #aaa;border-radius:12px;font:14px system-ui';
const start=document.createElement('button');start.textContent='生成 Business 长链';
const status=document.createElement('pre');status.style.cssText='white-space:pre-wrap;overflow-wrap:anywhere';
const result=document.createElement('textarea');result.readOnly=true;result.hidden=true;result.style.width='100%';
const copy=document.createElement('button');copy.textContent='复制付款链接';copy.hidden=true;
copy.onclick=async()=>{try{await navigator.clipboard.writeText(result.value);status.textContent='已复制';}catch(e){result.focus();result.select();status.textContent='请手动复制';}};
panel.append(start,status,result,copy);document.body.append(panel);
const FX={US:'USD',JP:'JPY',GB:'GBP',CA:'CAD',AU:'AUD',NZ:'NZD',CH:'CHF',SE:'SEK',NO:'NOK',DK:'DKK',PL:'PLN',CZ:'CZK',HU:'HUF',TR:'TRY',IL:'ILS',AE:'AED',SA:'SAR',ZA:'ZAR',IN:'INR',KR:'KRW',SG:'SGD',HK:'HKD',TW:'TWD',TH:'THB',MY:'MYR',ID:'IDR',PH:'PHP',VN:'VND',BR:'BRL',MX:'MXN',AR:'ARS',CL:'CLP',CO:'COP',CN:'CNY',DE:'EUR',FR:'EUR',ES:'EUR',IT:'EUR',NL:'EUR',IE:'EUR',PT:'EUR',AT:'EUR',BE:'EUR',GR:'EUR',FI:'EUR',LU:'EUR',SK:'EUR',SI:'EUR',EE:'EUR',LV:'EUR',LT:'EUR',MT:'EUR',CY:'EUR',HR:'EUR'};
start.onclick=async()=>{
if(!confirm('检查优惠资格并创建未付款结账会话？'))return;
start.disabled=true;status.textContent='正在检查…';result.hidden=copy.hidden=true;result.value='';
try{
const sess=await (await fetch('/api/auth/session',{credentials:'include'})).json();
if(!sess.accessToken)throw Error('请先登录');
const headers={Authorization:'Bearer '+sess.accessToken,'ChatGPT-Account-Id':sess.account?.id||''};
async function api(path,body){const r=await fetch(path,{credentials:'include',method:body?'POST':'GET',headers:{...headers,...(body?{'content-type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});if(!r.ok)throw Error('请求失败 '+r.status);return r.json();}
const me=await api('/backend-api/me');
const promo='team-1-month-free';
const cc=await api('/backend-api/promo_campaign/check_coupon?coupon='+encodeURIComponent(promo)+'&is_coupon_from_query_param=false');
if(cc.state!=='eligible')throw Error('账号不符合优惠资格');
const country=String(me.country||'US').toUpperCase();
const d=await api('/backend-api/payments/checkout',{entry_point:'pricing_page',plan_name:'chatgptteamplan',team_plan_data:{workspace_name:String(me.name||(me.email||'').split('@')[0]||'My')+' workspace',price_interval:'month',seat_quantity:5},promo_campaign:{promo_campaign_id:promo,is_coupon_from_query_param:false},billing_details:{country,currency:FX[country]||'USD'},checkout_ui_mode:'hosted',checkout_source:'chatgpt_web_merged',cancel_url:location.origin+'/?cta_tab=business&highlight_plan=team#pricing',purchase_attempt_id:crypto.randomUUID()});
if(!d.promo_campaign)throw Error('服务器未应用优惠');
const raw=d.url||d.stripe_hosted_url||d.checkout_url||d.hosted_checkout_url||(d.checkout_session_id?(String(d.checkout_session_id).startsWith('cs_')?'https://pay.openai.com/c/pay/':'https://chatgpt.com/checkout/openai_llc/')+d.checkout_session_id:'');
if(!raw)throw Error('未返回链接');
const u=new URL(raw,location.origin);if(u.protocol!=='https:'||!['chatgpt.com','pay.openai.com'].includes(u.hostname))throw Error('链接域名异常');
result.value=u.href;result.hidden=copy.hidden=false;status.textContent='已生成链接，请核对实际付款金额及续费价格。';
}catch(e){status.textContent='错误：'+e.message;}finally{start.disabled=false;}
};
})();
