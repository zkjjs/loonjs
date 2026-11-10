// Loon runtime adapter for TG@ZenMoFiShi's Txvideoad.js.
(() => {
  const sourceURL = "https://raw.githubusercontent.com/ZenmoFeiShi/Qx/5df3cafc468419e7b58b0f4a1b75df0786ab1c67/Txvideoad.js";
  const cacheKey = "zkjjs.txvideo.qx.5df3cafc468419e7b58b0f4a1b75df0786ab1c67";
  let finished = false;

  function done(result) {
    if (finished) return;
    finished = true;
    $done(result);
  }

  function adaptMessage(message) {
    if (!message || typeof message.body === "string") return message;
    const body = message.body;
    const bodyBytes = ArrayBuffer.isView(body)
      ? body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength)
      : body;
    return Object.assign({}, message, { bodyBytes });
  }

  function apply(source, save = false) {
    const run = new Function("$request", "$response", "$done", source);
    if (save) $persistentStore.write(source, cacheKey);
    const response = typeof $response === "undefined" ? undefined : $response;
    run(adaptMessage($request), adaptMessage(response), result => {
      if (result && result.bodyBytes instanceof ArrayBuffer) {
        done({ body: new Uint8Array(result.bodyBytes) });
        return;
      }
      done(result || {});
    });
    done({});
  }

  function fail(error) {
    console.log("TxvideoAD Loon: " + error);
    done({});
  }

  try {
    const cached = $persistentStore.read(cacheKey);
    if (cached) {
      apply(cached);
      return;
    }

    $httpClient.get({ url: sourceURL, timeout: 4 }, (error, response, source) => {
      if (finished) return;
      if (error || !response || response.status !== 200 ||
          typeof source !== "string" || !source.trimStart().startsWith("(() => {")) {
        fail(error || "upstream script unavailable");
        return;
      }
      try {
        apply(source, true);
      } catch (error) {
        fail(error);
      }
    });
  } catch (error) {
    fail(error);
  }
})();
