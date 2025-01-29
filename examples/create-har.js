import { Crawler } from "k6/x/crawler";

export default function () {
  const c = new Crawler({ max_depth: 2, user_agent: "k6/" + "0.56.0" });

  const har = {
    log: {
      version: "1.2",
      creator: {
        name: "k6",
        version: "0.56.0",
      },
      browser: {
        // This is copied from the internals of the Crawler
        name: "colly - https://github.com/gocolly/colly/v2",
        version: "v2.1.0",
      },
      entries: [],
      pages: [],
    },
  };

  let page_idx = 0;

  c.onHTML("title", (e) => {
    e.request.ctx.put("title", e.text);
  });

  c.onHTML("a[href]", (e) => {
    const href = e.attr("href");

    if (href.startsWith("/docs/k6/latest/set-up")) {
      e.request.visit(href);
    }
  });

  c.onRequest((r) => {
    let e = {
      startedDateTime: new Date().toISOString(),
      request: {
        method: r.method,
        url: r.url,
        httpVersion: "HTTP/1.1",
        headers: processHeaders(r.headers),
        queryString: processNameValuePair(r.uRLQueryParams()),
        cookies: [],
        headersSize: -1, //headersSize: countBytes(JSON.stringify(r.headers)),
        bodySize: -1, // countBytes(r.body),
      },
      cache: {},
      // While k6 does not depend on these, they enable the use of other tools that
      // use a more strict HAR format like http://www.softwareishard.com/har/viewer/
      timings: {
        send: 0,
        wait: 0,
        receive: 0,
      },
    };

    r.ctx.put("entry", JSON.stringify(e));
  });

  c.onResponse((r) => {
    const entry = JSON.parse(r.ctx.get("entry"));
    const p = page_idx++;
    const pageref = p + "_" + r.request.url;

    let now = new Date();
    let start = Date.parse(entry.startedDateTime);
    //entry.title = e.request.ctx.get("title");
    entry.time = now - start;

    entry.response = {
      status: r.status_code,
      statusText: r.statusText(),
      pageref: pageref,
      httpVersion: "HTTP/1.1",
      headers: processHeaders(r.headers),
      cookies: [],
      content: {
        size: r.body.length,
        mimeType: r.headers != null ? r.headers.values("Content-Type").join("; ") : null,
      },
      redirectURL: "",
      headersSize: -1, //headersSize: countBytes(JSON.stringify(r.headers)),
      bodySize: r.body.length,
    };

    const page = {
      startedDateTime: entry.startedDateTime,
      id: pageref,
      title: r.request.ctx.get("title"),
      pageTimings: {
        onLoad: entry.time,
      },
    };

    har.log.entries.push(entry);
    har.log.pages.push(page);
  });

  c.visit("https://grafana.com/docs/k6/latest/");

  console.log(JSON.stringify(har, null, 2));
}

function processNameValuePair(content) {
  let pairs = [];
  for (var m in content) {
    pairs.push({ name: m, value: content[m].join("; ") });
  }
  return pairs;
}

function processHeaders(header) {
  let pairs = [];
  if (header == null) {
    return pairs;
  }
  for (var k of header.keys()) {
    pairs.push({ name: k, value: header.values(k).join("; ") });
  }
  return pairs;
}
