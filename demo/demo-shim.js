// online demo: answer /api calls from recorded data instead of the flask server
(function () {
  const realFetch = window.fetch.bind(window);
  let marketTick = 0;

  function reply(data, status) {
    return Promise.resolve(new Response(JSON.stringify(data), { status: status || 200, headers: { "Content-Type": "application/json" } }));
  }
  function keyOf(url) {
    const u = new URL(url, location.href);
    const params = [...u.searchParams.entries()]
      .map(([k, v]) => [k, k === "ticker" || k === "symbol" ? v.trim().toUpperCase().replace(/-USD$/, "") : v])
      .sort((a, b) => a[0].localeCompare(b[0]));
    return { path: u.pathname.replace(/^.*\/api\//, "/api/"), params, key: u.pathname.replace(/^.*\/api\//, "/api/") + (params.length ? "?" + params.map((p) => p.join("=")).join("&") : "") };
  }

  window.fetch = function (input, init) {
    const url = typeof input === "string" ? input : input.url;
    if (!/\/api\//.test(url)) return realFetch(input, init);
    const { path, params, key } = keyOf(url);
    const data = window.DEMO_API;

    // prices change on each call, so cycle through a few recorded snapshots
    if (path === "/api/market-data") return reply(data[path][marketTick++ % data[path].length]);
    if (key in data) return reply(data[key]);

    // walkthrough with typed numbers needs the python server, show the recorded run
    if (path === "/api/agentic/analyze" && params.some(([k, v]) => k === "symbol" && v === "WALKTHROUGH")) {
      const demo = params.some(([k, v]) => k === "demo" && v === "true") ? "true" : "false";
      return reply(data[`/api/agentic/analyze?demo=${demo}&symbol=WALKTHROUGH`]);
    }
    if (path === "/api/market-news") return reply(data["/api/market-news"]);
    return reply({ error: "The online demo only has recorded data for " + window.DEMO_TICKERS.join(", ") + ". Run the app locally to try other tickers." });
  };
})();
