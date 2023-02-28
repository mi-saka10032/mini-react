import { markUpdateLaneFromFiberToRoot } from "react-reconciler/src/ReactFiberConcurrentUpdate";

export function initialUpdateQueue(fiber) {
    // 创建一个新的更新队列
    const queue = {
        shared: {
            // pending是一个循环链表
            pending: null,
        },
    };
    fiber.updateQueue = queue;
}

export function createUpdate() {
    const update = {};
    return update;
}

export function enqueueUpdate(fiber, update) {
    const updateQueue = fiber.updateQueue;
    // 取出fiber上已有的老的更新链表pending
    const pending = updateQueue.shared.pending;
    if (pending === null) {
        // pending不存在则直接将新的更新链表挂载上去
        update.next = update;
    } else {
        // pending存在，注意pending为循环链表
        // 新链表update的尾部next指向老pending链表的头部（尾部的next即指向头部）
        update.next = pending.next;
        // 老pending链表尾部next指向新链表update的头部
        pending.next = update;
    }
    // 最终结果：pending要指向最后一个更新，最后一个更新next指向第一个更新，构成单向循环链表
    updateQueue.shared.pending = update;
    // 返回根节点 从当前的fiber到根节点（涉及到优先级队列，此处暂时不考虑优先级）
    return markUpdateLaneFromFiberToRoot(fiber);
}
