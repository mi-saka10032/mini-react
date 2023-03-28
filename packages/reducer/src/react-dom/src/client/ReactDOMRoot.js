import { createContainer, updateContainer } from "react-reconciler/src/ReactFiberReconciler";
import { listenToAllSupportedEvents } from "react-dom/src/events/DOMPluginEventSystem";

function ReactDOMRoot(internalRoot) {
    this._internalRoote = internalRoot;
}

ReactDOMRoot.prototype.render = function (children) {
    const root = this._internalRoote;
    updateContainer(children, root)
};

export function createRoot(container) { // div#root
    const root = createContainer(container);
    listenToAllSupportedEvents(container)
    return new ReactDOMRoot(root);
}
