package eutil

func MapMerge(dest map[string]interface{}, src map[string]interface{}) {
	for k, v := range src {
		if _, ok := dest[k]; ok {
			// 如果键已经存在，则需要进行特殊处理
			switch dest[k].(type) {
			case map[string]interface{}:
				// 如果目标map中该键对应的值也是map类型，则递归调用mergeMaps函数
				MapMerge(dest[k].(map[string]interface{}), v.(map[string]interface{}))
			default:
				// 否则，直接覆盖目标map中的值
				dest[k] = v
			}
		} else {
			// 如果键不存在，则直接赋值
			dest[k] = v
		}
	}
}
