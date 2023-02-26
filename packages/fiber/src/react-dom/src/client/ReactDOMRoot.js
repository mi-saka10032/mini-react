import { createContainer } from "react-reconciler/src/ReactFiberReconciler";

function ReactDOMRoot(internalRoot) {
    this._internalRoote = internalRoot;
}

export function createRoot(container) { // div#root
    const root = createContainer(container);
    return new ReactDOMRoot(root);
}
