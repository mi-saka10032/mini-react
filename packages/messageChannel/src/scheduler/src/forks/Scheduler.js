import { peek, push } from "./SchedulerMinHeap";

// 后面再考虑实现优先队列
export function scheduleCallback(callback) {
    // 告诉浏览器在空余时间调用回调
    requestIdleCallback(callback);
}

function getCurrentTime() {
    return performance.now();
}

// Max 31 bit integer. The max integer size in V8 for 32-bit systems.
// Math.pow(2, 30) - 1
// 0b111111111111111111111111111111
const maxSigned31BitInt = 1073741823;

// Times out immediately
const IMMEDIATE_PRIORITY_TIMEOUT = -1;
// Eventually times out
const USER_BLOCKING_PRIORITY_TIMEOUT = 250;
const NORMAL_PRIORITY_TIMEOUT = 5000;
const LOW_PRIORITY_TIMEOUT = 10000;
// Never times out
const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;

export const NoPriority = 0;
export const ImmediatePriority = 1;
export const UserBlockingPriority = 2;
export const NormalPriority = 3;
export const LowPriority = 4;
export const IdlePriority = 5;
// 任务ID计数器
let taskIdCounter = 1;
// 任务最小堆
const taskQueue = [];
let scheduleHostCallback = null;
let startTime = null;
// 当前任务
let currentTask = null;

/**
 * 按优先级执行任务
 * @param priorityLevel
 * @param callback
 */
export function scheduleCallback1(priorityLevel, callback) {
    // 获取当前时间
    const currentTime = getCurrentTime();
    // 此任务的开始时间
    const startTime = currentTime;
    // 超时时间
    let timeout;
    switch (priorityLevel) {
        case ImmediatePriority:
            timeout = IMMEDIATE_PRIORITY_TIMEOUT; // -1
            break;
        case UserBlockingPriority:
            timeout = USER_BLOCKING_PRIORITY_TIMEOUT; // 250ms
            break;
        case IdlePriority:
            timeout = IDLE_PRIORITY_TIMEOUT; // 1073741823ms
            break;
        case LowPriority:
            timeout = LOW_PRIORITY_TIMEOUT; // 10000ms
            break;
        case NormalPriority:
        default:
            timeout = NORMAL_PRIORITY_TIMEOUT; // 5000ms
            break;
    }
    // 计算此任务的过期时间
    const expirationTime = startTime + timeout;
    const newTask = {
        id: taskIdCounter++,
        callback, // 回调任务函数
        priorityLevel, // 优先级别
        startTime, // 任务的开始时间
        expirationTime, // 任务的过期时间
        sortIndex: expirationTime, // 排序依据
    };
    // 向任务最小堆里面添加任务，排序的依据是过期时间，时间最短的在队列头部
    push(taskQueue, newTask);
    // flushWork执行工作，刷新工作，执行任务
    requestHostCallback(flushWork);
    return newTask;
}

/**
 * 开始执行任务队列中的任务
 * @param startTime
 */
function flushWork(startTime) {
    return workLoop(startTime);
}

function workLoop(startTime) {
    let currentTime = startTime;
    // 取出优先级最高的task
    currentTask = peek(taskQueue);
    while (currentTask !== null) {

    }
}

function requestHostCallback(flushWork) {
    // 先缓存回调函数
    scheduleHostCallback = flushWork;
    // 执行工作直到截止时间
    schedulePerformWorkUntilDeadline();
}

function schedulePerformWorkUntilDeadline() {
    if (scheduleHostCallback) {
        // 先获取开始执行任务的时间
        startTime = getCurrentTime();
        // 是否有更多的工作要做
        let hasMoreWork = true;
        try {
            // 执行flushWork，并判断有没有返回值
            hasMoreWork = scheduleHostCallback(startTime);
        } finally {
            // 执行完以后说明还有更多工作要做
            if (hasMoreWork) {
                // 继续执行
                schedulePerformWorkUntilDeadline()
            } else {
                scheduleHostCallback = null;
            }
        }
    }
}
