import { getEventTarget } from './getEventTarget'
import { getClosestInstanceFromNode } from '../client/ReactDOMComponentTree'
import { dispatchEventForPluginEventSystem } from './DOMPluginEventSystem'

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

/**
 * 此方法就是委托给容器的回调，当容器#root在捕获或者说冒泡阶段处理事件的时候执行此函数
 * @param domEventName
 * @param eventSystemFlags
 * @param targetContainer
 * @param nativeEvent
 */
export function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
    // 获取事件源，它应该是一个真实DOM
    const nativeEventTarget = getEventTarget(nativeEvent);
    const targetInst = getClosestInstanceFromNode(nativeEventTarget);
    dispatchEventForPluginEventSystem(
        domEventName, // click
        eventSystemFlags, // 0 4
        nativeEvent, // 原生事件
        targetInst, // 此真实DOM对应的fiber
        targetContainer // 目标容器
    )
}
