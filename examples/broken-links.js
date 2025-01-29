import { Crawler } from "k6/x/crawler";
import { Gauge } from "k6/metrics";

const gauge = new Gauge("broken_links");
export const options = {
  thresholds: {
    broken_links: ["value<1"],
  },
};

export default function () {
  const c = new Crawler({ parse_http_error_response: true, max_depth: 10 });

  const links = {};
  const titles = {};

  // #region onhtml
  c.onHTML("title", (e) => {
    titles[e.request.url] = e.text;
  });

  c.onHTML("a[href]", (e) => {
    if (!e.attr("href").startsWith("/docs/k6/latest")) return;

    e.request.ctx.put("page_href", e.request.url);
    e.request.ctx.put("link_text", e.text);
    e.request.visit(e.attr("href"));
  });
  // #endregion onhtml

  c.onResponse((r) => {
    if (r.status_code == 200) return;

    const page_href = r.request.ctx.get("page_href");

    let entries = links[page_href];
    if (!entries) {
      entries = [];
      links[page_href] = entries;
    }

    const entry = { status: r.status_code, text: r.request.ctx.get("link_text"), href: r.request.url };

    entries.push(entry);
  });

  c.visit("https://grafana.com/docs/k6/latest");

  const all = [];

  for (const href in links) {
    let l = links[href];
    gauge.add(l.length, { href: href });
    all.push({ title: titles[href], href, links: l });
  }

  console.log(JSON.stringify(all, null, 2));
}
