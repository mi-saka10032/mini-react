import { registerSimpleEvents, topLevelEventsTOReactNames } from "../DOMEventProperties";
import { IS_CAPTURE_PHASE } from "react-dom/src/events/EventSystemFlags";
import { accumulateSinglePhaseListeners } from "../DOMPluginEventSystem";
import { SyntheticMouseEvent } from '../SyntheticEvent'

/**
 * 把要执行的回调函数添加到派发队列中
 * @param dispatchQueue 派发队列，里面放置监听函数
 * @param domEventName DOM事件名，click
 * @param targetInst 目标fiber
 * @param nativeEvent 原生事件
 * @param nativeEventTarget 原生事件源
 * @param eventSystemFlags 事件系统标识 0冒泡 4捕获
 * @param targetContainer 目标容器 div#root
 */
function extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,// click => onClick
    eventSystemFlags,
    targetContainer,
) {
    const reactName = topLevelEventsTOReactNames.get(domEventName); // click => onClick
    let SyntheticEventCtor; // 合成事件的构造函数
    switch (domEventName) {
        case "click":
            SyntheticEventCtor = SyntheticMouseEvent;
            break;
        default:
            break;
    }
    // 检查是否捕获阶段
    const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0; // 是否是捕获阶段
    // 累加单个阶段的监听
    const listeners = accumulateSinglePhaseListeners(
        targetInst,
        reactName,
        nativeEvent.type,
        inCapturePhase,
    );
    // 如果有要执行的监听函数[onClickCapture, onClickCapture] = [ChildCapture, ParentCapture]
    if (listeners.length > 0) {
        const event = new SyntheticEventCtor(reactName, domEventName, null, nativeEvent, nativeEventTarget);
        dispatchQueue.push({
            event, // 合成事件实例
            listeners, // 监听函数数组
        });
    }
}

export { registerSimpleEvents as registerEvents, extractEvents };
