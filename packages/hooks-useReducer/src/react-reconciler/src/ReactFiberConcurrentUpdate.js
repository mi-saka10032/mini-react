import { HostRoot } from "react-reconciler/src/ReactWorkTags";

const concurrentQueue = [];
let concurrentQueuesIndex = 0;

export function finishQueueingConcurrentUpdates() {
    const endIndex = concurrentQueuesIndex;
    concurrentQueuesIndex = 0;
    let i = 0;
    while (i < endIndex) {
        const fiber = concurrentQueue[i++];
        const queue = concurrentQueue[i++];
        const update = concurrentQueue[i++];
        // 对于同一个useReducer调动的派发队列任务，queue队列对象为同一个，以下为单向循环链表的拆剪与追加操作
        if (queue !== null && update !== null) {
            const pending = queue.pending;
            if (pending === null) {
                update.next = update;
            } else {
                update.next = pending.next;
                pending.next = update;
            }
            queue.pending = update;
        }
    }
}

/**
 * 把更新对象添加到更新队列中
 * @param fiber 函数组件对应的fiber
 * @param queue 要更新的hook对应的更新队列
 * @param update 更新对象
 */
export function enqueueConcurrentHookUpdate(fiber, queue, update) {
    enqueueUpdate(fiber, queue, update);
    return getRootForUpdatedFiber(fiber);
}

function getRootForUpdatedFiber(sourceFiber) {
    let node = sourceFiber;
    let parent = node.return;
    while (parent !== null) {
        node = parent;
        parent = node.return;
    }
    return node.tag === HostRoot ? node.stateNode : null;
}

/**
 * 把更新先缓存到concurrentQueue数组中
 * @param fiber
 * @param queue
 * @param update
 */
function enqueueUpdate(fiber, queue, update) {
    concurrentQueue[concurrentQueuesIndex++] = fiber; // 函数组件对应的fiber
    concurrentQueue[concurrentQueuesIndex++] = queue; // 要更新的hook对应的更新队列
    concurrentQueue[concurrentQueuesIndex++] = update; // 更新对象
}

/**
 * 此文件本来还需要考虑处理优先级问题
 * 现在只实现找到根节点的功能
 */
export function markUpdateLaneFromFiberToRoot(sourceFiber) {
    let node = sourceFiber; // 当前fiber
    let parent = sourceFiber.return;    // 当前fiber的父fiber
    while (parent !== null) {
        node = parent;
        parent = parent.return;
    }
    // 一直找到parent为null：根节点Fiber(HostRootFiber)
    if (node.tag === HostRoot) {
        // 返回根节点的stateNode: FiberRootNode
        return node.stateNode;
    }
    return null;
}
