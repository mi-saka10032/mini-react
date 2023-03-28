import { setValueForStyles } from "react-dom/src/client/CSSPropertyOperations";
import setTextContent from "react-dom/src/client/setTextContent";
import { setValueForProperty } from "react-dom/src/client/DOMPropertyOperations";

const STYLE = "style";
const CHILDREN = "children";

function setInitialDOMProperties(tag, domElement, nextProps) {
    for (const propKey in nextProps) {
        if (nextProps.hasOwnProperty(propKey)) {
            const nextProp = nextProps[propKey];
            if (propKey === STYLE) {
                setValueForStyles(domElement, nextProp);
            } else if (propKey === CHILDREN) {
                if (typeof nextProp === "string") {
                    setTextContent(domElement, nextProp);
                } else if (typeof nextProp === "number") {
                    setTextContent(domElement, nextProp + "");
                }
            } else if (nextProp !== null) {
                setValueForProperty(domElement, propKey, nextProp);
            }
        }
    }
}

export function setInitialProperties(domElement, tag, props) {
    setInitialDOMProperties(tag, domElement, props);
}
