package crawler

import (
	"regexp"

	"github.com/gocolly/colly/v2"
	"github.com/grafana/sobek"
)

// options is a sets an option on a colly.Collector.
//
//nolint:tagliatelle
type options struct {
	// UserAgent is the User-Agent string used by HTTP requests.
	UserAgent string `json:"user_agent,omitempty"`
	// MaxDepth limits the recursion depth of visited URLs.
	// Set it to 0 for infinite recursion (default).
	MaxDepth int `json:"max_depth,omitempty"`
	// AllowedDomains is a domain whitelist.
	// Leave it blank to allow any domains to be visited.
	AllowedDomains []string `json:"allowed_domains,omitempty"`
	// DisallowedDomains is a domain blacklist.
	DisallowedDomains []string `json:"disallowed_domains,omitempty"`
	// DisallowedURLFilters is a list of regular expressions which restricts
	// visiting URLs. If any of the rules matches to a URL the
	// request will be stopped. DisallowedURLFilters will
	// be evaluated before URLFilters.
	// Leave it blank to allow any URLs to be visited.
	DisallowedURLFilters []string `json:"disallowed_url_filters,omitempty"`
	// URLFilters is a list of regular expressions which restricts
	// visiting URLs. If any of the rules matches to a URL the
	// request won't be stopped. DisallowedURLFilters will
	// be evaluated before URLFilters.
	// Leave it blank to allow any URLs to be visited.
	URLFilters []string `json:"url_filters,omitempty"`
	// AllowURLRevisit allows multiple downloads of the same URL.
	AllowURLRevisit bool `json:"allow_url_revisit"`
	// MaxBodySize is the limit of the retrieved response body in bytes.
	// 0 means unlimited.
	// The default value for MaxBodySize is 10MB (10 * 1024 * 1024 bytes).
	MaxBodySize int `json:"max_body_size,omitempty"`
	// CacheDir specifies a location where GET requests are cached as files.
	// When it's not defined, caching is disabled.
	CacheDir string `json:"cache_dir,omitempty"`
	// IgnoreRobotsTxt allows the Collector to ignore any restrictions set by
	// the target host's robots.txt file.  See http://www.robotstxt.org/ for more
	// information.
	IgnoreRobotsTxt bool `json:"ignore_robots_txt,omitempty"`
	// ParseHTTPErrorResponse allows parsing HTTP responses with non 2xx status codes.
	// By default, Colly parses only successful HTTP responses. Set ParseHTTPErrorResponse
	// to true to enable it.
	ParseHTTPErrorResponse bool `json:"parse_http_error_response,omitempty"`
	// ID is the unique identifier of a collector.
	ID uint32 `json:"id,omitempty"`
	// DetectCharset can enable character encoding detection for non-utf8 response bodies
	// without explicit charset declaration.
	DetectCharset bool `json:"detect_charset,omitempty"`
	// CheckHead performs a HEAD request before every GET to pre-validate the response.
	CheckHead bool `json:"check_head,omitempty"`
}

// asOptions maps JavaScript options argument to options struct.
func asOptions(value sobek.Value, runtime *sobek.Runtime) (*options, error) {
	opts := new(options)

	if err := runtime.ExportTo(value, opts); err != nil {
		return nil, err
	}

	return opts, nil
}

func compileRegexpArray(sources []string) ([]*regexp.Regexp, error) {
	res := make([]*regexp.Regexp, 0, len(sources))

	for _, src := range sources {
		re, err := regexp.Compile(src)
		if err != nil {
			return nil, err
		}

		res = append(res, re)
	}

	return res, nil
}

func (o *options) apply(c *colly.Collector) error {
	c.UserAgent = o.UserAgent
	c.MaxDepth = o.MaxDepth
	c.AllowedDomains = o.AllowedDomains
	c.DisallowedDomains = o.DisallowedDomains
	c.AllowURLRevisit = o.AllowURLRevisit
	c.MaxBodySize = o.MaxBodySize
	c.CacheDir = o.CacheDir
	c.IgnoreRobotsTxt = o.IgnoreRobotsTxt
	c.ParseHTTPErrorResponse = o.ParseHTTPErrorResponse
	c.ID = o.ID
	c.DetectCharset = o.DetectCharset
	c.CheckHead = o.CheckHead

	var err error

	c.DisallowedURLFilters, err = compileRegexpArray(o.DisallowedURLFilters)
	if err != nil {
		return err
	}

	c.URLFilters, err = compileRegexpArray(o.URLFilters)
	if err != nil {
		return err
	}

	return nil
}
