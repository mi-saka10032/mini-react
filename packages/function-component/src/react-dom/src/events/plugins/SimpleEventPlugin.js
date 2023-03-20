import { registerSimpleEvents, topLevelEventsTOReactNames } from "../DOMEventProperties";
import { IS_CAPTURE_PHASE } from "react-dom/src/events/EventSystemFlags";
import { accumulateSinglePhaseListeners } from '../DOMPluginEventSystem'

function extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,// click => onClick
    eventSystemFlags,
    targetContainer,
) {
    const reactName = topLevelEventsTOReactNames.get(domEventName);
    // 检查是否捕获阶段
    const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
    // 累加单个阶段的监听
    const listeners = accumulateSinglePhaseListeners(
        targetInst,
        reactName,
        nativeEvent.type,
        inCapturePhase
    );
}

export { registerSimpleEvents as registerEvents, extractEvents };
