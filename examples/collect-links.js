import { Crawler } from "k6/x/crawler";

export default function () {
  // #region options
  const c = new Crawler({ parse_http_error_response: true, max_depth: 10 });
  // #endregion

  const links = {};
  const titles = {};

  c.onHTML("title", (e) => {
    titles[e.request.url] = e.text;
  });

  // #region context-put
  c.onHTML("a[href]", (e) => {
    if (!e.attr("href").startsWith("/blog")) return;

    e.request.ctx.put("page_href", e.request.url);
    e.request.ctx.put("link_text", e.text);
    // #endregion context-put
    e.request.visit(e.attr("href"));
  });

  // #region context-get
  c.onResponse((r) => {
    const page_href = r.request.ctx.get("page_href");
    // #endregion context-get

    let entries = links[page_href];
    if (!entries) {
      entries = [];
      links[page_href] = entries;
    }

    entries.push({ text: r.request.ctx.get("link_text"), href: r.request.url, status: r.status_code });
  });

  c.visit("https://grafana.com/blog");

  const all = [];

  for (const href in links) {
    all.push({ title: titles[href], href, links: links[href] });
  }

  console.log(JSON.stringify(all, null, 2));
}
