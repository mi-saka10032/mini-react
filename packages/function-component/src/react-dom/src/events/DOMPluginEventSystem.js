import { allNativeEvents } from './EventRegistry'
import * as SimpleEventPlugin from './plugins/SimpleEventPlugin'

SimpleEventPlugin.registerEvents()
const listeningMarker = `_reactListening` + Math.random().toString(36).slice(2);
export function listenToAllSupportedEvents(rootContainerElement) {
    // 监听根容器div#root，只监听执行一次
    if (!rootContainerElement[listeningMarker]) {
        rootContainerElement[listeningMarker] = true;
        allNativeEvents.forEach((domEventName) => {
            listenToNativeEvent(domEventName, true, rootContainerElement);
            listenToNativeEvent(domEventName, false, rootContainerElement);
        });
    }
}

/**
 * 注册原生事件
 * @param domEventName 原生事件
 * @param isCapturePhaseListener 是否是捕获节点
 * @param target 目标DOM节点 div#root 容器节点
 */
export function listenToNativeEvent(domEventName, isCapturePhaseListener, target) {

}
