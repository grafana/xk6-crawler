package crawler

import (
	"errors"
	"net/http"

	"github.com/gocolly/colly/v2"
)

type wHTMLCallback func(*wHTMLElement)

type wHTMLElement struct {
	*colly.HTMLElement
	Request  *wRequest
	Response *wResponse
}

func wrapHTMLElement(e *colly.HTMLElement) *wHTMLElement {
	return &wHTMLElement{
		HTMLElement: e,
		Request:     wrapRequest(e.Request),
		Response:    wrapResponse(e.Response),
	}
}

type wHeader struct {
	*http.Header
}

func (h wHeader) Keys() []string {
	if h.Header == nil {
		return nil
	}

	hdr := *h.Header
	keys := make([]string, 0, len(hdr))

	for key := range hdr {
		keys = append(keys, key)
	}

	return keys
}

type wRequestCallback func(*wRequest)

type wRequest struct {
	*colly.Request
	URL     string
	Headers wHeader
}

func wrapRequest(req *colly.Request) *wRequest {
	return &wRequest{Request: req, URL: req.URL.String(), Headers: wHeader{Header: req.Headers}}
}

func (req *wRequest) Visit(loc string) error {
	err := req.Request.Visit(loc)

	if errors.Is(err, colly.ErrMaxDepth) || errors.Is(err, colly.ErrAlreadyVisited) {
		return nil
	}

	if errors.Is(err, colly.ErrForbiddenDomain) || errors.Is(err, colly.ErrForbiddenURL) {
		return nil
	}

	return err
}

func (req *wRequest) URLQueryParams() map[string][]string {
	return req.Request.URL.Query()
}

type wResponseCallback func(*wResponse)

type wResponse struct {
	*colly.Response
	Request *wRequest
	Headers wHeader
}

func wrapResponse(res *colly.Response) *wResponse {
	return &wResponse{
		Response: res,
		Request:  wrapRequest(res.Request),
		Headers:  wHeader{Header: res.Headers},
	}
}

func (res *wResponse) StatusText() string {
	return http.StatusText(res.StatusCode)
}

type wResponseHeadersCallback func(*wResponse)

type wScrapedCallback func(*wResponse)
