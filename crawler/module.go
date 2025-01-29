// Package crawler provides a javascript module for crawling web sites.
package crawler

import (
	"github.com/grafana/sobek"
	"go.k6.io/k6/js/modules"
)

// ImportPath contains module's JavaScript import path.
const ImportPath = "k6/x/crawler"

// New creates a new instance of the extension's JavaScript module.
func New() modules.Module {
	return new(rootModule)
}

// rootModule is the global module object type. It is instantiated once per test
// run and will be used to create `k6/x/crawler` module instances for each VU.
type rootModule struct{}

// NewModuleInstance implements the modules.Module interface to return
// a new instance for each VU.
func (*rootModule) NewModuleInstance(vu modules.VU) modules.Instance {
	instance := &module{}

	instance.vu = vu
	instance.exports.Default = instance
	instance.exports.Named = map[string]interface{}{
		"Crawler": instance.newCrawler,
	}

	return instance
}

// module represents an instance of the JavaScript module for every VU.
type module struct {
	exports modules.Exports
	vu      modules.VU
}

// Exports is representation of ESM exports of a module.
func (mod *module) Exports() modules.Exports {
	return mod.exports
}

func (mod *module) newCrawler(call sobek.ConstructorCall, runtime *sobek.Runtime) *sobek.Object {
	c, err := newCrawler(call, runtime)
	if err != nil {
		return runtime.NewGoError(err)
	}

	c.Collector.WithTransport(newTransport(mod.vu))

	return runtime.ToValue(c).ToObject(runtime)
}
