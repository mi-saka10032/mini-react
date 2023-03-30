/**
 * 此文件本来还需要考虑处理优先级问题
 * 现在只实现找到根节点的功能
 */
import { HostRoot } from "react-reconciler/src/ReactWorkTags";

const concurrentQueues = [];
let concurrentQueuesIndex = 0;

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

export function enqueueConcurrentHookUpdate(fiber, queue, update) {
    enqueueUpdate(fiber, queue, update);
    return getRootForUpdatedFiber(fiber);
}

function enqueueUpdate(fiber, queue, update) {
    concurrentQueues[concurrentQueuesIndex++] = fiber;
    concurrentQueues[concurrentQueuesIndex++] = queue;
    concurrentQueues[concurrentQueuesIndex++] = update;
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

export function finishQueueingConcurrentUpdates() {
    const endIndex = concurrentQueuesIndex;
    concurrentQueuesIndex = 0;
    let i = 0;
    while (i < endIndex) {
        const fiber = concurrentQueues[i++];
        const queue = concurrentQueues[i++];
        const update = concurrentQueues[i++];
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
