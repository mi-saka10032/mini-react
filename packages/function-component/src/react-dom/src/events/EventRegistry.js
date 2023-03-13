export const allNativeEvents = new Set();

/**
 * 注册两个阶段的事件名
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
