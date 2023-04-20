import ReactCurrentDispatcher from "./ReactCurrentDispatcher";

function resolveDispatcher() {
    const dispatcher = ReactCurrentDispatcher.current;
    return dispatcher;
}

export function useReducer(reducer, initialArg, init) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useReducer(reducer, initialArg, init);
}

export function useState(reducer, initialArg, init) {
    const dispatcher = resolveDispatcher();
    return dispatcher.useState(reducer, initialArg, init);
}

export function useEffect(create, deps) {
    const dispatcher = resolveDispatcher()
    return dispatcher.useEffect(create, deps);
}
