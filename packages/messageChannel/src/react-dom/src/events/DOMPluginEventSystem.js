import { allNativeEvents } from "./EventRegistry";
import * as SimpleEventPlugin from "./plugins/SimpleEventPlugin";
import { IS_CAPTURE_PHASE } from "./EventSystemFlags";
import { createEventListenerWrapperWithPriority } from "./ReactDOMEventListener";
import { addEventCaptureListener, addEventBubbleListener } from "./EventListener";
import { getEventTarget } from "react-dom/src/events/getEventTarget";
import { HostComponent } from "react-reconciler/src/ReactWorkTags";
import getListener from "./getListener";

SimpleEventPlugin.registerEvents();
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
    let eventSystemFlags = 0; // 默认是0，冒泡 4是捕获
    if (isCapturePhaseListener) {
        eventSystemFlags |= IS_CAPTURE_PHASE;
    }
    addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
}

function addTrappedEventListener(targetContainer, domEventName, eventSystemFlags, isCapturePhaseListener) {
    const listener = createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags);
    if (isCapturePhaseListener) {
        addEventCaptureListener(targetContainer, domEventName, listener);
    } else {
        addEventBubbleListener(targetContainer, domEventName, listener);
    }
}

export function dispatchEventForPluginEventSystem(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
    dispatchEventForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer);
}

function dispatchEventForPlugins(domEventName, eventSystemFlags, nativeEvent, targetInst, targetContainer) {
    const nativeEventTarget = getEventTarget(nativeEvent);
    // 派发事件的数组
    const dispatchQueue = [];
    extractEvents(
        dispatchQueue,
        domEventName,
        targetInst,
        nativeEvent,
        nativeEventTarget,
        eventSystemFlags,
        targetContainer,
    );
    // processDispatchQueue 处理派发事件
    processDispatchQueue(dispatchQueue, eventSystemFlags);
}

function processDispatchQueue(dispatchQueue, eventSystemFlags) {
    // 判断是否捕获阶段
    const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
    // 循环派发队列
    for (let i = 0; i <= dispatchQueue.length - 1; i++) {
        const { event, listeners } = dispatchQueue[i];
        processDispatchQueueItemsInOrder(event, listeners, inCapturePhase);
    }
}

/**
 * 合成事件的实例currentTarget是在不断变化的
 * event nativeEventTarget指的是原始事件源，永远不变
 * event currentTarget 当前的事件源，会随着事件回调执行不断变化
 * @param listener
 * @param event
 * @param currentTarget
 */
function executeDispatch(listener, event, currentTarget) {
    event.currentTarget = currentTarget;
    listener(event);
}

function processDispatchQueueItemsInOrder(event, dispatchListeners, inCapturePhase) {
    if (inCapturePhase) {
        // dispatchListeners[子，父]
        for (let i = dispatchListeners.length - 1; i >= 0; i--) {
            const { listener, currentTarget } = dispatchListeners[i];
            if (event.isPropagationStopped()) {
                return;
            }
            executeDispatch(listener, event, currentTarget);
        }
    } else {
        // dispatchListeners[父，子]
        for (let i = 0; i <= dispatchListeners.length - 1; i++) {
            const { listener, currentTarget } = dispatchListeners[i];
            if (event.isPropagationStopped()) {
                return;
            }
            executeDispatch(listener, event, currentTarget);
        }
    }
}

function extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer,
) {
    SimpleEventPlugin.extractEvents(
        dispatchQueue,
        domEventName,
        targetInst,
        nativeEvent,
        nativeEventTarget,
        eventSystemFlags,
        targetContainer,
    );
}

export function accumulateSinglePhaseListeners(targetFiber, reactName, nativeEventType, isCapturePhase) {
    const captureName = reactName + "Capture";
    const reactEventName = isCapturePhase ? captureName : reactName;
    const listeners = [];
    let instance = targetFiber;
    while (instance !== null) {
        const { stateNode, tag } = instance;
        if (tag === HostComponent && stateNode !== null) {
            const listener = getListener(instance, reactEventName);
            if (listener) {
                listeners.push(createDispatchListener(instance, listener, stateNode));
            }
        }
        instance = instance.return;
    }
    return listeners;
}

function createDispatchListener(instance, listener, currentTarget) {
    return { instance, listener, currentTarget };
}
