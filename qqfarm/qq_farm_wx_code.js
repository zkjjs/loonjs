/*
 * QQ经典农场 - 微信区 Code 捕获
 * 仅用于捕获当前设备、当前微信账号自己发起的登录授权 code。
 */

const url = $request.url || "";

function getParam(name) {
  const re = new RegExp("[?&]" + name + "=([^&#]*)", "i");
  const m = url.match(re);
  if (!m) return "";
  try {
    return decodeURIComponent(m[1]);
  } catch (_) {
    return m[1];
  }
}

const code = getParam("code");
const uin = getParam("uin");

if (!code) {
  $done({});
} else {
  const now = new Date().toISOString();

  $persistentStore.write(code, "qq_farm_wx_code");
  $persistentStore.write(now, "qq_farm_wx_code_time");

  if (uin) {
    $persistentStore.write(uin, "qq_farm_wx_uin");
  }

  console.log("[QQ农场微信区] 捕获到 code: " + code);

  $notification.post(
    "🌾 QQ农场微信区 Code",
    uin ? ("UIN: " + uin) : "已成功捕获",
    code
  );

  $done({
    response: {
      status: 404,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store"
      },
      body: "QQ Farm WX code captured by Loon."
    }
  });
}
