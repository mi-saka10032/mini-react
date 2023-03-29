export function setValueForProperty(node, name, value) {
    if (value === null) {
        node.removeAttributeNode(name);
    } else {
        node.setAttribute(name, value);
    }
}
