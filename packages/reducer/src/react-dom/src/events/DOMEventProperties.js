import { registerTwoPhaseEvent } from "react-dom/src/events/EventRegistry";

const simpleEventPluginEvents = ["click"];
export const topLevelEventsTOReactNames = new Map();
function registerSimpleEvent(domEventName, reactName) {
    // 把原生事件名和处理函数的名字进行映射或绑定，click => onClick
    topLevelEventsTOReactNames.set(domEventName, reactName);
    registerTwoPhaseEvent(reactName, [domEventName])
}

export function registerSimpleEvents() {
    for (let i = 0; i < simpleEventPluginEvents.length; i++) {
        const eventName = simpleEventPluginEvents[i];// click
        const domEventName = eventName.toLowerCase();// click
        const capitalizeEvent = eventName[0].toUpperCase() + eventName.slice(1);// Click
        registerSimpleEvent(domEventName, `on${capitalizeEvent}`);// click onClick
    }
}
