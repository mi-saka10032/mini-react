import { setInitialProperties, diffProperties, updateProperties } from "react-dom/src/client/ReactDOMComponent";
import { precacheFiberNode, updateFiberProps } from "react-dom/src/client/ReactDOMComponentTree";

export function shouldSetTextContent(type, props) {
    return typeof props.children === "string" || typeof props.children === "number";
}

export function createTextInstance(newText) {
    return document.createTextNode(newText);
}

/**
 * 在原生组件初次挂载的时候，会通过此方法创建真实DOM
 * @param type 类型props
 * @param props 属性
 * @param internalInstanceHandle 对应的fiber
 * @returns {*}
 */
export function createInstance(type, props, internalInstanceHandle) {
    const domElement = document.createElement(type);
    // 预先缓存fiber节点到DOM节点上
    precacheFiberNode(internalInstanceHandle, domElement);
    // 属性的添加TODO
    updateFiberProps(domElement, props);
    return domElement;
}

export function appendInitialChild(parent, child) {
    parent.appendChild(child);
}

export function finalizeInitialChildren(domElement, type, props, hostContext) {
    setInitialProperties(domElement, type, props);
}

export function appendChild(parent, child) {
    parent.appendChild(child);
}

export function insertBefore(parentInstance, child, beforeChild) {
    parentInstance.insertBefore(child, beforeChild);
}

export function prepareUpdate(domElement, type, oldProps, newProps) {
    return diffProperties(domElement, type, oldProps, newProps);
}

export function commitUpdate(domElement, updatePayload, type, oldProps, newProps) {
    updateProperties(domElement, updatePayload, type, oldProps, newProps);
    updateFiberProps(domElement, newProps);
}
