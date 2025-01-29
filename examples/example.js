import { Crawler } from "k6/x/crawler";

export default function () {
  const c = new Crawler({ max_depth: 2 });

  c.onHTML("a[href]", (e) => {
    if (e.attr("href").startsWith("/")) {
      e.request.visit(e.attr("href"));
    }
  });

  c.onResponse((r) => {
    console.log(r.status_code, r.request.url);
  });

  c.visit("https://grafana.com");
}
