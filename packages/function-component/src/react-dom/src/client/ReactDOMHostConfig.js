import { setInitialProperties } from "react-dom/src/client/ReactDOMComponent";

export function shouldSetTextContent(type, props) {
    return typeof props.children === "string" || typeof props.children === "number";
}

export function createTextInstance(newText) {
    return document.createTextNode(newText);
}

export function createInstance(type, newProps, workInProgress) {
    const domElement = document.createElement(type);
    // 属性的添加TODO updateFiberProps(domElement, props);
    return domElement;
}

export function appendInitialChild(parent, child) {
    parent.appendChild(child);
}

export function finalizeInitialChildren(domElement, type, props, hostContext) {
    setInitialProperties(domElement, type, props);
}

export function appendChild(parent, child) {
    parent.appendChild(child)
}

export function insertBefore(parentInstance, child, beforeChild) {
    parentInstance.insertBefore(child, beforeChild)
}
