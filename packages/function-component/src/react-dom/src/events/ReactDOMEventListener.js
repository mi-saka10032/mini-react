export function createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags) {
    const listenerWrapper = dispatchDiscreteEvent;
    return listenerWrapper.bind(null, domEventName, eventSystemFlags, targetContainer);
}

/**
 * 派发离散事件的监听函数
 * @param domEventName 事件名
 * @param eventSystemFlags 阶段 0冒泡 4捕获
 * @param container 容器div#root
 * @param nativeEvent 原生事件
 */
function dispatchDiscreteEvent(domEventName, eventSystemFlags, container, nativeEvent) {
    dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
}

export function dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent) {
    console.log("dispatchEvent", domEventName, eventSystemFlags, container, nativeEvent);
}
