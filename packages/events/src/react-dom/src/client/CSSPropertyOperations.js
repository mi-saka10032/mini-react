export function setValueForStyles(node, styles) {
    const { style } = node;
    for (const styleName in style) {
        if (style.hasOwnProperty(styleName)) {
            const styleValue = styles[styleName];
            style[styleName] = styleValue;
        }
    }
}
