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
    const pending = updateQueue.pending;
    if (pending === null) {
        update.next = update;
    } else {
        update.next = pending.next;
        pending.next = update;
    }
    // pending要指向最后一个更新，最后一个更新next指向第一个更新
    // 单向循环链表
    updateQueue.shared.pending = update;
}
