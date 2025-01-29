// Package crawler is a xk6-crawler extension module.
package crawler

import (
	"github.com/grafana/xk6-crawler/crawler"

	"go.k6.io/k6/js/modules"
)

func register() {
	modules.Register(crawler.ImportPath, crawler.New())
}

func init() { //nolint:gochecknoinits
	register()
}
