package crawler

import (
	"github.com/gocolly/colly/v2"
	"github.com/grafana/sobek"
)

type crawler struct {
	*colly.Collector
}

func newCrawler(call sobek.ConstructorCall, runtime *sobek.Runtime) (*crawler, error) {
	c := new(crawler)
	c.Collector = colly.NewCollector()

	if len(call.Arguments) > 0 {
		opts, err := asOptions(call.Argument(0), runtime)
		if err != nil {
			return nil, err
		}

		if err := opts.apply(c.Collector); err != nil {
			return nil, err
		}
	}

	return c, nil
}

// Visit starts Crawlers's collecting job by creating a
// request to the URL specified in parameter.
// Visit also calls the previously provided callbacks.
func (c *crawler) Visit(location string) error {
	return c.Collector.Visit(location)
}

// OnHTML registers a function. Function will be executed on every HTML
// element matched by the GoQuery selector parameter.
func (c *crawler) OnHTML(selector string, f wHTMLCallback) {
	c.Collector.OnHTML(selector, func(e *colly.HTMLElement) {
		f(wrapHTMLElement(e))
	})
}

// OnHTMLDetach deregister a function. Function will not be execute after detached.
func (c *crawler) OnHTMLDetach(selector string) {
	c.Collector.OnHTMLDetach(selector)
}

// OnRequest registers a function. Function will be executed on every
// request made by the Crawler.
func (c *crawler) OnRequest(f wRequestCallback) {
	c.Collector.OnRequest(func(r *colly.Request) {
		f(wrapRequest(r))
	})
}

// OnResponse registers a function. Function will be executed on every response.
func (c *crawler) OnResponse(f wResponseCallback) {
	c.Collector.OnResponse(func(r *colly.Response) {
		f(wrapResponse(r))
	})
}

// OnResponseHeaders registers a function. Function will be executed on every response
// when headers and status are already received, but body is not yet read.
//
// Like in OnRequest, you can call Request.Abort to abort the transfer. This might be
// useful if, for example, you're following all hyperlinks, but want to avoid
// downloading files.
func (c *crawler) OnResponseHeaders(f wResponseHeadersCallback) {
	c.Collector.OnResponseHeaders(func(r *colly.Response) {
		f(wrapResponse(r))
	})
}

// OnScraped registers a function. Function will be executed after OnHTML, as a final part of the scraping.
func (c *crawler) OnScraped(f wScrapedCallback) {
	c.Collector.OnScraped(func(r *colly.Response) {
		f(wrapResponse(r))
	})
}
