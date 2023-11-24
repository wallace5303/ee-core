package ehelper

import (
	"fmt"
	"strings"
)

func Mapserge(src, tgt map[string]any, itgt map[any]any) {
	mergeMaps(src, tgt, itgt)
}

func mergeMaps(src, tgt map[string]any, itgt map[any]any) {
	for sk, sv := range src {
		tk := keyExists(sk, tgt)
		if tk == "" {
			// elog.logger.Debug("", "tk", "\"\"", fmt.Sprintf("tgt[%s]", sk), sv)
			tgt[sk] = sv
			if itgt != nil {
				itgt[sk] = sv
			}
			continue
		}

		tv, ok := tgt[tk]
		if !ok {
			// elog.logger.Debug("", fmt.Sprintf("ok[%s]", tk), false, fmt.Sprintf("tgt[%s]", sk), sv)
			tgt[sk] = sv
			if itgt != nil {
				itgt[sk] = sv
			}
			continue
		}

		// svType := reflect.TypeOf(sv)
		// tvType := reflect.TypeOf(tv)
		// elog.logger.Debug(
		// 	"processing",
		// 	"key", sk,
		// 	"st", svType,
		// 	"tt", tvType,
		// 	"sv", sv,
		// 	"tv", tv,
		// )

		switch ttv := tv.(type) {
		case map[any]any:
			//elog.logger.Debug("merging maps (must convert)")
			tsv, ok := sv.(map[any]any)
			if !ok {
				// elog.logger.Error(
				// 	"Could not cast sv to map[any]any",
				// 	"key", sk,
				// 	"st", svType,
				// 	"tt", tvType,
				// 	"sv", sv,
				// 	"tv", tv,
				// )
				continue
			}

			ssv := castToMapStringInterface(tsv)
			stv := castToMapStringInterface(ttv)
			mergeMaps(ssv, stv, ttv)
		case map[string]any:
			//elog.logger.Debug("merging maps")
			tsv, ok := sv.(map[string]any)
			if !ok {
				// elog.logger.Error(
				// 	"Could not cast sv to map[string]any",
				// 	"key", sk,
				// 	"st", svType,
				// 	"tt", tvType,
				// 	"sv", sv,
				// 	"tv", tv,
				// )
				continue
			}
			mergeMaps(tsv, ttv, nil)
		default:
			//elog.logger.Debug("setting value")
			tgt[tk] = sv
			if itgt != nil {
				itgt[tk] = sv
			}
		}
	}
}

func keyExists(k string, m map[string]any) string {
	lk := strings.ToLower(k)
	for mk := range m {
		lmk := strings.ToLower(mk)
		if lmk == lk {
			return mk
		}
	}
	return ""
}

func castToMapStringInterface(
	src map[any]any,
) map[string]any {
	tgt := map[string]any{}
	for k, v := range src {
		tgt[fmt.Sprintf("%v", k)] = v
	}
	return tgt
}
