// 从react源码中获取工具方法和变量
import hasOwnProperty from 'shared/hasOwnProperty'
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'

const RESERVED_PROPS = {
    key: true,
    ref: true,
    __self: true,
    __source: true,
};

function hasValidKey(config) {
    return config.key !== undefined;
}

function hasValidRef(config) {
    return config.ref !== undefined;
}

function ReactElement(type, key, ref, props) {
    return {    // React元素，也称为虚拟DOM
        $$typeof: REACT_ELEMENT_TYPE,
        type,   // h1 span
        key,    // 唯一标识
        ref,    // 获取真实DOM
        props   // 属性：children,style,id等
    }
}

export function jsxDEV(type, config, maybeKey) {
    let propName; // 属性名
    const props = {}; // 属性对象
    let key = null; // 可选key，区分父节点下不同子节点
    let ref = null; // 引入，可通过ref获取真实DOM的需求
    if (typeof maybeKey !== 'undefined') {
        key = maybeKey;
    }
    if (hasValidRef(config)) {
        ref = config.ref;
    }
    for (propName in config) {
        if (hasOwnProperty.call(config, propName)
            && !hasOwnProperty.call(RESERVED_PROPS, propName)
        ) {
            props[propName] = config[propName];
        }
    }
    return ReactElement(type, key, ref, props);
}
