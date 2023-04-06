export const allNativeEvents = new Set();

/**
 * 注册两个阶段的事件名
 * 当页面中触发事件的时候，会走事件处理函数
 * 事件处理函数需要找到DOM元素对应要执行的React事件，onClick、onClickCapture等
 * @param registrationName React事件名
 * @param dependencies 原生事件数组[click]
 */
export function registerTwoPhaseEvent(registrationName, dependencies) {
    // 注册冒泡事件关系
    registerDirectEvent(registrationName, dependencies);
    // 注册捕获事件关系
    registerDirectEvent(registrationName + "Capture", dependencies);
}

export function registerDirectEvent(registrationName, dependencies) {
    for (let i = 0; i < dependencies.length; i++) {
        allNativeEvents.add(dependencies[i]); // click
    }
}
